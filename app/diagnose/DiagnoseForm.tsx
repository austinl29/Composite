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

interface TechniqueMeta {
  sourceType: SourceType;
  sourceIndustry: string;
  sourceCompany: string | null;
  index: number;
}

const MAX_LENGTH = 4000;
const CONTEXT_MAX_LENGTH = 2000;

// buildLoadingMessages always returns exactly this many items — kept as a
// true module-level constant (rather than reading LOADING_MESSAGES.length,
// which is now a per-render local since it depends on techniqueCount) so
// the loading-message useEffect below has a stable dependency.
const LOADING_MESSAGE_COUNT = 5;

function buildLoadingMessages(techniqueCount: number): string[] {
  return [
    "Reading through what you described…",
    `Comparing it against ${techniqueCount} documented techniques…`,
    "Checking whether the mechanisms actually apply…",
    "Weighing strong fits against weak ones…",
    "Almost there…",
  ];
}

const CONFIDENCE_LABEL: Record<Match["confidence"], string> = {
  strong: "strong confidence",
  moderate: "moderate confidence",
  weak: "weak confidence",
};

const textareaClasses =
  "w-full rounded-[3px] border border-ink-gold/30 bg-transparent p-[18px] text-[15px] leading-[1.6] text-ink-text outline-none transition placeholder:text-ink-muted-dim focus:border-ink-gold disabled:opacity-60";

const primaryButtonClasses =
  "rounded-[3px] bg-ink-gold px-8 py-4 font-eyebrow text-xs font-semibold uppercase tracking-[0.08em] text-ink-surface transition hover:-translate-y-px hover:bg-ink-gold-hover hover:shadow-[0_12px_28px_rgba(201,169,97,0.25)] disabled:translate-y-0 disabled:opacity-40 disabled:shadow-none";

function PlusMinusIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-4 w-4 shrink-0">
      <span className="absolute left-0 top-1/2 h-[1.5px] w-4 -translate-y-1/2 bg-ink-gold-dim" />
      <span
        className={`absolute left-1/2 top-0 h-4 w-[1.5px] -translate-x-1/2 bg-ink-gold-dim transition-transform ${
          open ? "scale-y-0" : "scale-y-100"
        }`}
      />
    </span>
  );
}

export default function DiagnoseForm({
  techniqueMetaById,
  techniqueCount,
}: {
  techniqueMetaById: Record<string, TechniqueMeta>;
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
      setLoadingMessageIndex((i) => Math.min(i + 1, LOADING_MESSAGE_COUNT - 1));
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
    <div className="flex flex-col gap-10">
      <form onSubmit={handleSubmit} className="flex flex-col">
        <p className="mb-2.5 font-eyebrow text-[11px] font-medium uppercase tracking-[0.1em] text-ink-gold-dim">
          The problem
        </p>
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="e.g. Summer we're slammed, can't keep enough techs, then Nov–Feb we're basically bleeding money just to keep the doors open."
          rows={5}
          disabled={loading}
          className={textareaClasses}
        />
        <div className="mb-10 mt-2 flex justify-end">
          <span
            className={`font-eyebrow text-[11px] ${
              overLimit ? "text-red-400" : "text-ink-muted-dim"
            }`}
          >
            {problem.length} / {MAX_LENGTH}
          </span>
        </div>

        <div className="mb-11 border-t border-ink-gold/15 pt-7">
          <button
            type="button"
            onClick={() => setShowContext((s) => !s)}
            className="flex w-full items-center justify-between text-left"
          >
            <span className="text-[13.5px] font-medium text-ink-text/90">
              Tell us about your business{" "}
              <span className="text-ink-muted-dim">(optional)</span>
            </span>
            <PlusMinusIcon open={showContext} />
          </button>

          {showContext && (
            <div className="mt-3.5 flex flex-col gap-3.5">
              <p className="text-[13px] leading-[1.6] text-ink-muted-soft">
                Ticket size, crew size, how you get leads — anything that would
                sharpen the read.
              </p>
              <textarea
                value={businessContext}
                onChange={(e) => setBusinessContext(e.target.value)}
                placeholder="Optional context…"
                rows={3}
                disabled={loading}
                className={`${textareaClasses} border-ink-gold/20 text-sm`}
              />
              <span
                className={`self-end font-eyebrow text-[11px] ${
                  contextOverLimit ? "text-red-400" : "text-ink-muted-dim"
                }`}
              >
                {businessContext.length} / {CONTEXT_MAX_LENGTH}
              </span>
            </div>
          )}
        </div>

        <div className="text-right">
          <button
            type="submit"
            disabled={loading || !problem.trim() || overLimit || contextOverLimit}
            className={primaryButtonClasses}
          >
            {loading ? "Checking…" : "Check against database →"}
          </button>
        </div>
      </form>

      {loading && (
        <div className="flex flex-col items-center gap-3 rounded-[3px] border border-ink-gold/20 py-10 text-center">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink-gold/25 border-t-ink-gold" />
          <p className="text-sm text-ink-muted">
            {LOADING_MESSAGES[loadingMessageIndex]}
          </p>
          <p className="text-xs text-ink-muted-dim">
            This takes 20–30 seconds — we&apos;re actually reasoning through
            it, not just keyword matching.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {!loading && result && (
        <div className="flex flex-col gap-8">
          <blockquote className="border-l-2 border-ink-gold/20 pl-3 text-xs italic leading-5 text-ink-muted">
            You described: &ldquo;{submittedProblemRef.current}&rdquo;
          </blockquote>

          {result.matches.length === 0 ? (
            <div className="rounded-[3px] border border-ink-gold/20 bg-ink-surface p-7">
              <p className="font-display text-lg font-medium text-ink-heading">
                Nothing in our current database is a strong fit for this.
              </p>
              <p className="mt-2.5 text-sm leading-6 text-ink-muted">
                {result.assessment}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm leading-6 text-ink-muted">{result.assessment}</p>
              <ul className="flex flex-col gap-8">
                {result.matches.map((m) => {
                  const meta = techniqueMetaById[m.techniqueId];
                  return (
                    <li
                      key={m.techniqueId}
                      className="relative rounded-[3px] border border-ink-gold/20 bg-ink-surface p-8 sm:p-10"
                    >
                      {meta && (
                        <span className="absolute right-6 top-6 font-eyebrow text-[10px] tracking-[0.08em] text-ink-gold-dim">
                          № {String(meta.index).padStart(2, "0")} / {techniqueCount}
                        </span>
                      )}

                      <p className="mb-2.5 font-eyebrow text-[11px] font-medium uppercase tracking-[0.1em] text-ink-gold-dim">
                        Matched technique · {CONFIDENCE_LABEL[m.confidence]}
                      </p>
                      <Link
                        href={`/techniques/${m.techniqueId}`}
                        className="block font-display text-[22px] font-medium leading-[1.3] text-ink-heading transition hover:text-ink-gold"
                      >
                        {m.techniqueName}
                      </Link>
                      {meta && (
                        <p className="mb-4 mt-1.5 text-sm italic text-ink-muted-soft">
                          {meta.sourceIndustry}
                          {meta.sourceCompany ? ` — ${meta.sourceCompany}` : ""}
                        </p>
                      )}
                      <p className="text-[15.5px] leading-[1.7] text-ink-muted">
                        {m.explanation}
                      </p>

                      {meta && (
                        <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-[3px] border border-ink-gold-dim px-3 py-1.5 font-eyebrow text-[11px] tracking-[0.06em] text-ink-gold">
                          <span className="h-1.5 w-1.5 rounded-full bg-ink-gold" />
                          {SOURCE_TYPE_LABELS[meta.sourceType]}
                        </span>
                      )}

                      <MatchDeepDive
                        techniqueId={m.techniqueId}
                        techniqueName={m.techniqueName}
                        confidence={m.confidence}
                        explanation={m.explanation}
                        sourceType={meta?.sourceType}
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
