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
  groundedPlan: GroundedPlan;
  compositeInsight: CompositeInsight | null;
  insightSuppressed: boolean;
}

type Stage = "idle" | "loading-questions" | "questions" | "loading-synthesis" | "result";
type LeadStage = "idle" | "submitting" | "submitted";

const fieldClasses =
  "w-full rounded-lg border border-ink-border bg-ink-surface px-3 py-1.5 text-sm text-ink-text placeholder-ink-muted/60 outline-none transition focus:border-ink-text/40 disabled:opacity-60";

const primaryButtonClasses =
  "self-start rounded-md bg-ink-text px-4 py-2 text-sm font-medium text-ink-bg transition disabled:opacity-40";

export default function MatchDeepDive({
  techniqueId,
  techniqueName,
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
      <div className="mt-4">
        {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
        <button
          type="button"
          onClick={startDeepDive}
          className="rounded-md border border-ink-border px-3 py-1.5 text-sm font-medium text-ink-text transition hover:border-ink-text/40"
        >
          Get a personalized plan →
        </button>
      </div>
    );
  }

  if (stage === "loading-questions" || stage === "loading-synthesis") {
    return (
      <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border border-ink-border py-6 text-center">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-border border-t-ink-muted" />
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
        className="mt-4 flex flex-col gap-4 rounded-lg border border-ink-border p-4"
      >
        <p className="text-xs text-ink-muted">
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
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      answers[q.id] === opt
                        ? "border-ink-text bg-ink-text text-ink-bg"
                        : "border-ink-border text-ink-muted hover:border-ink-text/40"
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
                className={fieldClasses}
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
      <div className="mt-4 flex flex-col gap-5">
        {/* The grounded plan is intentionally not re-rendered here — it's the
            exact same technique/confidence/explanation already shown in the
            match card above; the API response includes it (unchanged from
            /api/diagnose) so callers other than this UI have it available. */}
        {result.compositeInsight ? (
          <div className="rounded-xl bg-gradient-to-br from-ink-indigo-start to-ink-indigo-end p-px">
            <div className="rounded-[11px] bg-ink-surface p-5">
              <p className="bg-gradient-to-r from-ink-indigo-text-start to-ink-indigo-text-end bg-clip-text font-eyebrow text-xs font-medium uppercase tracking-widest text-transparent">
                Composite Insight
              </p>
              <p className="mt-1.5 text-xs italic leading-5 text-ink-muted">
                Our own creative take on your situation — not from the technique library,
                just Composite reasoning freshly about what you told us.
              </p>
              <p className="mt-4 font-display text-lg font-medium leading-snug text-ink-text">
                {result.compositeInsight.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink-text/85">
                {result.compositeInsight.body}
              </p>
              {result.compositeInsight.illustrativeExample && (
                <div className="mt-4 rounded-md border border-ink-border/80 bg-ink-bg/40 p-3">
                  <p className="font-eyebrow text-[10px] uppercase tracking-widest text-ink-muted">
                    Hypothetical example
                  </p>
                  <p className="mt-1.5 text-sm italic leading-6 text-ink-text/80">
                    {result.compositeInsight.illustrativeExample}
                  </p>
                </div>
              )}
              <div className="mt-5 border-t border-ink-border/80 pt-4">
                <p className="font-eyebrow text-[10px] uppercase tracking-widest text-ink-muted">
                  What building this out could look like
                </p>
                <p className="mt-1.5 text-sm leading-6 text-ink-text/85">
                  {result.compositeInsight.pathForward}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-ink-muted">
            We couldn&apos;t put together a Composite Insight for this one this time —
            the plan above still stands on its own.
          </p>
        )}

        {leadStage === "submitted" ? (
          <p className="rounded-lg border border-ink-border p-4 text-sm text-ink-text/90">
            Thanks — we&apos;ve got your details for &quot;{techniqueName}&quot; and will follow up to
            talk through scoping this out.
          </p>
        ) : (
          <form
            onSubmit={submitLead}
            className="flex flex-col gap-3 rounded-lg border border-ink-border p-4"
          >
            <p className="text-sm font-medium text-ink-text">
              Want to scope this out together?
            </p>
            <p className="text-xs text-ink-muted">
              Leave your details and we&apos;ll follow up to talk through turning this into something real.
            </p>
            <input
              type="text"
              required
              placeholder="Name"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              className={fieldClasses}
            />
            <input
              type="email"
              required
              placeholder="Email"
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
              className={fieldClasses}
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={leadPhone}
              onChange={(e) => setLeadPhone(e.target.value)}
              className={fieldClasses}
            />
            {leadError && <p className="text-sm text-red-400">{leadError}</p>}
            <button
              type="submit"
              disabled={leadStage === "submitting"}
              className={primaryButtonClasses}
            >
              {leadStage === "submitting" ? "Sending…" : "Get in touch →"}
            </button>
          </form>
        )}
      </div>
    );
  }

  return null;
}
