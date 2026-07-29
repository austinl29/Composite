import Link from "next/link";
import { notFound } from "next/navigation";
import { getTechniqueById, getTechniques } from "@/lib/techniques";
import { SOURCE_TYPE_LABELS } from "@/lib/sourceTypeLabels";

export const dynamic = "force-dynamic";

function humanizeSlug(slug: string): string {
  return slug.replace(/-/g, " ");
}

export default async function TechniqueDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [technique, techniques] = await Promise.all([getTechniqueById(id), getTechniques()]);

  if (!technique) {
    notFound();
  }

  const count = techniques.length;

  return (
    <div className="min-h-full flex-1 bg-ink-bg font-editorial text-ink-text">
      <header className="flex items-center justify-between border-b border-ink-border px-6 py-[22px] sm:px-12">
        <Link href="/" className="font-display text-lg font-semibold text-ink-heading">
          Composite
        </Link>
      </header>

      <div className="mx-auto flex w-full max-w-[700px] flex-col gap-5 px-6 py-12 sm:px-12">
        <Link
          href="/techniques"
          className="font-eyebrow text-[10px] font-medium tracking-[0.04em] text-ink-muted-dim transition hover:text-ink-gold"
        >
          ← BROWSE ALL {count}
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <span className="badge-verified px-[7px] py-[3px] text-[8.5px]">
            {SOURCE_TYPE_LABELS[technique.sourceType]}
          </span>
          <span className="font-eyebrow text-[9px] font-medium tracking-[0.04em] text-ink-muted-dim">
            {humanizeSlug(technique.problemType).toUpperCase()}
          </span>
        </div>

        <h1 className="font-display text-[30px] font-medium leading-[1.25] text-ink-heading">
          {technique.name}
        </h1>

        <div className="flex flex-wrap items-center gap-2 font-eyebrow text-[10.5px] text-ink-muted-dim">
          <span>
            FROM: {technique.sourceIndustry}
            {technique.sourceCompany ? ` (${technique.sourceCompany})` : ""}
          </span>
          <span className="text-ink-gold">→</span>
          {technique.targetVerticals.map((v) => (
            <span
              key={v}
              className="rounded-full border border-ink-border-soft px-2.5 py-1"
            >
              {v}
            </span>
          ))}
        </div>

        <section className="flex flex-col gap-1.5 border-t border-ink-border pt-5">
          <span className="font-eyebrow text-[9.5px] font-semibold tracking-[0.06em] text-ink-gold">
            WHY IT WORKS
          </span>
          <p className="text-[13px] leading-[1.65] text-ink-text/85">{technique.mechanism}</p>
        </section>

        <section className="flex flex-col gap-1.5">
          <span className="font-eyebrow text-[9.5px] font-semibold tracking-[0.06em] text-ink-gold">
            THE PROOF
          </span>
          <p className="text-[13px] leading-[1.65] text-ink-text/85">{technique.evidence}</p>
          {technique.sourceUrl && (
            <a
              href={technique.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 break-all font-eyebrow text-[10.5px] text-ink-muted-dim transition hover:text-ink-gold"
            >
              Source: {technique.sourceUrl} ↗
            </a>
          )}
        </section>

        <section className="flex flex-col gap-1.5">
          <span className="font-eyebrow text-[9.5px] font-semibold tracking-[0.06em] text-ink-gold">
            HOW IT COULD APPLY TO YOU
          </span>
          <p className="text-[13px] leading-[1.65] text-ink-text/85">
            {technique.transferTemplate}
          </p>
        </section>

        <Link href="/diagnose" className="btn-gold mt-2 self-start px-6 py-3.5 text-[11.5px]">
          DIAGNOSE MY OWN PROBLEM INSTEAD →
        </Link>
      </div>
    </div>
  );
}
