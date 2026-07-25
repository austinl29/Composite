"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { SourceType } from "@/types/technique";

interface Match {
  techniqueId: string;
  techniqueName: string;
  confidence: "strong" | "moderate" | "weak";
  explanation: string;
}

interface DiagnoseResult {
  problem: string;
  matches: Match[];
  assessment: string;
}

const MAX_LENGTH = 4000;

const LOADING_MESSAGES = [
  "Reading through what you described…",
  "Comparing it against 26 documented techniques…",
  "Checking whether the mechanisms actually apply…",
  "Weighing strong fits against weak ones…",
  "Almost there…",
];

const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  "peer-reviewed": "Peer-reviewed research",
  "first-party-research": "First-party research",
  "secondary-verified": "Independently verified",
  "vendor-benchmark": "Vendor's own data",
  "promotional-testimonial": "Single case study",
};

const CONFIDENCE_STYLES: Record<Match["confidence"], string> = {
  strong:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  moderate:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  weak: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const CONFIDENCE_LABELS: Record<Match["confidence"], string> = {
  strong: "Strong fit",
  moderate: "Moderate fit",
  weak: "Weak fit",
};

export default function DiagnoseForm({
  sourceTypeById,
}: {
  sourceTypeById: Record<string, SourceType>;
}) {
  const [problem, setProblem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnoseResult | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    if (!loading) {
      setLoadingMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingMessageIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [loading]);

  const submittedProblemRef = useRef("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!problem.trim() || loading) return;

    submittedProblemRef.current = problem;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const overLimit = problem.length > MAX_LENGTH;

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="e.g. I quote a lot of jobs but people go quiet after and never book. Or: our summers are slammed and winters are dead, and cash flow swings hard."
          rows={4}
          disabled={loading}
          className="w-full rounded-md border border-zinc-300 bg-white p-3 text-sm text-black disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <div className="flex items-center justify-between gap-3">
          <span
            className={`text-xs ${
              overLimit
                ? "text-red-600 dark:text-red-400"
                : "text-zinc-400 dark:text-zinc-600"
            }`}
          >
            {problem.length}/{MAX_LENGTH}
          </span>
          <button
            type="submit"
            disabled={loading || !problem.trim() || overLimit}
            className="shrink-0 rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-black"
          >
            {loading ? "Checking…" : "Check against database"}
          </button>
        </div>
      </form>

      {loading && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-zinc-200 py-10 text-center dark:border-zinc-800">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-300" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {LOADING_MESSAGES[loadingMessageIndex]}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-600">
            This takes 20–30 seconds — we&apos;re actually reasoning through
            it, not just keyword matching.
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {!loading && result && (
        <div className="flex flex-col gap-4">
          <p className="rounded-md bg-zinc-50 p-3 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500">
            You described: &ldquo;{submittedProblemRef.current}&rdquo;
          </p>

          {result.matches.length === 0 ? (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Nothing in our current database is a strong fit for this.
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {result.assessment}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                {result.assessment}
              </p>
              <ul className="flex flex-col gap-4">
                {result.matches.map((m) => {
                  const sourceType = sourceTypeById[m.techniqueId];
                  return (
                    <li
                      key={m.techniqueId}
                      className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Link
                          href={`/techniques/${m.techniqueId}`}
                          className="font-medium text-black hover:underline dark:text-zinc-50"
                        >
                          {m.techniqueName}
                        </Link>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${CONFIDENCE_STYLES[m.confidence]}`}
                        >
                          {CONFIDENCE_LABELS[m.confidence]}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
                        {m.explanation}
                      </p>
                      {sourceType && (
                        <p className="mt-3 text-[11px] text-zinc-400 dark:text-zinc-600">
                          Source: {SOURCE_TYPE_LABELS[sourceType]}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
