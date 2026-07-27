"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Technique } from "@/types/technique";

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
    "min-w-0 max-w-[170px] truncate rounded-[2px] border border-ink-gold/30 bg-transparent px-3.5 py-[9px] font-eyebrow text-xs text-ink-muted outline-none sm:max-w-none";

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
    <div
      id="browse"
      className="mx-auto w-full max-w-[1040px] scroll-mt-6 px-6 pb-[110px] sm:px-12"
    >
      <div className="mb-14 h-px bg-ink-gold/[0.18]" />

      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-2 font-eyebrow text-[11px] font-medium uppercase tracking-[0.12em] text-ink-gold-dim">
            Browse the library
          </p>
          <h2 className="font-display text-2xl font-normal text-ink-heading">
            All {techniques.length} techniques
          </h2>
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

          <span className="font-eyebrow text-xs text-ink-muted-dim">
            {filtered.length} of {techniques.length}
          </span>
        </div>
      </div>

      <ul>
        {filtered.map((t) => (
          <li key={t.id} className="border-b border-ink-gold/[0.12]">
            <Link
              href={`/techniques/${t.id}`}
              className="flex flex-col justify-between gap-2 py-[22px] sm:flex-row sm:gap-7"
            >
              <div className="shrink-0 sm:w-[300px]">
                <h3 className="font-display text-base font-medium leading-snug text-ink-heading">
                  {t.name}
                </h3>
                <p className="mt-1 text-[12.5px] italic leading-5 text-ink-muted-soft">
                  {t.sourceIndustry}
                  {t.sourceCompany ? ` — ${t.sourceCompany}` : ""}
                </p>
              </div>
              <p className="flex-1 text-[13.5px] leading-[1.6] text-ink-muted sm:max-w-[420px]">
                {t.mechanism}
              </p>
              <div className="shrink-0 font-eyebrow text-[11px] text-ink-muted-dim sm:w-[140px] sm:text-right">
                {humanizeSlug(t.problemType)}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="py-8 text-sm text-ink-muted">No techniques match these filters.</p>
      )}

      <div className="mt-9 text-center">
        <a
          href="#browse"
          className="font-eyebrow text-xs font-medium uppercase tracking-[0.06em] text-ink-muted transition hover:text-ink-gold"
        >
          View all {techniques.length} techniques →
        </a>
      </div>
    </div>
  );
}
