import { NextResponse } from "next/server";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getAnthropicClient } from "@/lib/anthropic";
import { getTechniques } from "@/lib/techniques";
import { DIAGNOSE_SYSTEM_PROMPT } from "@/lib/prompts/diagnose";

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
        content: `Operator's problem description:\n"""\n${problem}\n"""\n\nAvailable techniques (JSON):\n${JSON.stringify(
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
