import Link from "next/link";
import { getTechniques } from "@/lib/techniques";
import DiagnoseForm from "./DiagnoseForm";

export const dynamic = "force-dynamic";

export default async function DiagnosePage() {
  const techniques = await getTechniques();
  const count = techniques.length;

  // Same fetch already returns techniques ordered by name (see
  // lib/techniques.ts) — reused here as the "№ NN / total" library index
  // shown on each match card, rather than a separate query.
  const techniqueMetaById = Object.fromEntries(
    techniques.map((t, i) => [
      t.id,
      {
        sourceType: t.sourceType,
        sourceIndustry: t.sourceIndustry,
        sourceCompany: t.sourceCompany,
        index: i + 1,
      },
    ])
  );

  return (
    <div className="min-h-full bg-ink-bg font-editorial text-ink-text">
      <header className="flex items-center justify-between border-b border-ink-gold/15 px-6 py-[26px] sm:px-12">
        <Link
          href="/"
          className="font-display text-lg font-medium tracking-[0.01em] text-ink-heading"
        >
          Composite
        </Link>
        <Link
          href="/"
          className="font-eyebrow text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted transition hover:text-ink-gold"
        >
          ← All techniques
        </Link>
      </header>

      <div className="mx-auto flex w-full max-w-[640px] flex-col px-6 pb-[130px] pt-[70px] sm:px-12 sm:pt-[100px]">
        <p className="font-eyebrow text-[11px] font-medium uppercase tracking-[0.14em] text-ink-gold-dim">
          Diagnose
        </p>
        <h1 className="mt-5 font-display text-3xl font-normal leading-[1.35] text-ink-heading-hero sm:text-4xl">
          Describe what&apos;s going on in your business.
        </h1>
        <p className="mt-[18px] max-w-[540px] text-base leading-[1.65] text-ink-muted">
          We&apos;ll check it against {count}{" "}
          techniques traced to real sources. Each match comes with a
          confidence level and a plain explanation of why it might transfer —
          and if nothing genuinely fits, we&apos;ll tell you that too.
        </p>

        <div className="mt-12">
          <DiagnoseForm techniqueMetaById={techniqueMetaById} techniqueCount={count} />
        </div>
      </div>
    </div>
  );
}
