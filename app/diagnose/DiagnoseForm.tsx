"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { SourceType } from "@/types/technique";
import { SOURCE_TYPE_LABELS } from "@/lib/sourceTypeLabels";
import MatchDeepDive from "./MatchDeepDive";

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
const CONTEXT_MAX_LENGTH = 2000;

function buildLoadingMessages(techniqueCount: number): string[] {
  return [
    "Reading through what you described…",
    `Comparing it against ${techniqueCount} documented techniques…`,
    "Checking whether the mechanisms actually apply…",
    "Weighing strong fits against weak ones…",
    "Almost there…",
  ];
}

const CONFIDENCE_META: Record<
  Match["confidence"],
  { label: string; dot: string; text: string }
> = {
  strong: { label: "Strong fit", dot: "bg-ink-text", text: "text-ink-text" },
  moderate: { label: "Moderate fit", dot: "bg-ink-muted", text: "text-ink-muted" },
  weak: { label: "Weak fit", dot: "bg-ink-border", text: "text-ink-muted/70" },
};

function ConfidenceBadge({ confidence }: { confidence: Match["confidence"] }) {
  const meta = CONFIDENCE_META[confidence];
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      <span
        className={`font-eyebrow text-[10px] uppercase tracking-widest ${meta.text}`}
      >
        {meta.label}
      </span>
    </span>
  );
}

function SourceStamp({ sourceType }: { sourceType: SourceType }) {
  return (
    <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-ink-gold-dim/60 px-2.5 py-1">
      <span className="h-1.5 w-1.5 rounded-full bg-ink-gold" />
      <span className="font-eyebrow text-[10px] uppercase tracking-widest text-ink-gold">
        {SOURCE_TYPE_LABELS[sourceType]}
      </span>
    </span>
  );
}

export default function DiagnoseForm({
  sourceTypeById,
  techniqueCount,
}: {
  sourceTypeById: Record<string, SourceType>;
  techniqueCount: number;
}) {
  const LOADING_MESSAGES = buildLoadingMessages(techniqueCount);
  const [problem, setProblem] = useState("");
  const [businessContext, setBusinessContext] = useState("");
  const [showContext, setShowContext] = useState(false);
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
  const submittedContextRef = useRef("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!problem.trim() || loading) return;

    submittedProblemRef.current = problem;
    submittedContextRef.current = businessContext;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem,
          businessContext: businessContext.trim() || undefined,
        }),
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
  const contextOverLimit = businessContext.length > CONTEXT_MAX_LENGTH;

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="e.g. I quote a lot of jobs but people go quiet after and never book. Or: our summers are slammed and winters are dead, and cash flow swings hard."
          rows={4}
          disabled={loading}
          className="w-full rounded-lg border border-ink-border bg-ink-surface p-3 text-sm text-ink-text placeholder-ink-muted/60 outline-none transition focus:border-ink-text/40 disabled:opacity-60"
        />
        <div className="flex items-center justify-between gap-3">
          <span
            className={`font-eyebrow text-xs ${
              overLimit ? "text-red-400" : "text-ink-muted"
            }`}
          >
            {problem.length}/{MAX_LENGTH}
          </span>
          <button
            type="submit"
            disabled={loading || !problem.trim() || overLimit || contextOverLimit}
            className="shrink-0 rounded-md bg-ink-text px-4 py-2 text-sm font-medium text-ink-bg transition disabled:opacity-40"
          >
            {loading ? "Checking…" : "Check against database"}
          </button>
        </div>

        <div className="rounded-lg border border-ink-border">
          <button
            type="button"
            onClick={() => setShowContext((s) => !s)}
            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-ink-muted"
          >
            <span>
              Tell us about your business{" "}
              <span className="text-ink-muted/60">(optional)</span>
            </span>
            <span className="text-ink-muted/60">{showContext ? "−" : "+"}</span>
          </button>

          {showContext && (
            <div className="flex flex-col gap-2 border-t border-ink-border p-3">
              <p className="text-xs text-ink-muted">
                Anything about your business helps us reason concretely instead of
                staying generic — numbers, tools, how you currently do things,
                whatever seems relevant.
              </p>
              <textarea
                value={businessContext}
                onChange={(e) => setBusinessContext(e.target.value)}
                placeholder="e.g. Average ticket ~$225, crew of 3, mostly repeat customers, we run a Xero window washing tank on the truck and book jobs through a shared calendar."
                rows={3}
                disabled={loading}
                className="w-full rounded-lg border border-ink-border bg-ink-surface p-3 text-sm text-ink-text placeholder-ink-muted/60 outline-none transition focus:border-ink-text/40 disabled:opacity-60"
              />
              <span
                className={`self-end font-eyebrow text-xs ${
                  contextOverLimit ? "text-red-400" : "text-ink-muted"
                }`}
              >
                {businessContext.length}/{CONTEXT_MAX_LENGTH}
              </span>
            </div>
          )}
        </div>
      </form>

      {loading && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-ink-border py-10 text-center">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink-border border-t-ink-muted" />
          <p className="text-sm text-ink-muted">
            {LOADING_MESSAGES[loadingMessageIndex]}
          </p>
          <p className="text-xs text-ink-muted/60">
            This takes 20–30 seconds — we&apos;re actually reasoning through
            it, not just keyword matching.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && result && (
        <div className="flex flex-col gap-6">
          <blockquote className="border-l-2 border-ink-border pl-3 text-xs italic leading-5 text-ink-muted">
            You described: &ldquo;{submittedProblemRef.current}&rdquo;
          </blockquote>

          {result.matches.length === 0 ? (
            <div className="rounded-xl border border-ink-border bg-ink-surface p-6">
              <p className="font-display text-lg font-medium text-ink-text">
                Nothing in our current database is a strong fit for this.
              </p>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                {result.assessment}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm leading-6 text-ink-muted">
                {result.assessment}
              </p>
              <ul className="flex flex-col gap-4">
                {result.matches.map((m) => {
                  const sourceType = sourceTypeById[m.techniqueId];
                  return (
                    <li
                      key={m.techniqueId}
                      className="rounded-xl border border-ink-border bg-ink-surface p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <Link
                          href={`/techniques/${m.techniqueId}`}
                          className="font-display text-lg font-medium leading-snug text-ink-text transition hover:text-white"
                        >
                          {m.techniqueName}
                        </Link>
                        <ConfidenceBadge confidence={m.confidence} />
                      </div>
                      <p className="mt-3 text-sm leading-6 text-ink-muted">
                        {m.explanation}
                      </p>
                      {sourceType && <SourceStamp sourceType={sourceType} />}
                      <MatchDeepDive
                        techniqueId={m.techniqueId}
                        techniqueName={m.techniqueName}
                        confidence={m.confidence}
                        explanation={m.explanation}
                        sourceType={sourceType}
                        problem={submittedProblemRef.current}
                        businessContext={submittedContextRef.current}
                      />
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
