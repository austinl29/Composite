import Link from "next/link";
import { notFound } from "next/navigation";
import { getTechniqueById } from "@/lib/techniques";

export const dynamic = "force-dynamic";

export default async function TechniqueDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const technique = await getTechniqueById(id);

  if (!technique) {
    notFound();
  }

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
          {technique.name}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-500">
          {technique.sourceIndustry}
          {technique.sourceCompany ? ` — ${technique.sourceCompany}` : ""}
        </p>
        <p className="mt-1 text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-600">
          Researched for: {technique.problemType}
        </p>
      </header>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
          Mechanism
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-800 dark:text-zinc-200">
          {technique.mechanism}
        </p>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
          Evidence
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-800 dark:text-zinc-200">
          {technique.evidence}
        </p>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
          Why this transfers
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-800 dark:text-zinc-200">
          {technique.transferTemplate}
        </p>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
          Target verticals
        </h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {technique.targetVerticals.map((v) => (
            <span
              key={v}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {v}
            </span>
          ))}
        </div>
      </section>

      {technique.sourceUrl && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
            Source
          </h2>
          <a
            href={technique.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block break-all text-sm text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {technique.sourceUrl}
          </a>
        </section>
      )}
    </div>
  );
}
