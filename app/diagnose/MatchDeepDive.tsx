"use client";

import { useState } from "react";
import type { SourceType } from "@/types/technique";
import { SOURCE_TYPE_LABELS } from "@/lib/sourceTypeLabels";

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
  pathForward: string;
  quickSummary: string;
}

interface SynthesizeResult {
  sessionId: string | null;
  groundedPlan: GroundedPlan;
  compositeInsight: CompositeInsight | null;
  insightSuppressed: boolean;
}

interface UploadedFile {
  url: string;
  contentType: string;
  filename: string;
}

type Stage = "idle" | "loading-questions" | "questions" | "loading-synthesis" | "result";
type LeadStage = "idle" | "submitting" | "submitted";

const underlineFieldClasses =
  "w-full rounded-[8px] border border-ink-border-soft bg-white/[0.03] px-3.5 py-3 text-[13px] text-ink-text outline-none transition placeholder:text-ink-muted-dim focus:border-ink-gold/50 disabled:opacity-60";

const boxedFieldClasses =
  "w-full rounded-[8px] border border-ink-border-soft bg-white/[0.03] px-3.5 py-2.5 text-sm text-ink-text outline-none transition placeholder:text-ink-muted-dim focus:border-ink-gold/50 disabled:opacity-60";

// A fixed reading measure (~65-75 characters at these font sizes), applied to
// every long-form synthesis text block (quickSummary, Composite Insight body,
// hypothetical example, pathForward) — deliberate, not just whatever width
// the surrounding card happens to be, so it stays readable even if the card
// widens later.
const READ_MEASURE_CLASS = "max-w-[38rem]";

// The model is instructed to separate body paragraphs with a blank line, but
// this also guards the rendering side of "one long undifferentiated block":
// even well-formatted model output needs each paragraph in its own <p> to
// actually get visual spacing — a single <p> collapses embedded newlines to
// nothing, per normal CSS whitespace handling.
function renderParagraphs(text: string, paragraphClassName: string, keyPrefix: string) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const finalParagraphs = paragraphs.length > 0 ? paragraphs : [text];
  return finalParagraphs.map((p, i) => (
    <p key={`${keyPrefix}-${i}`} className={paragraphClassName}>
      {p}
    </p>
  ));
}

export default function MatchDeepDive({
  techniqueId,
  techniqueName,
  confidence,
  explanation,
  sourceType,
  mechanism,
  evidence,
  sourceUrl,
  problem,
  businessContext,
  file,
}: {
  techniqueId: string;
  techniqueName: string;
  confidence: "strong" | "moderate" | "weak";
  explanation: string;
  sourceType?: SourceType;
  mechanism?: string;
  evidence?: string;
  sourceUrl?: string | null;
  problem: string;
  businessContext: string;
  file?: UploadedFile;
}) {
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<FollowupQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SynthesizeResult | null>(null);
  const [showFullDetail, setShowFullDetail] = useState(false);

  const [leadStage, setLeadStage] = useState<LeadStage>("idle");
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");

  async function startDeepDive() {
    setStage("loading-questions");
    setError(null);
    try {
      const res = await fetch("/api/followup-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          techniqueId,
          problem,
          businessContext: businessContext || undefined,
          file,
        }),
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
          file,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setStage("questions");
        return;
      }
      setResult(data);
      setShowFullDetail(false);
      setStage("result");
    } catch {
      setError("Request failed. Try again.");
      setStage("questions");
    }
  }

  async function submitLead(e: React.FormEvent) {
    e.preventDefault();
    if (!result) return;
    setLeadStage("submitting");
    setLeadError(null);
    try {
      const followupAnswers = questions.map((q) => ({
        questionId: q.id,
        questionText: q.text,
        answer: answers[q.id] ?? "",
      }));
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName,
          email: leadEmail,
          phone: leadPhone || undefined,
          problem,
          techniqueId,
          businessContext: businessContext || undefined,
          followupAnswers,
          sessionId: result.sessionId ?? undefined,
          groundedPlanText: result.groundedPlan.explanation,
          compositeInsightText: result.compositeInsight
            ? [result.compositeInsight.title, result.compositeInsight.body, result.compositeInsight.illustrativeExample]
                .filter(Boolean)
                .join("\n\n")
            : undefined,
          pathForwardText: result.compositeInsight?.pathForward,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLeadError(data.error ?? "Something went wrong.");
        setLeadStage("idle");
        return;
      }
      setLeadStage("submitted");
    } catch {
      setLeadError("Request failed. Try again.");
      setLeadStage("idle");
    }
  }

  const allAnswered = questions.every((q) => (answers[q.id] ?? "").trim().length > 0);

  if (stage === "idle") {
    return (
      <div className="mt-5">
        {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
        <button type="button" onClick={startDeepDive} className="btn-gold-outline px-4 py-2.5 text-[11px]">
          Get a personalized plan →
        </button>
      </div>
    );
  }

  if (stage === "loading-questions" || stage === "loading-synthesis") {
    return (
      <div className="mt-5 flex flex-col items-center gap-2 rounded-xl border border-ink-border py-6 text-center">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-gold/25 border-t-ink-gold" />
        <p className="text-xs text-ink-muted">
          {stage === "loading-questions"
            ? "Coming up with a few questions specific to this technique…"
            : "Building your plan…"}
        </p>
      </div>
    );
  }

  if (stage === "questions") {
    return (
      <form
        onSubmit={submitAnswers}
        className="mt-5 flex flex-col gap-4 rounded-xl border border-ink-border p-5"
      >
        <p className="font-eyebrow text-[9.5px] font-semibold tracking-[0.06em] text-ink-muted-dim">
          A COUPLE QUICK QUESTIONS TO TAILOR THIS
        </p>
        {questions.map((q) => (
          <div key={q.id} className="flex flex-col gap-1.5">
            <label className="text-sm text-ink-text/90">{q.text}</label>
            {q.type === "short-option" ? (
              <div className="flex flex-wrap gap-2">
                {(q.options ?? []).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                    className={`rounded-full px-3.5 py-2 text-[12px] font-medium transition ${
                      answers[q.id] === opt
                        ? "border border-ink-gold-border bg-ink-gold-wash text-ink-text"
                        : "border border-ink-border-soft text-ink-muted hover:border-ink-gold-border"
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
                className={boxedFieldClasses}
              />
            )}
          </div>
        ))}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={!allAnswered} className="btn-gold self-start px-6 py-3.5 text-[11px]">
          Build my plan →
        </button>
      </form>
    );
  }

  if (stage === "result" && result) {
    return (
      <div className="mt-5 flex flex-col gap-7">
        {(mechanism || evidence || sourceType) && (
          <div className="flex flex-col gap-2.5 rounded-xl border border-ink-border p-5">
            <span className="font-eyebrow text-[9.5px] font-semibold tracking-[0.06em] text-ink-gold">
              YOUR MATCH
            </span>
            {mechanism && (
              <p className="text-[13px] leading-[1.6] text-ink-text/85">{mechanism}</p>
            )}
            <div className="flex flex-wrap items-center gap-2.5">
              {sourceType && (
                <span className="badge-verified px-[7px] py-[3px] text-[8.5px]">
                  {SOURCE_TYPE_LABELS[sourceType]}
                </span>
              )}
              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-eyebrow text-[10.5px] text-ink-muted-dim transition hover:text-ink-gold"
                >
                  Source ↗
                </a>
              )}
            </div>
          </div>
        )}

        {result.compositeInsight ? (
          <div className={READ_MEASURE_CLASS}>
            <span className="font-eyebrow text-[9.5px] font-semibold tracking-[0.06em] text-ink-gold">
              COMPOSITE INSIGHT
            </span>
            <p className="mb-4 mt-1 text-[11px] text-ink-muted-dim">
              Our own creative take on your situation — not from the technique library.
            </p>

            <div className="mb-4">
              {renderParagraphs(
                result.compositeInsight.quickSummary,
                "mb-3 text-[15px] leading-[1.7] text-ink-text last:mb-0",
                "quick-summary"
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowFullDetail((s) => !s)}
              className="mb-1 font-eyebrow text-[11px] font-semibold tracking-[0.04em] text-ink-gold transition hover:text-ink-gold-hover"
            >
              {showFullDetail ? "Show less ↑" : "Read the full breakdown →"}
            </button>

            {showFullDetail && (
              <div className="mt-5 border-t border-ink-border pt-6">
                <div className="mb-6">
                  {renderParagraphs(
                    result.compositeInsight.body,
                    "mb-4 font-display text-[17px] leading-[1.75] text-ink-text last:mb-0",
                    "insight-body"
                  )}
                </div>

                {result.compositeInsight.illustrativeExample && (
                  <div className="mb-6 border-l border-ink-gold-border pl-3.5">
                    <p className="mb-1.5 font-eyebrow text-[10.5px] font-semibold tracking-[0.06em] text-ink-muted-dim">
                      HYPOTHETICAL EXAMPLE
                    </p>
                    {renderParagraphs(
                      result.compositeInsight.illustrativeExample,
                      "mb-2 text-sm italic leading-[1.65] text-ink-muted last:mb-0",
                      "hypothetical"
                    )}
                  </div>
                )}

                <div>
                  <p className="mb-2 font-eyebrow text-[10.5px] font-semibold tracking-[0.06em] text-ink-gold">
                    WHAT BUILDING THIS OUT COULD LOOK LIKE
                  </p>
                  {renderParagraphs(
                    result.compositeInsight.pathForward,
                    "mb-3 text-[14px] leading-[1.7] text-ink-muted last:mb-0",
                    "path-forward"
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-ink-muted">
            We couldn&apos;t put together a Composite Insight for this one this time —
            the plan above still stands on its own.
          </p>
        )}

        <div className="h-px bg-ink-border" />

        {leadStage === "submitted" ? (
          <p className="text-sm text-ink-text/90">
            Thanks — we&apos;ve got your details for &quot;{techniqueName}&quot; and will follow up to
            talk through scoping this out.
          </p>
        ) : (
          <form onSubmit={submitLead} className="flex flex-col gap-3.5">
            <p className="font-display text-lg font-medium text-ink-heading">
              Want to scope this out together?
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                type="text"
                required
                placeholder="Name"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className={underlineFieldClasses}
              />
              <input
                type="email"
                required
                placeholder="Email"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                className={underlineFieldClasses}
              />
            </div>
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={leadPhone}
              onChange={(e) => setLeadPhone(e.target.value)}
              className={underlineFieldClasses}
            />
            {leadError && <p className="text-sm text-red-400">{leadError}</p>}
            <button
              type="submit"
              disabled={leadStage === "submitting"}
              className="btn-gold self-start px-6 py-3.5 text-[12px]"
            >
              {leadStage === "submitting" ? "SENDING…" : "LET'S TALK →"}
            </button>
          </form>
        )}
      </div>
    );
  }

  return null;
}
