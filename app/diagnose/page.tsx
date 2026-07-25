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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-12">
      <Link
        href="/"
        className="text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
      >
        ← Back to all techniques
      </Link>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Diagnose
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Describe a problem in your business. We&apos;ll check it against the
          techniques in the database.
        </p>
      </header>

      <DiagnoseForm sourceTypeById={sourceTypeById} />
    </div>
  );
}
