import Link from "next/link";
import { getTechniques } from "@/lib/techniques";
import DiagnoseForm from "./DiagnoseForm";

export const dynamic = "force-dynamic";

export default async function DiagnosePage() {
  const techniques = await getTechniques();
  const count = techniques.length;

  // Same fetch already returns techniques ordered by name (see
  // lib/techniques.ts) — reused here as the "№ NN / total" library index
  // shown on each match card, plus the mechanism/evidence/sourceUrl fields
  // MatchDeepDive's "YOUR MATCH" card renders. Purely client-side prop
  // plumbing from data already fetched server-side — no new API route or
  // request/response shape involved.
  const techniqueMetaById = Object.fromEntries(
    techniques.map((t, i) => [
      t.id,
      {
        sourceType: t.sourceType,
        sourceIndustry: t.sourceIndustry,
        sourceCompany: t.sourceCompany,
        mechanism: t.mechanism,
        evidence: t.evidence,
        sourceUrl: t.sourceUrl,
        index: i + 1,
      },
    ])
  );

  return (
    <div className="relative min-h-full flex-1 bg-ink-bg font-editorial text-ink-text">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 600px 400px at 50% 0%, rgba(201,169,97,.1), transparent 70%)",
        }}
      />

      <header className="relative flex items-center justify-between border-b border-ink-border px-6 py-[22px] sm:px-12">
        <Link href="/" className="font-display text-lg font-semibold text-ink-heading">
          ← Composite
        </Link>
      </header>

      <div className="relative mx-auto flex w-full max-w-[640px] flex-col px-6 pb-[130px] pt-14 sm:px-12 sm:pt-20">
        <h1 className="font-display text-3xl font-medium leading-[1.3] text-ink-heading-hero sm:text-[32px]">
          What&apos;s the problem?
        </h1>
        <p className="mt-2.5 text-[14px] leading-[1.6] text-ink-muted">
          Describe it in your own words. No forms, no jargon. We&apos;ll check it
          against {count} techniques traced to real sources.
        </p>

        <div className="mt-9">
          <DiagnoseForm techniqueMetaById={techniqueMetaById} techniqueCount={count} />
        </div>
      </div>
    </div>
  );
}
