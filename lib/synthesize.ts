import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getAnthropicClient } from "@/lib/anthropic";
import { SYNTHESIZE_SYSTEM_PROMPT } from "@/lib/prompts/synthesize";
import { DEFAULT_DIAGNOSE_CONFIG, type DiagnoseModelConfig } from "@/lib/diagnose";
import { buildFileContentBlocks, type UploadedFileRef } from "@/lib/fileContext";
import type Anthropic from "@anthropic-ai/sdk";
import type { Technique } from "@/types/technique";

export { DEFAULT_DIAGNOSE_CONFIG as DEFAULT_SYNTHESIZE_CONFIG };

const CompositeInsightSchema = z.object({
  title: z.string(),
  body: z.string(),
  illustrativeExample: z.string().optional(),
  pathForward: z.string(),
  quickSummary: z.string(),
});

export interface FollowupAnswer {
  questionId: string;
  questionText: string;
  answer: string;
}

export interface GroundedPlan {
  techniqueId: string;
  techniqueName: string;
  confidence: "strong" | "moderate" | "weak";
  explanation: string;
  sourceType: Technique["sourceType"];
}

export interface CompositeInsight {
  title: string;
  body: string;
  illustrativeExample?: string;
  pathForward: string;
  quickSummary: string;
}

export interface SynthesizeRunResult {
  groundedPlan: GroundedPlan;
  compositeInsight: CompositeInsight | null;
  insightSuppressed: boolean;
  latencyMs: number;
}

export type SynthesizeRunOutcome =
  | { ok: true; result: SynthesizeRunResult }
  | { ok: false; error: string };

// Defense in depth, independent of the system prompt's instructions: the same
// "structural, not just instructional" discipline as the technique-matching
// Zod-enum grounding, applied here to the Composite Insight's two hard rules
// (never quantify an outcome, never claim citation/database backing). These
// patterns are intentionally scoped to FUTURE/PROJECTED framing — an operator's
// own already-stated numbers (e.g. "at your $225 ticket price") are fine to
// reference; a projected result from them is not.
export const QUANTIFIED_OUTCOME_PATTERNS = [
  "you('ll| will)\\s+(get|see|gain|earn|make|generate|bring in)",
  "\\$\\d[\\d,]*\\s*(more|extra|additional|per\\s+(month|year|week))",
  "\\d+\\s*(more|new|additional)\\s*(customers?|clients?|leads?|jobs?|calls?)",
  "(expect|projected|forecast)(ed)?\\s+to\\s+(earn|make|bring|generate|see)",
  "\\d+(\\.\\d+)?\\s?%\\s*(increase|more|growth|boost|lift|higher|improvement)",
  "(increase|boost|grow|lift)\\s+(revenue|sales|bookings|customers|profit)\\s+by\\s+\\d",
];

export const CITATION_CLAIM_PATTERNS = [
  "backed by (our |the )?data",
  "database (confirms|shows|supports|proves)",
  "verified by",
  "cited (research|source|study)",
  "according to (our (records|data)|the database)",
  "(proven|documented) (by|in) (our|the) (database|research)",
];

const ALL_SAFETY_PATTERNS = [...QUANTIFIED_OUTCOME_PATTERNS, ...CITATION_CLAIM_PATTERNS];

function findSafetyViolation(insight: CompositeInsight): string | null {
  const combined = [
    insight.title,
    insight.body,
    insight.illustrativeExample,
    insight.pathForward,
    insight.quickSummary,
  ]
    .filter(Boolean)
    .join("\n");
  for (const patternSrc of ALL_SAFETY_PATTERNS) {
    const re = new RegExp(patternSrc, "i");
    const match = combined.match(re);
    if (match) {
      return `Pattern /${patternSrc}/i matched: "${match[0]}"`;
    }
  }
  return null;
}

async function callInsightModel({
  system,
  userContent,
  config,
}: {
  system: string;
  userContent: string | Anthropic.Messages.ContentBlockParam[];
  config: DiagnoseModelConfig;
}): Promise<{ ok: true; insight: CompositeInsight } | { ok: false; error: string }> {
  const client = getAnthropicClient();
  let response;
  try {
    response = await client.messages.parse({
      model: config.model,
      max_tokens: 2048,
      ...(config.supportsAdaptiveReasoning ? { thinking: { type: "adaptive" as const } } : {}),
      output_config: {
        format: zodOutputFormat(CompositeInsightSchema),
        ...(config.supportsAdaptiveReasoning ? { effort: config.effort } : {}),
      },
      system,
      messages: [{ role: "user", content: userContent }],
    });
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  if (response.stop_reason === "refusal") {
    return { ok: false, error: "The model declined to process this request." };
  }
  const parsed = response.parsed_output;
  if (!parsed) {
    return { ok: false, error: "Failed to parse a structured response from the model." };
  }
  return { ok: true, insight: parsed };
}

export async function runSynthesis({
  technique,
  matchConfidence,
  matchExplanation,
  problem,
  businessContext,
  followupAnswers,
  file,
  config = DEFAULT_DIAGNOSE_CONFIG,
}: {
  technique: Technique;
  matchConfidence: "strong" | "moderate" | "weak";
  matchExplanation: string;
  problem: string;
  businessContext?: string;
  followupAnswers: FollowupAnswer[];
  file?: UploadedFileRef;
  config?: DiagnoseModelConfig;
}): Promise<SynthesizeRunOutcome> {
  // The grounded plan is a pass-through, not a new generation: the technique
  // fields are re-derived server-side from the live DB (never trusted from
  // the client), and confidence/explanation are exactly what the already-
  // verified diagnose call produced — no new LLM involvement, so "unchanged
  // from today's baseline" is true by construction, not by re-prompting.
  const groundedPlan: GroundedPlan = {
    techniqueId: technique.id,
    techniqueName: technique.name,
    confidence: matchConfidence,
    explanation: matchExplanation,
    sourceType: technique.sourceType,
  };

  const techniqueForPrompt = {
    name: technique.name,
    mechanism: technique.mechanism,
    targetVerticals: technique.targetVerticals,
    transferTemplate: technique.transferTemplate,
  };
  const businessContextBlock =
    businessContext && businessContext.trim()
      ? `\n\nBusiness context (operator-provided, free text):\n"""\n${businessContext.trim()}\n"""`
      : "";
  const followupBlock =
    followupAnswers.length > 0
      ? `\n\nFollow-up Q&A:\n${followupAnswers
          .map((a) => `- Q: ${a.questionText}\n  A: ${a.answer}`)
          .join("\n")}`
      : "";

  const baseUserText = `Matched technique (JSON, for context only — already shown to the operator elsewhere):\n${JSON.stringify(
    techniqueForPrompt,
    null,
    2
  )}\n\nOperator's original problem description:\n"""\n${problem}\n"""${businessContextBlock}${followupBlock}`;

  const fileContent = await buildFileContentBlocks(file);
  const baseUserContent: string | Anthropic.Messages.ContentBlockParam[] = fileContent
    ? [{ type: "text", text: baseUserText }, ...fileContent.blocks]
    : baseUserText;

  const startedAt = Date.now();

  let attempt = await callInsightModel({
    system: SYNTHESIZE_SYSTEM_PROMPT,
    userContent: baseUserContent,
    config,
  });
  if (!attempt.ok) {
    return { ok: false, error: attempt.error };
  }

  let violation = findSafetyViolation(attempt.insight);
  if (violation) {
    // One retry with an explicit correction, before giving up and suppressing.
    // The correction is appended as its own text block so any file content
    // (image/document/inlined text) from the original attempt is still present.
    const correctionText = `Your previous attempt violated a hard rule and was discarded: ${violation}. Do not quantify any outcome (no dollar figures, percentages, or counts implying a result) and do not claim citation or database backing anywhere in your answer. Try again, keeping the idea just as specific and creative on WHAT to do — only the numeric-projection and citation-claim language must be removed.`;
    const retryContent: string | Anthropic.Messages.ContentBlockParam[] = fileContent
      ? [{ type: "text", text: baseUserText }, ...fileContent.blocks, { type: "text", text: correctionText }]
      : `${baseUserText}\n\n${correctionText}`;
    attempt = await callInsightModel({
      system: SYNTHESIZE_SYSTEM_PROMPT,
      userContent: retryContent,
      config,
    });
    if (!attempt.ok) {
      return { ok: false, error: attempt.error };
    }
    violation = findSafetyViolation(attempt.insight);
  }

  const latencyMs = Date.now() - startedAt;

  if (violation) {
    // Never surface a violating insight, even after a retry — same severity
    // as a fabricated citation. Grounded plan is unaffected either way.
    return {
      ok: true,
      result: { groundedPlan, compositeInsight: null, insightSuppressed: true, latencyMs },
    };
  }

  return {
    ok: true,
    result: {
      groundedPlan,
      compositeInsight: attempt.insight,
      insightSuppressed: false,
      latencyMs,
    },
  };
}
