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
  mechanism: string;
  evidence: string;
  sourceUrl: string | null;
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

interface UploadedFile {
  url: string;
  contentType: string;
  filename: string;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/csv",
  "text/plain",
];
const ACCEPTED_FILE_EXTENSIONS = ".png,.jpg,.jpeg,.webp,.gif,.pdf,.csv,.txt";

// Display copy only — never touches the underlying strong/moderate/weak
// enum values used by the diagnose API or eval suite.
const CONFIDENCE_PILL: Record<
  Match["confidence"],
  { label: string; className: string }
> = {
  strong: {
    label: "STRONG FIT",
    className: "bg-ink-gold text-ink-gold-text-on-gold",
  },
  moderate: {
    label: "WORTH TRYING",
    className: "border border-ink-gold-dim text-ink-gold",
  },
  weak: {
    label: "POSSIBLE FIT",
    className: "border border-ink-border-soft text-ink-muted",
  },
};

const textareaClasses =
  "w-full rounded-[10px] border border-ink-border-soft bg-white/[0.03] p-4 text-[14.5px] leading-[1.6] text-ink-text outline-none transition placeholder:text-ink-muted-dim focus:border-ink-gold/50 disabled:opacity-60";

function PlusMinusIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-3.5 w-3.5 shrink-0">
      <span className="absolute left-0 top-1/2 h-[1.5px] w-3.5 -translate-y-1/2 bg-ink-gold" />
      <span
        className={`absolute left-1/2 top-0 h-3.5 w-[1.5px] -translate-x-1/2 bg-ink-gold transition-transform ${
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

  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file after a remove
    if (!file) return;

    setFileError(null);
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setFileError("Unsupported file type. Use an image, PDF, CSV, or plain text file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError("File is too large (max 10MB).");
      return;
    }

    setFileUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setFileError(data.error ?? "Upload failed.");
      } else {
        setUploadedFile({ url: data.url, contentType: data.contentType, filename: data.filename });
      }
    } catch {
      setFileError("Upload failed. Try again.");
    } finally {
      setFileUploading(false);
    }
  }

  function removeUploadedFile() {
    setUploadedFile(null);
    setFileError(null);
  }

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
  const submittedFileRef = useRef<UploadedFile | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!problem.trim() || loading) return;

    submittedProblemRef.current = problem;
    submittedContextRef.current = businessContext;
    submittedFileRef.current = uploadedFile;
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="e.g. We get plenty of quote requests but half of them go cold before we ever follow up…"
            rows={5}
            disabled={loading}
            className={textareaClasses}
          />
          <div className="mt-2 flex justify-end">
            <span
              className={`font-eyebrow text-[10.5px] ${
                overLimit ? "text-red-400" : "text-ink-muted-dim"
              }`}
            >
              {problem.length} / {MAX_LENGTH}
            </span>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowContext((s) => !s)}
            className="flex items-center gap-2 font-eyebrow text-[11px] font-medium tracking-[0.03em] text-ink-gold"
          >
            <PlusMinusIcon open={showContext} />
            {showContext ? "HIDE BUSINESS CONTEXT" : "ADD BUSINESS CONTEXT (OPTIONAL)"}
          </button>

          {showContext && (
            <div className="mt-3.5 flex flex-col gap-2">
              <p className="text-[12.5px] leading-[1.6] text-ink-muted-soft">
                Ticket size, crew size, how you get leads — anything that would
                sharpen the read.
              </p>
              <textarea
                value={businessContext}
                onChange={(e) => setBusinessContext(e.target.value)}
                placeholder="Optional context…"
                rows={3}
                disabled={loading}
                className={`${textareaClasses} text-[13.5px]`}
              />
              <span
                className={`self-end font-eyebrow text-[10.5px] ${
                  contextOverLimit ? "text-red-400" : "text-ink-muted-dim"
                }`}
              >
                {businessContext.length} / {CONTEXT_MAX_LENGTH}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed border-ink-gold-border p-5 text-center">
          {uploadedFile ? (
            <div className="flex w-full items-center justify-between gap-3">
              <span className="truncate text-[13px] text-ink-text/90">{uploadedFile.filename}</span>
              <button
                type="button"
                onClick={removeUploadedFile}
                disabled={loading}
                className="shrink-0 font-eyebrow text-[11px] tracking-[0.05em] text-ink-muted transition hover:text-ink-gold disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          ) : (
            <>
              <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] bg-ink-gold-glow font-eyebrow text-[13px] font-semibold text-ink-gold">
                ↑
              </span>
              <label className="cursor-pointer text-[12px] font-medium text-ink-text/70">
                Drop a flyer, CRM export, or screenshot (optional)
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_FILE_EXTENSIONS}
                  onChange={handleFileSelect}
                  disabled={loading || fileUploading}
                  className="hidden"
                />
              </label>
              <span className="font-eyebrow text-[9.5px] text-ink-muted-dim">
                .pdf · .png · .jpg · .csv — up to 10MB
              </span>
              {fileUploading && (
                <p className="text-[11px] text-ink-muted-dim">Uploading…</p>
              )}
            </>
          )}
          {fileError && <p className="text-xs text-red-400">{fileError}</p>}
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            type="submit"
            disabled={loading || !problem.trim() || overLimit || contextOverLimit || fileUploading}
            className="btn-gold w-full py-4 text-[12.5px]"
          >
            {loading ? "DIAGNOSING…" : "DIAGNOSE MY PROBLEM →"}
          </button>
          <span className="font-eyebrow text-[10.5px] text-ink-muted-dim">
            Takes about 30 seconds. Nothing is shared without your say-so.
          </span>
        </div>
      </form>

      {loading && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-ink-border py-10 text-center">
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
          <div>
            <h2 className="font-display text-[26px] font-medium leading-[1.3] text-ink-heading">
              Here&apos;s what&apos;s worth trying.
            </h2>
            <p className="mt-2 text-[13.5px] italic leading-[1.6] text-ink-muted">
              {result.assessment}
            </p>
          </div>

          {result.matches.length === 0 ? (
            <div className="rounded-xl border border-ink-border bg-white/[0.02] p-7">
              <p className="font-display text-lg font-medium text-ink-heading">
                Nothing in our current database is a strong fit for this.
              </p>
              <p className="mt-2.5 text-sm leading-6 text-ink-muted">
                {result.assessment}
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3.5">
              {result.matches.map((m, i) => {
                const meta = techniqueMetaById[m.techniqueId];
                const featured = i === 0;
                const pill = CONFIDENCE_PILL[m.confidence];
                return (
                  <li
                    key={m.techniqueId}
                    className={`rounded-xl p-6 sm:p-7 ${
                      featured
                        ? "border border-ink-gold-border bg-ink-gold-tint"
                        : "border border-ink-border"
                    }`}
                  >
                    <span
                      className={`inline-block rounded-[5px] px-2 py-[3px] font-eyebrow text-[9px] font-semibold tracking-[0.05em] ${pill.className}`}
                    >
                      {pill.label}
                    </span>

                    <Link
                      href={`/techniques/${m.techniqueId}`}
                      className="mt-2.5 block font-display text-[19px] leading-[1.3] text-ink-heading transition hover:text-ink-gold"
                    >
                      {m.techniqueName}
                    </Link>

                    {meta && (
                      <p className="mt-1.5 font-eyebrow text-[10px] tracking-[0.03em] text-ink-muted-dim">
                        FROM: {meta.sourceIndustry}
                        {meta.sourceCompany ? ` (${meta.sourceCompany})` : ""} → APPLIED TO: your business
                      </p>
                    )}

                    <p className="mt-2.5 max-w-[520px] text-[13.5px] leading-[1.6] text-ink-muted">
                      {m.explanation}
                    </p>

                    {meta && (
                      <span className="badge-verified mt-3.5 px-[7px] py-[3px] text-[8.5px]">
                        {SOURCE_TYPE_LABELS[meta.sourceType]}
                      </span>
                    )}

                    <MatchDeepDive
                      techniqueId={m.techniqueId}
                      techniqueName={m.techniqueName}
                      confidence={m.confidence}
                      explanation={m.explanation}
                      sourceType={meta?.sourceType}
                      mechanism={meta?.mechanism}
                      evidence={meta?.evidence}
                      sourceUrl={meta?.sourceUrl}
                      problem={submittedProblemRef.current}
                      businessContext={submittedContextRef.current}
                      file={submittedFileRef.current ?? undefined}
                    />
                  </li>
                );
              })}
            </ul>
          )}

          <div className="rounded-[10px] border border-dashed border-ink-border-soft p-4 text-center">
            <p className="text-[11.5px] leading-[1.5] text-ink-muted-dim">
              If nothing in the library is a genuine fit, Composite says so honestly
              — it never forces a match.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
