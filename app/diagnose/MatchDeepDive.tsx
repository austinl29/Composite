"use client";

import { useState } from "react";

interface FollowupQuestion {
  id: string;
  text: string;
  type: "short-option" | "free-text";
  options?: string[];
}

interface GroundedPlan {
  techniqueId: string;
  techniqueName: string;
  confidence: "strong" | "moderate" | "weak";
  explanation: string;
  sourceType?: string;
}

interface CompositeInsight {
  title: string;
  body: string;
  illustrativeExample?: string;
}

interface SynthesizeResult {
  groundedPlan: GroundedPlan;
  compositeInsight: CompositeInsight | null;
  insightSuppressed: boolean;
}

type Stage = "idle" | "loading-questions" | "questions" | "loading-synthesis" | "result";

export default function MatchDeepDive({
  techniqueId,
  confidence,
  explanation,
  problem,
  businessContext,
}: {
  techniqueId: string;
  techniqueName: string;
  confidence: "strong" | "moderate" | "weak";
  explanation: string;
  sourceType?: string;
  problem: string;
  businessContext: string;
}) {
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<FollowupQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SynthesizeResult | null>(null);

  async function startDeepDive() {
    setStage("loading-questions");
    setError(null);
    try {
      const res = await fetch("/api/followup-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ techniqueId, problem, businessContext: businessContext || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setStage("idle");
        return;
      }
      setQuestions(data.questions);
      setAnswers({});
      setStage("questions");
    } catch {
      setError("Request failed. Try again.");
      setStage("idle");
    }
  }

  async function submitAnswers(e: React.FormEvent) {
    e.preventDefault();
    setStage("loading-synthesis");
    setError(null);
    try {
      const followupAnswers = questions.map((q) => ({
        questionId: q.id,
        questionText: q.text,
        answer: answers[q.id] ?? "",
      }));
      const res = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          techniqueId,
          confidence,
          explanation,
          problem,
          businessContext: businessContext || undefined,
          followupAnswers,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setStage("questions");
        return;
      }
      setResult(data);
      setStage("result");
    } catch {
      setError("Request failed. Try again.");
      setStage("questions");
    }
  }

  const allAnswered = questions.every((q) => (answers[q.id] ?? "").trim().length > 0);

  if (stage === "idle") {
    return (
      <div className="mt-3">
        {error && <p className="mb-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="button"
          onClick={startDeepDive}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-black dark:border-zinc-700 dark:text-zinc-50"
        >
          Get a personalized plan →
        </button>
      </div>
    );
  }

  if (stage === "loading-questions" || stage === "loading-synthesis") {
    return (
      <div className="mt-3 flex flex-col items-center gap-2 rounded-md border border-zinc-200 py-6 text-center dark:border-zinc-800">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300" />
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          {stage === "loading-questions"
            ? "Coming up with a few questions specific to this technique…"
            : "Building your plan…"}
        </p>
      </div>
    );
  }

  if (stage === "questions") {
    return (
      <form onSubmit={submitAnswers} className="mt-3 flex flex-col gap-4 rounded-md border border-zinc-200 p-4 dark:border-zinc-800">
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          A few quick questions to tailor this to your business:
        </p>
        {questions.map((q) => (
          <div key={q.id} className="flex flex-col gap-1.5">
            <label className="text-sm text-zinc-700 dark:text-zinc-300">{q.text}</label>
            {q.type === "short-option" ? (
              <div className="flex flex-wrap gap-2">
                {(q.options ?? []).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      answers[q.id] === opt
                        ? "border-black bg-black text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-black"
                        : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={answers[q.id] ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
              />
            )}
          </div>
        ))}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={!allAnswered}
          className="self-start rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-black"
        >
          Build my plan →
        </button>
      </form>
    );
  }

  if (stage === "result" && result) {
    return (
      <div className="mt-3 flex flex-col gap-4">
        {/* The grounded plan is intentionally not re-rendered here — it's the
            exact same technique/confidence/explanation already shown in the
            match card above; the API response includes it (unchanged from
            /api/diagnose) so callers other than this UI have it available. */}
        {result.compositeInsight ? (
          <div className="rounded-lg border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-4 dark:border-indigo-900/60 dark:from-indigo-950/40 dark:to-violet-950/30">
            <div className="flex items-center gap-2">
              <span className="text-lg">💡</span>
              <h3 className="font-medium text-indigo-950 dark:text-indigo-100">Composite Insight</h3>
            </div>
            <p className="mt-1 text-xs italic text-indigo-700/80 dark:text-indigo-300/70">
              Our own creative take on your situation — not from the technique library,
              just Composite reasoning freshly about what you told us.
            </p>
            <p className="mt-3 text-sm font-medium text-indigo-950 dark:text-indigo-100">
              {result.compositeInsight.title}
            </p>
            <p className="mt-1.5 text-sm leading-6 text-indigo-900 dark:text-indigo-200">
              {result.compositeInsight.body}
            </p>
            {result.compositeInsight.illustrativeExample && (
              <div className="mt-3 rounded-md bg-white/60 p-3 dark:bg-black/20">
                <p className="text-[11px] font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                  Hypothetical example
                </p>
                <p className="mt-1 text-sm italic leading-6 text-indigo-900 dark:text-indigo-200">
                  {result.compositeInsight.illustrativeExample}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            We couldn&apos;t put together a Composite Insight for this one this time —
            the plan above still stands on its own.
          </p>
        )}
      </div>
    );
  }

  return null;
}
