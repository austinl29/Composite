import { NextResponse } from "next/server";
import { getTechniqueById } from "@/lib/techniques";
import { runSynthesis, type FollowupAnswer } from "@/lib/synthesize";
import { parseUploadedFileRef } from "@/lib/uploadedFileParam";
import { getPool } from "@/lib/db";

const BUSINESS_CONTEXT_MAX_LENGTH = 2000;
const PROBLEM_MAX_LENGTH = 4000;
const ANSWER_MAX_LENGTH = 500;
const MAX_FOLLOWUP_ANSWERS = 10;
const CONFIDENCES = ["strong", "moderate", "weak"] as const;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const rawBody = (typeof body === "object" && body !== null ? body : {}) as Record<
    string,
    unknown
  >;

  const techniqueId = rawBody.techniqueId;
  if (typeof techniqueId !== "string" || techniqueId.trim().length === 0) {
    return NextResponse.json(
      { error: "Provide a non-empty 'techniqueId' string." },
      { status: 400 }
    );
  }

  const confidence = rawBody.confidence;
  if (typeof confidence !== "string" || !CONFIDENCES.includes(confidence as (typeof CONFIDENCES)[number])) {
    return NextResponse.json(
      { error: `'confidence' must be one of: ${CONFIDENCES.join(", ")}.` },
      { status: 400 }
    );
  }

  const explanation = rawBody.explanation;
  if (typeof explanation !== "string" || explanation.trim().length === 0) {
    return NextResponse.json(
      { error: "Provide a non-empty 'explanation' string (the matched technique's explanation from /api/diagnose)." },
      { status: 400 }
    );
  }

  const problem = rawBody.problem;
  if (typeof problem !== "string" || problem.trim().length === 0) {
    return NextResponse.json(
      { error: "Provide a non-empty 'problem' string." },
      { status: 400 }
    );
  }
  if (problem.length > PROBLEM_MAX_LENGTH) {
    return NextResponse.json(
      { error: `'problem' is too long (max ${PROBLEM_MAX_LENGTH} characters).` },
      { status: 400 }
    );
  }

  const rawBusinessContext = rawBody.businessContext;
  let businessContext: string | undefined;
  if (rawBusinessContext !== undefined && rawBusinessContext !== null && rawBusinessContext !== "") {
    if (typeof rawBusinessContext !== "string") {
      return NextResponse.json(
        { error: "'businessContext' must be a string if provided." },
        { status: 400 }
      );
    }
    if (rawBusinessContext.length > BUSINESS_CONTEXT_MAX_LENGTH) {
      return NextResponse.json(
        { error: `'businessContext' is too long (max ${BUSINESS_CONTEXT_MAX_LENGTH} characters).` },
        { status: 400 }
      );
    }
    businessContext = rawBusinessContext;
  }

  const rawAnswers = rawBody.followupAnswers;
  let followupAnswers: FollowupAnswer[] = [];
  if (rawAnswers !== undefined && rawAnswers !== null) {
    if (!Array.isArray(rawAnswers)) {
      return NextResponse.json(
        { error: "'followupAnswers' must be an array if provided." },
        { status: 400 }
      );
    }
    if (rawAnswers.length > MAX_FOLLOWUP_ANSWERS) {
      return NextResponse.json(
        { error: `'followupAnswers' has too many entries (max ${MAX_FOLLOWUP_ANSWERS}).` },
        { status: 400 }
      );
    }
    for (const [i, raw] of rawAnswers.entries()) {
      if (
        typeof raw !== "object" ||
        raw === null ||
        typeof (raw as Record<string, unknown>).questionId !== "string" ||
        typeof (raw as Record<string, unknown>).questionText !== "string" ||
        typeof (raw as Record<string, unknown>).answer !== "string"
      ) {
        return NextResponse.json(
          { error: `'followupAnswers[${i}]' must have string 'questionId', 'questionText', and 'answer'.` },
          { status: 400 }
        );
      }
      const answer = (raw as Record<string, unknown>).answer as string;
      if (answer.length > ANSWER_MAX_LENGTH) {
        return NextResponse.json(
          { error: `'followupAnswers[${i}].answer' is too long (max ${ANSWER_MAX_LENGTH} characters).` },
          { status: 400 }
        );
      }
    }
    followupAnswers = rawAnswers as FollowupAnswer[];
  }

  const fileResult = parseUploadedFileRef(rawBody.file);
  if (!fileResult.ok) {
    return NextResponse.json({ error: fileResult.error }, { status: 400 });
  }

  // Grounding: re-derive the technique from the live DB by id — never trust
  // a client-supplied name/mechanism/sourceType for the grounded plan.
  const technique = await getTechniqueById(techniqueId);
  if (!technique) {
    return NextResponse.json(
      { error: "No technique with that id exists in the database." },
      { status: 404 }
    );
  }

  const outcome = await runSynthesis({
    technique,
    matchConfidence: confidence as (typeof CONFIDENCES)[number],
    matchExplanation: explanation,
    problem,
    businessContext,
    followupAnswers,
    file: fileResult.file,
  });

  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.error }, { status: 502 });
  }

  // Log every completed synthesis, regardless of whether a lead ever
  // follows — the natural checkpoint for trend-spotting (which techniques/
  // problem types/confidence levels actually convert). Logging failure
  // must never break the operator-facing response; if the insert fails,
  // return the synthesis result anyway with no sessionId.
  const compositeInsightText = outcome.result.compositeInsight
    ? [
        outcome.result.compositeInsight.title,
        outcome.result.compositeInsight.body,
        outcome.result.compositeInsight.illustrativeExample,
      ]
        .filter(Boolean)
        .join("\n\n")
    : null;

  let sessionId: string | null = null;
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `insert into diagnose_sessions
        (problem, business_context, technique_id, technique_name, confidence,
         followup_answers, file_url, file_filename, file_content_type,
         grounded_plan_text, composite_insight_text, path_forward_text)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       returning id`,
      [
        problem,
        businessContext ?? null,
        technique.id,
        technique.name,
        confidence,
        JSON.stringify(followupAnswers),
        fileResult.file?.url ?? null,
        fileResult.file?.filename ?? null,
        fileResult.file?.contentType ?? null,
        outcome.result.groundedPlan.explanation,
        compositeInsightText,
        outcome.result.compositeInsight?.pathForward ?? null,
      ]
    );
    sessionId = rows[0].id;
  } catch (err) {
    console.error("[synthesize] failed to log diagnose_sessions row:", err);
  }

  return NextResponse.json({
    sessionId,
    groundedPlan: outcome.result.groundedPlan,
    compositeInsight: outcome.result.compositeInsight,
    insightSuppressed: outcome.result.insightSuppressed,
  });
}
