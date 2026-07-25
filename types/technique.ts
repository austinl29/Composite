/** Sourcing credibility tier, from strongest to weakest evidence */
export type SourceType =
  | "peer-reviewed"
  | "first-party-research"
  | "secondary-verified"
  | "vendor-benchmark"
  | "promotional-testimonial";

export interface Technique {
  id: string;
  name: string;
  /** Industry the technique originated in, e.g. "e-commerce", "hospitality" */
  sourceIndustry: string;
  /** Specific company credited with the technique, if known */
  sourceCompany: string | null;
  /** Why the technique worked in its original context */
  mechanism: string;
  /** Proof it worked: data, results, citations */
  evidence: string;
  /** Sourcing credibility tier for the evidence */
  sourceType: SourceType;
  /** Home-service verticals this could apply to, e.g. ["plumbing", "HVAC"] */
  targetVerticals: string[];
  /** Template explaining why this technique transfers to an operator's business */
  transferTemplate: string;
  /** The business problem this technique was researched for, e.g. "leads go cold before quoting" */
  problemType: string;
  /** Link to the original source backing the evidence */
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
