// Static guard, no network/LLM calls: fails if any sourceType enum value
// doesn't map to a human-readable label, or if a label leaks the raw
// hyphenated enum text — the exact bug class that put "secondary-verified"
// in front of a user on the source-verification "stamp". Run with:
//   npx tsx scripts/check-source-type-labels.ts
import { ALL_SOURCE_TYPES, SOURCE_TYPE_LABELS } from "../lib/sourceTypeLabels";

const failures: string[] = [];

// The actual bug this guards against is the raw enum value reaching the UI
// completely unprocessed (e.g. literally "secondary-verified"). A label is
// allowed to contain a hyphenated English word that happens to overlap with
// the enum's wording (e.g. "Peer-reviewed research" is a legitimate label
// for sourceType "peer-reviewed") — what it must never do is BE the raw
// enum value, verbatim, with no human formatting applied at all.
for (const sourceType of ALL_SOURCE_TYPES) {
  const label = SOURCE_TYPE_LABELS[sourceType];

  if (!label || !label.trim()) {
    failures.push(`No label mapped for sourceType "${sourceType}"`);
    continue;
  }

  if (label.trim().toLowerCase() === sourceType.toLowerCase()) {
    failures.push(
      `Label for "${sourceType}" is the raw enum value, unprocessed ("${label}")`
    );
  }
}

if (failures.length > 0) {
  console.log("=== source-type label guard: FAIL ===");
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}

console.log(
  `=== source-type label guard: PASS (${ALL_SOURCE_TYPES.length}/${ALL_SOURCE_TYPES.length} sourceType values map to a human-readable label) ===`
);
