import { NextResponse } from "next/server";
import { getTechniques } from "@/lib/techniques";
import { LEAD_SOURCES, DEFAULT_DIAGNOSE_CONFIG, runDiagnosis } from "@/lib/diagnose";

function readOptionalPositiveNumber(
  value: unknown,
  field: string
): { ok: true; value: number | undefined } | { ok: false; error: string } {
  if (value === undefined || value === null || value === "") {
    return { ok: true, value: undefined };
  }
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num) || num <= 0) {
    return { ok: false, error: `'${field}' must be a positive number if provided.` };
  }
  return { ok: true, value: num };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const problem =
    typeof body === "object" && body !== null && "problem" in body
      ? (body as { problem: unknown }).problem
      : undefined;

  if (typeof problem !== "string" || problem.trim().length === 0) {
    return NextResponse.json(
      { error: "Provide a non-empty 'problem' string." },
      { status: 400 }
    );
  }
  if (problem.length > 4000) {
    return NextResponse.json(
      { error: "'problem' is too long (max 4000 characters)." },
      { status: 400 }
    );
  }

  // Optional business context. Every field is independently optional — an
  // operator can fill in none, some, or all of them.
  const rawBody = (typeof body === "object" && body !== null ? body : {}) as Record<
    string,
    unknown
  >;

  const avgTicketPriceResult = readOptionalPositiveNumber(rawBody.avgTicketPrice, "avgTicketPrice");
  if (!avgTicketPriceResult.ok) {
    return NextResponse.json({ error: avgTicketPriceResult.error }, { status: 400 });
  }
  const activeCustomerCountResult = readOptionalPositiveNumber(
    rawBody.activeCustomerCount,
    "activeCustomerCount"
  );
  if (!activeCustomerCountResult.ok) {
    return NextResponse.json({ error: activeCustomerCountResult.error }, { status: 400 });
  }
  const crewSizeResult = readOptionalPositiveNumber(rawBody.crewSize, "crewSize");
  if (!crewSizeResult.ok) {
    return NextResponse.json({ error: crewSizeResult.error }, { status: 400 });
  }

  let leadSource: (typeof LEAD_SOURCES)[number] | undefined;
  if (rawBody.leadSource !== undefined && rawBody.leadSource !== null && rawBody.leadSource !== "") {
    if (
      typeof rawBody.leadSource !== "string" ||
      !LEAD_SOURCES.includes(rawBody.leadSource as (typeof LEAD_SOURCES)[number])
    ) {
      return NextResponse.json(
        { error: `'leadSource' must be one of: ${LEAD_SOURCES.join(", ")}.` },
        { status: 400 }
      );
    }
    leadSource = rawBody.leadSource as (typeof LEAD_SOURCES)[number];
  }

  const businessContext = {
    avgTicketPrice: avgTicketPriceResult.value,
    activeCustomerCount: activeCustomerCountResult.value,
    crewSize: crewSizeResult.value,
    leadSource,
  };

  const techniques = await getTechniques();

  const outcome = await runDiagnosis({
    problem,
    businessContext,
    techniques,
    config: DEFAULT_DIAGNOSE_CONFIG,
  });

  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.error }, { status: 502 });
  }

  return NextResponse.json({
    problem,
    matches: outcome.result.matches,
    assessment: outcome.result.assessment,
  });
}
