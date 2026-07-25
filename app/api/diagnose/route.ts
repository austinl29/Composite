import { NextResponse } from "next/server";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getAnthropicClient } from "@/lib/anthropic";
import { getTechniques } from "@/lib/techniques";
import { DIAGNOSE_SYSTEM_PROMPT } from "@/lib/prompts/diagnose";

const LEAD_SOURCES = ["referral", "repeat customers", "paid ads", "other"] as const;

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
  const hasBusinessContext = Object.values(businessContext).some((v) => v !== undefined);

  const techniques = await getTechniques();

  if (techniques.length === 0) {
    return NextResponse.json({
      problem,
      matches: [],
      assessment: "There are no techniques in the database yet.",
    });
  }

  // Constrain techniqueId to an enum of real, current database ids. The model
  // physically cannot emit an id outside this set — the strongest available
  // guarantee against fabricated matches.
  const techniqueIds = techniques.map((t) => t.id) as [string, ...string[]];

  const DiagnosisSchema = z.object({
    matches: z.array(
      z.object({
        techniqueId: z.enum(techniqueIds),
        techniqueName: z.string(),
        confidence: z.enum(["strong", "moderate", "weak"]),
        explanation: z.string(),
      })
    ),
    assessment: z.string(),
  });

  const techniquesForPrompt = techniques.map((t) => ({
    id: t.id,
    name: t.name,
    sourceIndustry: t.sourceIndustry,
    sourceCompany: t.sourceCompany,
    mechanism: t.mechanism,
    evidence: t.evidence,
    targetVerticals: t.targetVerticals,
    transferTemplate: t.transferTemplate,
  }));

  const businessContextBlock = hasBusinessContext
    ? `\n\nBusiness context (operator-provided, may be partial — only use what's here):\n${[
        businessContext.avgTicketPrice !== undefined
          ? `- Average ticket price: $${businessContext.avgTicketPrice}`
          : null,
        businessContext.activeCustomerCount !== undefined
          ? `- Approximate active/repeat customers: ${businessContext.activeCustomerCount}`
          : null,
        businessContext.crewSize !== undefined
          ? `- Crew size: ${businessContext.crewSize}`
          : null,
        businessContext.leadSource !== undefined
          ? `- Current primary lead source: ${businessContext.leadSource}`
          : null,
      ]
        .filter(Boolean)
        .join("\n")}`
    : "";

  const client = getAnthropicClient();

  const response = await client.messages.parse({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    output_config: {
      format: zodOutputFormat(DiagnosisSchema),
      effort: "high",
    },
    system: DIAGNOSE_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Operator's problem description:\n"""\n${problem}\n"""${businessContextBlock}\n\nAvailable techniques (JSON):\n${JSON.stringify(
          techniquesForPrompt,
          null,
          2
        )}`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    return NextResponse.json(
      { error: "The model declined to process this request." },
      { status: 502 }
    );
  }

  const parsed = response.parsed_output;
  if (!parsed) {
    return NextResponse.json(
      { error: "Failed to parse a structured response from the model." },
      { status: 502 }
    );
  }

  // Defense in depth: even though techniqueId is schema-constrained, re-derive
  // techniqueName from our own data rather than trusting the model's free-text
  // field, and drop anything that somehow doesn't resolve to a real record.
  const byId = new Map(techniques.map((t) => [t.id, t]));
  const matches = parsed.matches
    .map((m) => {
      const technique = byId.get(m.techniqueId);
      if (!technique) return null;
      return {
        techniqueId: technique.id,
        techniqueName: technique.name,
        confidence: m.confidence,
        explanation: m.explanation,
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  return NextResponse.json({
    problem,
    matches,
    assessment: parsed.assessment,
  });
}
