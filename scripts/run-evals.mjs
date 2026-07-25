import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Client } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const casesPath = path.join(__dirname, "../evals/diagnose-cases.json");

const baseUrl = process.env.EVAL_BASE_URL || "https://composite-kappa.vercel.app";

const { cases } = JSON.parse(readFileSync(casesPath, "utf8"));

// Resolve the live set of valid technique ids/names directly from the DB —
// this is also the fabrication check's ground truth, independent of whatever
// the API happens to return.
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const { rows: techniques } = await client.query("select id, name from techniques");
await client.end();

const validIds = new Set(techniques.map((t) => t.id));
const nameToId = new Map(techniques.map((t) => [t.name, t.id]));

function resolveNames(names) {
  return names.map((n) => {
    const id = nameToId.get(n);
    if (!id) throw new Error(`Eval case references unknown technique name: "${n}"`);
    return id;
  });
}

console.log(`Running ${cases.length} eval cases against ${baseUrl}`);
console.log(`Live technique set: ${techniques.length} techniques\n`);

const results = [];

for (const c of cases) {
  const expectedIds = resolveNames(c.expectedTechniqueNames || []);
  const forbiddenIds = resolveNames(c.forbiddenTechniqueNames || []);

  let response;
  let httpStatus;
  try {
    const res = await fetch(`${baseUrl}/api/diagnose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problem: c.problem, ...(c.businessContext || {}) }),
    });
    httpStatus = res.status;
    response = await res.json();
  } catch (err) {
    results.push({
      case: c,
      pass: false,
      failures: [`Request failed: ${err.message}`],
      response: null,
      httpStatus: null,
    });
    continue;
  }

  const failures = [];

  if (httpStatus !== 200) {
    failures.push(`HTTP status ${httpStatus}, expected 200`);
  }

  const matches = Array.isArray(response.matches) ? response.matches : [];

  // Fabrication check: every returned techniqueId must exist in the live DB.
  for (const m of matches) {
    if (!validIds.has(m.techniqueId)) {
      failures.push(
        `Fabrication: response references techniqueId "${m.techniqueId}" (name: "${m.techniqueName}") which does not exist in the live database`
      );
    }
  }

  // Honest no-match check.
  if (c.expectedBehavior === "honest-no-match" && matches.length > 0) {
    failures.push(
      `Expected honest-no-match (empty matches) but got ${matches.length} match(es): ${matches
        .map((m) => m.techniqueName)
        .join(", ")}`
    );
  }

  // Expected-match check for strong/moderate cases.
  if (c.expectedBehavior === "strong-match" || c.expectedBehavior === "moderate-match") {
    const returnedIds = new Set(matches.map((m) => m.techniqueId));
    const missing = expectedIds.filter((id) => !returnedIds.has(id));
    if (missing.length > 0) {
      const missingNames = missing.map(
        (id) => techniques.find((t) => t.id === id)?.name || id
      );
      failures.push(
        `Expected technique(s) not found in matches: ${missingNames.join(", ")}`
      );
    }
  }

  // Forbidden-match check (keyword-bait / prompt-injection cases).
  for (const m of matches) {
    if (forbiddenIds.includes(m.techniqueId)) {
      failures.push(
        `Forbidden match returned: "${m.techniqueName}" should not have been matched for this case`
      );
    }
  }

  // Combined text used for the two text-content checks below: the overall
  // assessment plus every match's explanation.
  const combinedText = [response.assessment, ...matches.map((m) => m.explanation)]
    .filter(Boolean)
    .join("\n");

  // Concrete-reasoning check: with business context provided, at least one
  // of the operator's actual numbers should show up in the reasoning.
  if (Array.isArray(c.requiredAnyStrings) && c.requiredAnyStrings.length > 0) {
    const lowerText = combinedText.toLowerCase();
    const found = c.requiredAnyStrings.some((s) => lowerText.includes(s.toLowerCase()));
    if (!found) {
      failures.push(
        `Expected concrete reasoning referencing one of: ${c.requiredAnyStrings.join(", ")} — none found in assessment/explanations`
      );
    }
  }

  // Anti-fabrication check: never a projected dollar/customer-count outcome.
  if (Array.isArray(c.forbiddenPatterns)) {
    for (const patternSrc of c.forbiddenPatterns) {
      const re = new RegExp(patternSrc, "i");
      const match = combinedText.match(re);
      if (match) {
        failures.push(
          `Fabricated-projection pattern matched (/${patternSrc}/i): "${match[0]}"`
        );
      }
    }
  }

  results.push({
    case: c,
    pass: failures.length === 0,
    failures,
    response,
    httpStatus,
  });
}

console.log("=== Results ===\n");
for (const r of results) {
  const status = r.pass ? "PASS" : "FAIL";
  console.log(`[${status}] ${r.case.id} (${r.case.expectedBehavior})`);
  if (!r.pass) {
    for (const f of r.failures) console.log(`    - ${f}`);
  }
}

const passCount = results.filter((r) => r.pass).length;
const failCount = results.length - passCount;

console.log(`\n=== Summary ===`);
console.log(`${passCount}/${results.length} passed, ${failCount} failed`);

if (failCount > 0) {
  console.log(`\n=== Full responses for failing cases ===\n`);
  for (const r of results.filter((r) => !r.pass)) {
    console.log(`--- ${r.case.id} ---`);
    console.log(`Problem: ${r.case.problem}`);
    if (r.case.businessContext) {
      console.log(`Business context sent: ${JSON.stringify(r.case.businessContext)}`);
    }
    console.log(`Expected: ${r.case.expectedBehavior}, techniques: ${JSON.stringify(r.case.expectedTechniqueNames || [])}`);
    console.log(`HTTP status: ${r.httpStatus}`);
    console.log(`Full response:`);
    console.log(JSON.stringify(r.response, null, 2));
    console.log();
  }
}

process.exit(failCount > 0 ? 1 : 0);
