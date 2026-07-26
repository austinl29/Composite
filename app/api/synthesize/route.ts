import { NextResponse } from "next/server";
import { getTechniqueById } from "@/lib/techniques";
import { runSynthesis, type FollowupAnswer } from "@/lib/synthesize";

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
  });

  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.error }, { status: 502 });
  }

  return NextResponse.json({
    groundedPlan: outcome.result.groundedPlan,
    compositeInsight: outcome.result.compositeInsight,
    insightSuppressed: outcome.result.insightSuppressed,
  });
}
