import Link from "next/link";
import { getTechniques } from "@/lib/techniques";
import DiagnoseForm from "./DiagnoseForm";

export const dynamic = "force-dynamic";

export default async function DiagnosePage() {
  const techniques = await getTechniques();
  const sourceTypeById = Object.fromEntries(
    techniques.map((t) => [t.id, t.sourceType])
  );

  return (
    <div className="min-h-full bg-ink-bg font-editorial text-ink-text">
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8 px-4 py-10 sm:px-6 sm:py-16">
        <Link
          href="/"
          className="w-fit font-eyebrow text-xs uppercase tracking-widest text-ink-muted transition hover:text-ink-text"
        >
          ← Back to all techniques
        </Link>

        <header className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-medium tracking-tight text-ink-text sm:text-4xl">
            Diagnose
          </h1>
          <p className="max-w-prose text-sm leading-6 text-ink-muted">
            Describe a problem in your business. We&apos;ll check it against the
            techniques in the database.
          </p>
        </header>

        <DiagnoseForm sourceTypeById={sourceTypeById} techniqueCount={techniques.length} />
      </div>
    </div>
  );
}
