"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Technique } from "@/types/technique";
import { SOURCE_TYPE_LABELS } from "@/lib/sourceTypeLabels";

export default function TechniqueBrowser({ techniques }: { techniques: Technique[] }) {
  const [vertical, setVertical] = useState("all");
  const [problemType, setProblemType] = useState("all");

  const verticals = useMemo(() => {
    const set = new Set<string>();
    for (const t of techniques) for (const v of t.targetVerticals) set.add(v);
    return Array.from(set).sort();
  }, [techniques]);

  const problemTypes = useMemo(() => {
    return Array.from(new Set(techniques.map((t) => t.problemType))).sort();
  }, [techniques]);

  const filtered = techniques.filter(
    (t) =>
      (vertical === "all" || t.targetVerticals.includes(vertical)) &&
      (problemType === "all" || t.problemType === problemType)
  );

  // max-w caps the closed control's width so a long option (e.g. "accessing
  // capital for equipment or growth") can't force the select past the
  // viewport on mobile — native selects otherwise size to their longest
  // option regardless of container width. The dropdown popup itself still
  // shows full option text; only the closed box is capped.
  const selectClasses =
    "min-w-0 max-w-[170px] truncate rounded-[7px] border border-ink-gold-border bg-white/[0.03] px-3.5 py-[9px] font-eyebrow text-[11px] font-medium text-ink-text/80 outline-none sm:max-w-none";

  // problemType is a free-text DB column, not a fixed enum like sourceType,
  // but its values are stored kebab-case (e.g. "leads-go-cold-before-
  // quoting") and were never meant to be read as literal UI copy — same
  // "never show a raw slug to a user" principle as lib/sourceTypeLabels.ts,
  // just de-slugified rather than mapped, since inventing shorter category
  // names isn't data we have.
  function humanizeSlug(slug: string): string {
    return slug.replace(/-/g, " ");
  }

  return (
    <div className="mx-auto w-full max-w-[1180px] px-6 pb-[110px] pt-12 sm:px-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5 border-b border-ink-border pb-5">
        <div>
          <p className="mb-1.5 font-eyebrow text-[10px] font-semibold tracking-[0.1em] text-ink-gold">
            BROWSE THE LIBRARY
          </p>
          <h1 className="font-display text-2xl font-medium text-ink-heading">
            All {techniques.length} techniques
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={vertical}
            onChange={(e) => setVertical(e.target.value)}
            className={selectClasses}
          >
            <option value="all">All verticals</option>
            {verticals.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          <select
            value={problemType}
            onChange={(e) => setProblemType(e.target.value)}
            className={selectClasses}
          >
            <option value="all">All problem types</option>
            {problemTypes.map((p) => (
              <option key={p} value={p}>
                {humanizeSlug(p)}
              </option>
            ))}
          </select>

          <span className="font-eyebrow text-[10.5px] text-ink-muted-dim">
            {filtered.length} of {techniques.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <Link
            key={t.id}
            href={`/techniques/${t.id}`}
            className="flex flex-col gap-2.5 rounded-xl border border-ink-border bg-white/[0.02] p-[18px] transition hover:border-ink-gold-border"
          >
            <span className="badge-verified self-start px-[7px] py-[3px] text-[8.5px]">
              {SOURCE_TYPE_LABELS[t.sourceType]}
            </span>
            <span className="font-eyebrow text-[9px] font-medium tracking-[0.04em] text-ink-muted-dim">
              {humanizeSlug(t.problemType).toUpperCase()}
            </span>
            <span className="font-display text-base leading-[1.3] text-ink-heading">{t.name}</span>
            <p className="text-[11.5px] leading-[1.5] text-ink-muted">
              From {t.sourceIndustry}
              {t.sourceCompany ? ` (${t.sourceCompany})` : ""} →{" "}
              {t.targetVerticals.slice(0, 2).join(", ")}
            </p>
            <span className="mt-1 font-eyebrow text-[10.5px] font-medium text-ink-gold">
              View technique →
            </span>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-sm text-ink-muted">No techniques match these filters.</p>
      )}
    </div>
  );
}
