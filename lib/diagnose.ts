import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getAnthropicClient } from "@/lib/anthropic";
import { DIAGNOSE_SYSTEM_PROMPT } from "@/lib/prompts/diagnose";
import type { Technique } from "@/types/technique";

/** Free-text description of the operator's business (ticket prices, crew
 * size, customer base, equipment, whatever they choose to share) —
 * replaced the earlier 4 structured fields (avgTicketPrice/
 * activeCustomerCount/crewSize/leadSource) on 2026-07-26 to let operators
 * describe their business in their own words instead of a rigid form. */
export type BusinessContext = string | undefined;

const VALID_EFFORTS = ["low", "medium", "high", "xhigh", "max"] as const;

export interface DiagnoseModelConfig {
  model: string;
  effort: (typeof VALID_EFFORTS)[number];
  /** Adaptive thinking AND output_config.effort both come from the same
   * "adaptive reasoning" capability, and both are rejected outright by
   * models that don't have it (e.g. Haiku 4.5: "adaptive thinking is not
   * supported on this model" / "This model does not support the effort
   * parameter") — resolved automatically from the model name, not
   * independently configurable. */
  supportsAdaptiveReasoning: boolean;
}

/**
 * Hardcoded fallback when DIAGNOSE_MODEL / DIAGNOSE_EFFORT are unset. This is
 * what production actually runs, since no env vars are set for those keys in
 * the Vercel project — only .env.local (gitignored, local dev only) sets
 * them, to claude-haiku-4-5-20251001 at a routine-dev effort level.
 *
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
 * Decision: keep effort:high / opus-4-8 as the universal default for real
 * verification of matching quality/behavior, and for production. This was a
 * single run per case per config, not multiple trials, so treat this as
 * directional evidence, not statistical proof — re-run
 * scripts/eval-config-compare.ts (ideally with several trials and captured
 * token usage) before revisiting.
 *
 * Separately, on 2026-07-26: most eval runs during routine, unrelated
 * feature work (UX, schema, hooks) don't need opus-4-8/high at all — they're
 * just confirming nothing broke, not evaluating matching quality itself.
 * DIAGNOSE_MODEL/DIAGNOSE_EFFORT let the local dev default drop to Haiku for
 * that routine case without touching what's actually deployed. See
 * CLAUDE.md's "Eval model policy" section for the full explanation and how
 * to switch between modes.
 */
const HARDCODED_FALLBACK_CONFIG: Omit<DiagnoseModelConfig, "supportsAdaptiveReasoning"> = {
  model: "claude-opus-4-8",
  effort: "high",
};

function isValidEffort(value: string): value is DiagnoseModelConfig["effort"] {
  return (VALID_EFFORTS as readonly string[]).includes(value);
}

// Confirmed against the live API: claude-haiku-4-5-20251001 rejects both
// `thinking: { type: "adaptive" }` (400: "adaptive thinking is not
// supported on this model") and `output_config.effort` (400: "This model
// does not support the effort parameter"). Rather than hardcode a family
// allowlist that goes stale, only enable both for models actually verified
// to support them.
const MODELS_WITHOUT_ADAPTIVE_REASONING = ["claude-haiku-4-5-20251001"];

function resolveDefaultConfig(): DiagnoseModelConfig {
  const model = process.env.DIAGNOSE_MODEL || HARDCODED_FALLBACK_CONFIG.model;
  const rawEffort = process.env.DIAGNOSE_EFFORT;
  const effort =
    rawEffort && isValidEffort(rawEffort) ? rawEffort : HARDCODED_FALLBACK_CONFIG.effort;
  if (rawEffort && !isValidEffort(rawEffort)) {
    console.warn(
      `[diagnose] DIAGNOSE_EFFORT="${rawEffort}" is not one of ${VALID_EFFORTS.join(
        ", "
      )} — falling back to "${HARDCODED_FALLBACK_CONFIG.effort}".`
    );
  }
  const supportsAdaptiveReasoning = !MODELS_WITHOUT_ADAPTIVE_REASONING.includes(model);
  return { model, effort, supportsAdaptiveReasoning };
}

export const DEFAULT_DIAGNOSE_CONFIG: DiagnoseModelConfig = resolveDefaultConfig();

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

function buildBusinessContextBlock(businessContext: BusinessContext): string {
  if (!businessContext || !businessContext.trim()) return "";
  return `\n\nBusiness context (operator-provided, free text — may be partial, only use what's actually here):\n"""\n${businessContext.trim()}\n"""`;
}

// Defense in depth, independent of the prompt's instructions (same
// "structural, not just instructional" discipline as the synthesis safety
// net): `assessment` is free text, and the model is given each technique's
// `id` in-context so it can populate `matches[].techniqueId` — nothing
// structurally prevents it from also citing that id in its prose summary.
// A full uuid or its first 8-hex-char segment are the two forms actually
// observed leaking through; both are stripped (never resolved to a name
// inline — the match cards below already show full names, so a specific
// id-shaped callout in the summary isn't required for the summary to read
// cleanly without it).
const FULL_UUID_TOKEN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX8_TOKEN = /^[0-9a-f]{8}$/i;
const HAS_HEX_LETTER = /[a-f]/i;

function isIdLikeToken(token: string): boolean {
  return FULL_UUID_TOKEN.test(token) || (HEX8_TOKEN.test(token) && HAS_HEX_LETTER.test(token));
}

export function sanitizeAssessment(assessment: string): string {
  return assessment
    .replace(/\(([^()]*)\)/g, (full, inner: string) => {
      const parts = inner.split(",").map((p) => p.trim());
      const allIdLike = parts.length > 0 && parts.every(isIdLikeToken);
      return allIdLike ? "" : full;
    })
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+([,.;:!?])/g, "$1")
    .trim();
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
      ...(config.supportsAdaptiveReasoning ? { thinking: { type: "adaptive" as const } } : {}),
      output_config: {
        format: zodOutputFormat(DiagnosisSchema),
        ...(config.supportsAdaptiveReasoning ? { effort: config.effort } : {}),
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
    result: { matches, assessment: sanitizeAssessment(parsed.assessment), latencyMs },
  };
}
