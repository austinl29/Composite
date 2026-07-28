import { NextResponse } from "next/server";
import { getTechniqueById } from "@/lib/techniques";
import { runFollowupQuestions } from "@/lib/followup";
import { parseUploadedFileRef } from "@/lib/uploadedFileParam";

const BUSINESS_CONTEXT_MAX_LENGTH = 2000;
const PROBLEM_MAX_LENGTH = 4000;

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

  const fileResult = parseUploadedFileRef(rawBody.file);
  if (!fileResult.ok) {
    return NextResponse.json({ error: fileResult.error }, { status: 400 });
  }

  // Grounding: only ever generate questions about a technique that actually
  // exists in the live database — never trust a client-supplied id blindly.
  const technique = await getTechniqueById(techniqueId);
  if (!technique) {
    return NextResponse.json(
      { error: "No technique with that id exists in the database." },
      { status: 404 }
    );
  }

  const outcome = await runFollowupQuestions({
    technique,
    problem,
    businessContext,
    file: fileResult.file,
  });

  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.error }, { status: 502 });
  }

  return NextResponse.json({
    techniqueId: technique.id,
    techniqueName: technique.name,
    questions: outcome.result.questions,
  });
}
