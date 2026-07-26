import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getAnthropicClient } from "@/lib/anthropic";
import { FOLLOWUP_SYSTEM_PROMPT } from "@/lib/prompts/followup";
import { DEFAULT_DIAGNOSE_CONFIG, type DiagnoseModelConfig } from "@/lib/diagnose";
import type { Technique } from "@/types/technique";

export { DEFAULT_DIAGNOSE_CONFIG as DEFAULT_FOLLOWUP_CONFIG };

const FollowupQuestionSchema = z
  .object({
    text: z.string(),
    type: z.enum(["short-option", "free-text"]),
    options: z.array(z.string()).optional(),
  })
  .refine(
    (q) => (q.type === "short-option" ? (q.options?.length ?? 0) >= 2 && (q.options?.length ?? 0) <= 4 : true),
    { message: "short-option questions must have 2-4 options" }
  )
  .refine((q) => (q.type === "free-text" ? q.options === undefined : true), {
    message: "free-text questions must not have options",
  });

const FollowupSchema = z.object({
  questions: z.array(FollowupQuestionSchema).min(2).max(4),
});

export interface FollowupQuestion {
  id: string;
  text: string;
  type: "short-option" | "free-text";
  options?: string[];
}

export interface FollowupRunResult {
  questions: FollowupQuestion[];
  latencyMs: number;
}

export type FollowupRunOutcome =
  | { ok: true; result: FollowupRunResult }
  | { ok: false; error: string };

export async function runFollowupQuestions({
  technique,
  problem,
  businessContext,
  config = DEFAULT_DIAGNOSE_CONFIG,
}: {
  technique: Technique;
  problem: string;
  businessContext?: string;
  config?: DiagnoseModelConfig;
}): Promise<FollowupRunOutcome> {
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

  const client = getAnthropicClient();
  const startedAt = Date.now();
  let response;
  try {
    response = await client.messages.parse({
      model: config.model,
      max_tokens: 2048,
      ...(config.supportsAdaptiveReasoning ? { thinking: { type: "adaptive" as const } } : {}),
      output_config: {
        format: zodOutputFormat(FollowupSchema),
        ...(config.supportsAdaptiveReasoning ? { effort: config.effort } : {}),
      },
      system: FOLLOWUP_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Matched technique (JSON):\n${JSON.stringify(
            techniqueForPrompt,
            null,
            2
          )}\n\nOperator's original problem description:\n"""\n${problem}\n"""${businessContextBlock}`,
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

  const questions: FollowupQuestion[] = parsed.questions.map((q, i) => ({
    id: `q${i + 1}`,
    text: q.text,
    type: q.type,
    options: q.options,
  }));

  return { ok: true, result: { questions, latencyMs } };
}
