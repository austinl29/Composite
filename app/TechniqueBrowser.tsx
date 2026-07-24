"use client";

import { useMemo, useState } from "react";
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

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Composite
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Growth techniques from other industries, approved for review.
        </p>
      </header>

      <div className="flex flex-wrap gap-3">
        <select
          value={vertical}
          onChange={(e) => setVertical(e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
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
          className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          <option value="all">All problem types</option>
          {problemTypes.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-zinc-500 dark:text-zinc-500">
        {filtered.length} of {techniques.length} techniques
      </p>

      <ul className="flex flex-col gap-4">
        {filtered.map((t) => (
          <li
            key={t.id}
            className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <h2 className="font-medium text-black dark:text-zinc-50">{t.name}</h2>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-500">
              {t.sourceIndustry}
              {t.sourceCompany ? ` — ${t.sourceCompany}` : ""}
            </p>
            <p className="mt-2 line-clamp-1 text-sm text-zinc-700 dark:text-zinc-300">
              {t.mechanism}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {t.targetVerticals.map((v) => (
                <span
                  key={v}
                  className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  {v}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-500">
          No techniques match these filters.
        </p>
      )}
    </div>
  );
}
