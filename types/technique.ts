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
  /** Home-service verticals this could apply to, e.g. ["plumbing", "HVAC"] */
  targetVerticals: string[];
  /** Template explaining why this technique transfers to an operator's business */
  transferTemplate: string;
  /** The business problem this technique was researched for, e.g. "leads go cold before quoting" */
  problemType: string;
  createdAt: string;
  updatedAt: string;
}
