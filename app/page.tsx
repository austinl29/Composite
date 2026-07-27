import Link from "next/link";
import { getTechniques } from "@/lib/techniques";
import TechniqueBrowser from "./TechniqueBrowser";

export const dynamic = "force-dynamic";

export default async function Home() {
  const techniques = await getTechniques();
  const count = techniques.length;

  return (
    <div className="flex flex-1 flex-col bg-ink-bg font-editorial text-ink-text">
      <header className="flex items-center justify-between border-b border-ink-gold/15 px-6 py-[26px] sm:px-12">
        <span className="font-display text-lg font-medium tracking-[0.01em] text-ink-heading">
          Composite
        </span>
        <a
          href="#browse"
          className="font-eyebrow text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted transition hover:text-ink-gold"
        >
          Browse all {count} →
        </a>
      </header>

      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center px-6 pb-[90px] pt-[100px] text-center sm:px-12 sm:pt-[130px]">
        <p className="font-eyebrow text-[11px] font-medium uppercase tracking-[0.14em] text-ink-gold-dim">
          {count} techniques · home service growth
        </p>
        <h1 className="mt-[22px] font-display text-[clamp(32px,8vw,54px)] font-normal leading-[1.25] text-ink-heading-hero">
          Find the technique other industries already proved works.
        </h1>
        <p className="mt-[22px] max-w-[540px] text-[17px] leading-[1.65] text-ink-muted">
          Describe a problem in your business. We&apos;ll check it against {count}{" "}
          techniques traced to real sources, each with a plain explanation of why
          it might transfer.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3.5">
          <Link
            href="/diagnose"
            className="rounded-[3px] bg-ink-gold px-[42px] py-[18px] font-eyebrow text-[13px] font-semibold uppercase tracking-[0.08em] text-ink-surface transition hover:-translate-y-px hover:bg-ink-gold-hover hover:shadow-[0_12px_28px_rgba(201,169,97,0.25)]"
          >
            Diagnose your problem →
          </Link>
          <a
            href="#browse"
            className="font-eyebrow text-xs font-medium tracking-[0.04em] text-ink-muted transition hover:text-ink-gold"
          >
            or browse the library ↓
          </a>
        </div>
      </div>

      <TechniqueBrowser techniques={techniques} />
    </div>
  );
}
