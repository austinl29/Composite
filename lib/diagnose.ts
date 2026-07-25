import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getAnthropicClient } from "@/lib/anthropic";
import { DIAGNOSE_SYSTEM_PROMPT } from "@/lib/prompts/diagnose";
import type { Technique } from "@/types/technique";

export const LEAD_SOURCES = ["referral", "repeat customers", "paid ads", "other"] as const;

export interface BusinessContext {
  avgTicketPrice?: number;
  activeCustomerCount?: number;
  crewSize?: number;
  leadSource?: (typeof LEAD_SOURCES)[number];
}

export interface DiagnoseModelConfig {
  model: string;
  effort: "low" | "medium" | "high" | "xhigh" | "max";
}

/**
 * Model/effort tiering was evaluated (not assumed) via
 * scripts/eval-config-compare.ts against the full 23-case eval suite, run
 * once per config on 2026-07-25 — results in evals/config-compare-results.json:
 *
 *   a) opus-4-8 / effort:high (this baseline): 20/23 pass, avg 21.2s
 *   b) opus-4-8 / effort:medium:               19/23 pass, avg 18.4s
 *   c) sonnet-5 / effort:high:                 19/23 pass, avg 19.1s
 *
 * Zero fabrication in all 69 calls across all three configs — the Zod-enum
 * grounding held regardless of tier, as expected (it's structural, not
 * effort-dependent).
 *
 * Both cheaper configs failed the bar for a default swap:
 *   - sonnet-5/high regressed on a moderate-match case (missed an expected
 *     technique the baseline caught) — an explicit disqualifier per the
 *     "no regression on strong/moderate-match cases" rule this decision was
 *     measured against.
 *   - opus-4-8/medium held every strong/moderate-match case, but introduced
 *     a new failure not present in baseline: a weak-confidence match on a
 *     keyword-bait adversarial case baseline correctly rejected — exactly
 *     the surface-vs-mechanism distinction this eval suite exists to catch.
 *     Latency savings were modest (~13%) and no per-call token/cost data was
 *     captured, so there's no clear win to offset that risk.
 * Explanation quality/specificity on strong/moderate cases was NOT visibly
 * worse on either cheaper config on manual read — the disqualifiers were
 * both about matching correctness, not prose quality.
 *
 * Decision: keep effort:high / opus-4-8 as the universal default. This was
 * a single run per case per config, not multiple trials, so treat this as
 * directional evidence, not statistical proof — re-run
 * scripts/eval-config-compare.ts (ideally with several trials and captured
 * token usage) before revisiting.
 */
export const DEFAULT_DIAGNOSE_CONFIG: DiagnoseModelConfig = {
  model: "claude-opus-4-8",
  effort: "high",
};

export interface DiagnoseMatch {
  techniqueId: string;
  techniqueName: string;
  confidence: "strong" | "moderate" | "weak";
  explanation: string;
}

export interface DiagnoseRunResult {
  matches: DiagnoseMatch[];
  assessment: string;
  latencyMs: number;
}

export type DiagnoseRunOutcome =
  | { ok: true; result: DiagnoseRunResult }
  | { ok: false; error: string };

function hasBusinessContext(businessContext: BusinessContext): boolean {
  return Object.values(businessContext).some((v) => v !== undefined);
}

function buildBusinessContextBlock(businessContext: BusinessContext): string {
  if (!hasBusinessContext(businessContext)) return "";
  return `\n\nBusiness context (operator-provided, may be partial — only use what's here):\n${[
    businessContext.avgTicketPrice !== undefined
      ? `- Average ticket price: $${businessContext.avgTicketPrice}`
      : null,
    businessContext.activeCustomerCount !== undefined
      ? `- Approximate active/repeat customers: ${businessContext.activeCustomerCount}`
      : null,
    businessContext.crewSize !== undefined ? `- Crew size: ${businessContext.crewSize}` : null,
    businessContext.leadSource !== undefined
      ? `- Current primary lead source: ${businessContext.leadSource}`
      : null,
  ]
    .filter(Boolean)
    .join("\n")}`;
}

/**
 * Runs one diagnosis call against the given technique set with the given
 * model/effort config. The Zod-enum fabrication grounding (techniqueId
 * constrained to the live technique id set) is applied identically
 * regardless of config — cost/tiering choices never touch this mechanism.
 */
export async function runDiagnosis({
  problem,
  businessContext,
  techniques,
  config,
}: {
  problem: string;
  businessContext: BusinessContext;
  techniques: Technique[];
  config: DiagnoseModelConfig;
}): Promise<DiagnoseRunOutcome> {
  if (techniques.length === 0) {
    return {
      ok: true,
      result: {
        matches: [],
        assessment: "There are no techniques in the database yet.",
        latencyMs: 0,
      },
    };
  }

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

  const businessContextBlock = buildBusinessContextBlock(businessContext);
  const client = getAnthropicClient();

  const startedAt = Date.now();
  let response;
  try {
    response = await client.messages.parse({
      model: config.model,
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      output_config: {
        format: zodOutputFormat(DiagnosisSchema),
        effort: config.effort,
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
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
  const latencyMs = Date.now() - startedAt;

  if (response.stop_reason === "refusal") {
    return { ok: false, error: "The model declined to process this request." };
  }

  const parsed = response.parsed_output;
  if (!parsed) {
    return { ok: false, error: "Failed to parse a structured response from the model." };
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

  return {
    ok: true,
    result: { matches, assessment: parsed.assessment, latencyMs },
  };
}
