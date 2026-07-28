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
  pathForward: string;
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
  "w-full border-b border-ink-gold/35 bg-transparent px-0.5 py-2.5 text-sm text-ink-text outline-none transition placeholder:text-ink-muted-dim focus:border-ink-gold disabled:opacity-60";

const boxedFieldClasses =
  "w-full rounded-[3px] border border-ink-gold/30 bg-transparent px-3 py-2 text-sm text-ink-text outline-none transition placeholder:text-ink-muted-dim focus:border-ink-gold disabled:opacity-60";

const primaryButtonClasses =
  "self-start rounded-[2px] bg-ink-gold px-6 py-3.5 font-eyebrow text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-surface transition hover:bg-ink-gold-hover disabled:opacity-40";

export default function MatchDeepDive({
  techniqueId,
  techniqueName,
  confidence,
  explanation,
  problem,
  businessContext,
  file,
}: {
  techniqueId: string;
  techniqueName: string;
  confidence: "strong" | "moderate" | "weak";
  explanation: string;
  sourceType?: string;
  problem: string;
  businessContext: string;
  file?: UploadedFile;
}) {
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<FollowupQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SynthesizeResult | null>(null);

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
        <button
          type="button"
          onClick={startDeepDive}
          className="rounded-[3px] border border-ink-gold-dim px-3.5 py-2 font-eyebrow text-[11px] font-medium uppercase tracking-[0.06em] text-ink-gold transition hover:bg-ink-gold/10"
        >
          Get a personalized plan →
        </button>
      </div>
    );
  }

  if (stage === "loading-questions" || stage === "loading-synthesis") {
    return (
      <div className="mt-5 flex flex-col items-center gap-2 rounded-[3px] border border-ink-gold/20 py-6 text-center">
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
        className="mt-5 flex flex-col gap-4 rounded-[3px] border border-ink-gold/20 p-5"
      >
        <p className="text-xs text-ink-muted-soft">
          A few quick questions to tailor this to your business:
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
                    className={`rounded-[3px] border px-3 py-1 text-xs transition ${
                      answers[q.id] === opt
                        ? "border-ink-gold bg-ink-gold text-ink-surface"
                        : "border-ink-gold/30 text-ink-muted hover:border-ink-gold/60"
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
        <button type="submit" disabled={!allAnswered} className={primaryButtonClasses}>
          Build my plan →
        </button>
      </form>
    );
  }

  if (stage === "result" && result) {
    return (
      <div className="mt-5 flex flex-col gap-7">
        {/* The grounded plan is intentionally not re-rendered here — it's the
            exact same technique/confidence/explanation already shown in the
            match card above; the API response includes it (unchanged from
            /api/diagnose) so callers other than this UI have it available. */}
        {result.compositeInsight ? (
          <div>
            <div className="mb-2 flex items-center gap-2.5">
              <span className="relative inline-block h-[13px] w-[13px] shrink-0 rounded-full border-[1.5px] border-ink-indigo-end">
                <span className="absolute left-1/2 top-1/2 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink-indigo-end" />
              </span>
              <span className="font-display text-[17px] font-medium text-ink-lavender">
                Composite Insight
              </span>
            </div>
            <p className="mb-4 max-w-[440px] text-[13px] italic leading-[1.6] text-ink-muted-soft">
              Our own creative take on your situation — not from the technique library,
              just Composite reasoning freshly about what you told us.
            </p>
            <p className="mb-3 font-display text-base font-medium leading-snug text-ink-heading">
              {result.compositeInsight.title}
            </p>
            <p className="mb-5 font-display text-[17px] leading-[1.75] text-ink-text">
              {result.compositeInsight.body}
            </p>

            {result.compositeInsight.illustrativeExample && (
              <div className="mb-5 border-l border-ink-indigo-end/35 pl-3.5">
                <p className="mb-1.5 font-eyebrow text-[10.5px] font-medium uppercase tracking-[0.1em] text-ink-violet-label">
                  Hypothetical example
                </p>
                <p className="text-sm italic leading-[1.65] text-ink-violet-body">
                  {result.compositeInsight.illustrativeExample}
                </p>
              </div>
            )}

            <div className="mb-8">
              <p className="mb-2 font-eyebrow text-[10.5px] font-medium uppercase tracking-[0.1em] text-ink-gold-dim">
                What building this out could look like
              </p>
              <p className="text-[14.5px] leading-[1.7] text-ink-muted">
                {result.compositeInsight.pathForward}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-ink-muted">
            We couldn&apos;t put together a Composite Insight for this one this time —
            the plan above still stands on its own.
          </p>
        )}

        <div className="h-px bg-ink-gold/[0.22]" />

        {leadStage === "submitted" ? (
          <p className="text-sm text-ink-text/90">
            Thanks — we&apos;ve got your details for &quot;{techniqueName}&quot; and will follow up to
            talk through scoping this out.
          </p>
        ) : (
          <form onSubmit={submitLead} className="flex flex-col">
            <p className="mb-4 font-display text-lg font-medium text-ink-heading">
              Want to scope this out together?
            </p>
            <div className="mb-4 flex gap-4">
              <input
                type="text"
                required
                placeholder="Name"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                className={`flex-1 ${underlineFieldClasses}`}
              />
              <input
                type="email"
                required
                placeholder="Email"
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                className={`flex-1 ${underlineFieldClasses}`}
              />
            </div>
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={leadPhone}
              onChange={(e) => setLeadPhone(e.target.value)}
              className={`mb-6 ${underlineFieldClasses}`}
            />
            {leadError && <p className="mb-3 text-sm text-red-400">{leadError}</p>}
            <button
              type="submit"
              disabled={leadStage === "submitting"}
              className={primaryButtonClasses}
            >
              {leadStage === "submitting" ? "Sending…" : "Start the conversation"}
            </button>
          </form>
        )}
      </div>
    );
  }

  return null;
}
