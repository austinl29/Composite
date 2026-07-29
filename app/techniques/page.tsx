import Link from "next/link";
import { getTechniques } from "@/lib/techniques";
import TechniqueBrowser from "../TechniqueBrowser";

export const dynamic = "force-dynamic";

export default async function TechniquesPage() {
  const techniques = await getTechniques();

  return (
    <div className="min-h-full flex-1 bg-ink-bg font-editorial text-ink-text">
      <header className="flex items-center justify-between border-b border-ink-border px-6 py-[22px] sm:px-12">
        <Link href="/" className="font-display text-lg font-semibold text-ink-heading">
          Composite
        </Link>
        <Link
          href="/diagnose"
          className="font-eyebrow text-[11px] font-medium tracking-[0.06em] text-ink-muted-dim transition hover:text-ink-gold"
        >
          DIAGNOSE MY PROBLEM →
        </Link>
      </header>

      <TechniqueBrowser techniques={techniques} />
    </div>
  );
}
