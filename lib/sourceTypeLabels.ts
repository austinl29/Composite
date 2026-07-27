import type { SourceType } from "@/types/technique";

/**
 * Human-readable labels for each sourceType — never render the raw enum
 * value to a user (e.g. "secondary-verified"). `Record<SourceType, string>`
 * forces this map to stay complete at compile time if SourceType ever gains
 * a member.
 */
export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  "peer-reviewed": "Peer-reviewed research",
  "first-party-research": "First-party source",
  "secondary-verified": "Independently verified",
  "vendor-benchmark": "Vendor benchmark data",
  "promotional-testimonial": "Published case study",
};

// TS union types don't exist at runtime, so this list is kept in sync
// manually with types/technique.ts's SourceType union — used by
// scripts/check-source-type-labels.ts to verify every value actually maps
// to a human-readable label, independent of the compile-time guarantee
// above (which only proves the map has an entry, not that the entry is
// safe to show a user).
export const ALL_SOURCE_TYPES: SourceType[] = [
  "peer-reviewed",
  "first-party-research",
  "secondary-verified",
  "vendor-benchmark",
  "promotional-testimonial",
];
