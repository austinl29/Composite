import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { getTechniques } from "../lib/techniques";
import { runDiagnosis, type BusinessContext, type DiagnoseModelConfig } from "../lib/diagnose";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const casesPath = path.join(__dirname, "../evals/diagnose-cases.json");
const { cases: allCases } = JSON.parse(readFileSync(casesPath, "utf8"));
const limit = process.env.EVAL_LIMIT ? Number(process.env.EVAL_LIMIT) : undefined;
const cases = limit ? allCases.slice(0, limit) : allCases;

const ALL_CONFIGS: { key: string; label: string; config: DiagnoseModelConfig }[] = [
  { key: "a", label: "a) opus-4-8 / effort:high (baseline)", config: { model: "claude-opus-4-8", effort: "high", supportsAdaptiveReasoning: true } },
  { key: "b", label: "b) opus-4-8 / effort:medium", config: { model: "claude-opus-4-8", effort: "medium", supportsAdaptiveReasoning: true } },
  { key: "c", label: "c) sonnet-5 / effort:high", config: { model: "claude-sonnet-5", effort: "high", supportsAdaptiveReasoning: true } },
];
const configFilter = process.env.CONFIG_FILTER
  ? new Set(process.env.CONFIG_FILTER.split(","))
  : undefined;
const CONFIGS = configFilter ? ALL_CONFIGS.filter((c) => configFilter.has(c.key)) : ALL_CONFIGS;

async function main() {
  const techniques = await getTechniques();
  const nameToId = new Map(techniques.map((t) => [t.name, t.id]));
  const validIds = new Set(techniques.map((t) => t.id));

  function resolveNames(names: string[] = []) {
    return names.map((n) => {
      const id = nameToId.get(n);
      if (!id) throw new Error(`Unknown technique name in eval case: "${n}"`);
      return id;
    });
  }

  const allResults: Record<string, any[]> = {};

  for (const { label, config } of CONFIGS) {
    console.log(`\n\n########## ${label} ##########\n`);
    const results: any[] = [];

    for (const c of cases as any[]) {
      const expectedIds = resolveNames(c.expectedTechniqueNames);
      const forbiddenIds = resolveNames(c.forbiddenTechniqueNames);
      const businessContext: BusinessContext = c.businessContext || {};

      let outcome;
      try {
        outcome = await runDiagnosis({ problem: c.problem, businessContext, techniques, config });
      } catch (err) {
        outcome = { ok: false as const, error: err instanceof Error ? err.message : String(err) };
      }

      const failures: string[] = [];
      let matches: any[] = [];
      let assessment = "";
      let latencyMs = 0;

      if (!outcome.ok) {
        failures.push(`Request/parse failed: ${outcome.error}`);
      } else {
        matches = outcome.result.matches;
        assessment = outcome.result.assessment;
        latencyMs = outcome.result.latencyMs;

        for (const m of matches) {
          if (!validIds.has(m.techniqueId)) {
            failures.push(`Fabrication: unknown techniqueId "${m.techniqueId}"`);
          }
        }
        if (c.expectedBehavior === "honest-no-match" && matches.length > 0) {
          failures.push(
            `Expected honest-no-match but got: ${matches.map((m) => m.techniqueName).join(", ")}`
          );
        }
        if (c.expectedBehavior === "strong-match" || c.expectedBehavior === "moderate-match") {
          const returnedIds = new Set(matches.map((m) => m.techniqueId));
          const missing = expectedIds.filter((id) => !returnedIds.has(id));
          if (missing.length > 0) {
            failures.push(`Missing expected technique(s): ${missing.join(", ")}`);
          }
        }
        for (const m of matches) {
          if (forbiddenIds.includes(m.techniqueId)) {
            failures.push(`Forbidden match returned: "${m.techniqueName}"`);
          }
        }

        const combinedText = [assessment, ...matches.map((m) => m.explanation)].filter(Boolean).join("\n");
        if (Array.isArray(c.requiredAnyStrings) && c.requiredAnyStrings.length > 0) {
          const lower = combinedText.toLowerCase();
          const found = c.requiredAnyStrings.some((s: string) => lower.includes(s.toLowerCase()));
          if (!found) failures.push(`No required string found (${c.requiredAnyStrings.join(", ")})`);
        }
        if (Array.isArray(c.forbiddenPatterns)) {
          for (const p of c.forbiddenPatterns) {
            const re = new RegExp(p, "i");
            const m = combinedText.match(re);
            if (m) failures.push(`Forbidden pattern matched (/${p}/i): "${m[0]}"`);
          }
        }
      }

      const pass = failures.length === 0;
      results.push({
        id: c.id,
        expectedBehavior: c.expectedBehavior,
        pass,
        failures,
        latencyMs,
        matches: matches.map((m) => ({
          techniqueName: m.techniqueName,
          confidence: m.confidence,
          explanation: m.explanation,
        })),
        assessment,
      });

      console.log(
        `[${pass ? "PASS" : "FAIL"}] ${c.id} (${c.expectedBehavior}) — ${latencyMs}ms${
          failures.length ? "\n    - " + failures.join("\n    - ") : ""
        }`
      );
    }

    const passCount = results.filter((r) => r.pass).length;
    const latencies = results.filter((r) => r.latencyMs > 0).map((r) => r.latencyMs);
    const avgLatency = latencies.length
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : 0;
    console.log(
      `\n--- ${label}: ${passCount}/${results.length} passed, avg latency ${avgLatency}ms ---`
    );

    allResults[label] = results;
  }

  const outPath = path.join(__dirname, "../evals/config-compare-results.json");
  writeFileSync(outPath, JSON.stringify(allResults, null, 2));
  console.log(`\n\nFull results written to ${outPath}`);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
