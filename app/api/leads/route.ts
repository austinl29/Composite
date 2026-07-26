import { NextResponse } from "next/server";
import { getTechniqueById } from "@/lib/techniques";
import { getPool } from "@/lib/db";

const NAME_MAX_LENGTH = 200;
const EMAIL_MAX_LENGTH = 320;
const PHONE_MAX_LENGTH = 40;
const PROBLEM_MAX_LENGTH = 4000;
const BUSINESS_CONTEXT_MAX_LENGTH = 2000;
const TEXT_BLOCK_MAX_LENGTH = 8000;
const MAX_FOLLOWUP_ANSWERS = 10;
const ANSWER_MAX_LENGTH = 500;

// Not full RFC 5322 validation — just enough to reject obvious typos/junk.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const name = rawBody.name;
  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Provide a non-empty 'name' string." }, { status: 400 });
  }
  if (name.length > NAME_MAX_LENGTH) {
    return NextResponse.json(
      { error: `'name' is too long (max ${NAME_MAX_LENGTH} characters).` },
      { status: 400 }
    );
  }

  const email = rawBody.email;
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
    return NextResponse.json(
      { error: "Provide a valid 'email' string." },
      { status: 400 }
    );
  }
  if (email.length > EMAIL_MAX_LENGTH) {
    return NextResponse.json(
      { error: `'email' is too long (max ${EMAIL_MAX_LENGTH} characters).` },
      { status: 400 }
    );
  }

  const rawPhone = rawBody.phone;
  let phone: string | null = null;
  if (rawPhone !== undefined && rawPhone !== null && rawPhone !== "") {
    if (typeof rawPhone !== "string") {
      return NextResponse.json({ error: "'phone' must be a string if provided." }, { status: 400 });
    }
    if (rawPhone.length > PHONE_MAX_LENGTH) {
      return NextResponse.json(
        { error: `'phone' is too long (max ${PHONE_MAX_LENGTH} characters).` },
        { status: 400 }
      );
    }
    phone = rawPhone;
  }

  const problem = rawBody.problem;
  if (typeof problem !== "string" || problem.trim().length === 0) {
    return NextResponse.json({ error: "Provide a non-empty 'problem' string." }, { status: 400 });
  }
  if (problem.length > PROBLEM_MAX_LENGTH) {
    return NextResponse.json(
      { error: `'problem' is too long (max ${PROBLEM_MAX_LENGTH} characters).` },
      { status: 400 }
    );
  }

  const techniqueId = rawBody.techniqueId;
  if (typeof techniqueId !== "string" || techniqueId.trim().length === 0) {
    return NextResponse.json(
      { error: "Provide a non-empty 'techniqueId' string." },
      { status: 400 }
    );
  }

  const rawBusinessContext = rawBody.businessContext;
  let businessContext: string | null = null;
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
  let followupAnswers: { questionId: string; questionText: string; answer: string }[] = [];
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
    followupAnswers = rawAnswers as { questionId: string; questionText: string; answer: string }[];
  }

  const rawGrounded = rawBody.groundedPlanText;
  if (typeof rawGrounded !== "string" || rawGrounded.trim().length === 0) {
    return NextResponse.json(
      { error: "Provide a non-empty 'groundedPlanText' string." },
      { status: 400 }
    );
  }
  if (rawGrounded.length > TEXT_BLOCK_MAX_LENGTH) {
    return NextResponse.json(
      { error: `'groundedPlanText' is too long (max ${TEXT_BLOCK_MAX_LENGTH} characters).` },
      { status: 400 }
    );
  }
  const groundedPlanText = rawGrounded;

  let compositeInsightText: string | null = null;
  if (rawBody.compositeInsightText !== undefined && rawBody.compositeInsightText !== null && rawBody.compositeInsightText !== "") {
    if (typeof rawBody.compositeInsightText !== "string" || rawBody.compositeInsightText.length > TEXT_BLOCK_MAX_LENGTH) {
      return NextResponse.json(
        { error: `'compositeInsightText' must be a string (max ${TEXT_BLOCK_MAX_LENGTH} characters) if provided.` },
        { status: 400 }
      );
    }
    compositeInsightText = rawBody.compositeInsightText;
  }

  let pathForwardText: string | null = null;
  if (rawBody.pathForwardText !== undefined && rawBody.pathForwardText !== null && rawBody.pathForwardText !== "") {
    if (typeof rawBody.pathForwardText !== "string" || rawBody.pathForwardText.length > TEXT_BLOCK_MAX_LENGTH) {
      return NextResponse.json(
        { error: `'pathForwardText' must be a string (max ${TEXT_BLOCK_MAX_LENGTH} characters) if provided.` },
        { status: 400 }
      );
    }
    pathForwardText = rawBody.pathForwardText;
  }

  // Grounding: re-derive the technique name from the live DB by id — never
  // trust a client-supplied technique name, and reject unknown ids outright.
  const technique = await getTechniqueById(techniqueId);
  if (!technique) {
    return NextResponse.json(
      { error: "No technique with that id exists in the database." },
      { status: 404 }
    );
  }

  const pool = getPool();
  const { rows } = await pool.query(
    `insert into leads
      (name, email, phone, problem, technique_id, technique_name, business_context,
       followup_answers, grounded_plan_text, composite_insight_text, path_forward_text)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     returning id, submitted_at`,
    [
      name.trim(),
      email.trim(),
      phone,
      problem,
      technique.id,
      technique.name,
      businessContext,
      JSON.stringify(followupAnswers),
      groundedPlanText,
      compositeInsightText,
      pathForwardText,
    ]
  );

  return NextResponse.json({ id: rows[0].id, submittedAt: rows[0].submitted_at });
}
