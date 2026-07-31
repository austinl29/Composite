import Link from "next/link";
import { getTechniques } from "@/lib/techniques";
import HeroExampleCard from "./HeroExampleCard";

export const dynamic = "force-dynamic";

const STEPS = ["DESCRIBE", "MATCH", "GET PLAY"];

export default async function Home() {
  const techniques = await getTechniques();
  const count = techniques.length;

  return (
    <div className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-ink-bg font-editorial text-ink-text">
      <div className="grid-texture pointer-events-none absolute inset-0" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 700px 550px at 80% 35%, rgba(201,169,97,.14), transparent 70%)",
        }}
      />

      <header className="relative flex shrink-0 items-center justify-between border-b border-ink-border px-6 py-[22px] sm:px-12">
        <span className="font-display text-lg font-semibold text-ink-heading">Composite</span>
        <Link
          href="/techniques"
          className="font-eyebrow text-[11px] font-medium tracking-[0.06em] text-ink-muted-dim transition hover:text-ink-gold"
        >
          BROWSE ALL {count} →
        </Link>
      </header>

      <div className="relative flex flex-1 items-center">
        <div className="mx-auto grid w-full max-w-[1180px] grid-cols-1 items-center gap-10 px-6 py-16 sm:px-12 sm:py-20 md:grid-cols-[1.15fr_0.85fr] md:gap-8">
          <div className="flex flex-col items-start gap-[18px]">
            <span className="font-eyebrow text-[11px] font-semibold tracking-[0.14em] text-ink-gold">
              {count} TECHNIQUES · TRACED TO REAL SOURCES
            </span>
            <h1 className="font-display text-[clamp(32px,6vw,42px)] font-medium leading-[1.16] text-ink-heading-hero">
              Someone already fixed this. Just not in your trade.
            </h1>
            <p className="max-w-[380px] text-[15px] leading-[1.6] text-ink-muted">
              Describe the problem — we&apos;ll show the exact play, matched and explained.
            </p>

            <div className="mt-1.5 flex flex-col items-start gap-2.5">
              <Link href="/diagnose" className="btn-gold px-7 py-[15px] text-[12.5px]">
                SHOW ME WHAT&apos;S PROVEN →
              </Link>
              <span className="font-eyebrow text-[10.5px] text-ink-muted-dim">
                30 seconds · no signup
              </span>
            </div>

            <div className="mt-3.5 flex flex-wrap items-center gap-3">
              {STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-ink-gold-glow font-eyebrow text-[9.5px] font-semibold text-ink-gold">
                      {i + 1}
                    </span>
                    <span className="font-eyebrow text-[9.5px] font-medium tracking-[0.03em] text-ink-muted-dim">
                      {step}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <span className="text-[11px] text-ink-muted-dim/60">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <HeroExampleCard />
        </div>
      </div>
    </div>
  );
}
