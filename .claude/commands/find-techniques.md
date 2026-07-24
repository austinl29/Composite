---
description: Research candidate growth/conversion techniques from other industries for a given business problem
argument-hint: <problem-type>
allowed-tools: WebSearch, WebFetch, Write, Bash(mkdir:*)
---

# Find Techniques

Research candidate growth/conversion techniques from OTHER industries that could
transfer to a home-service business problem. This is the research/discovery step
only — it does not diagnose an operator's specific business, and it does not touch
the database or the live app.

## Input

Problem type: $ARGUMENTS

## Reference schema

@types/technique.ts

## Instructions

1. Treat the problem type above as the stated problem (e.g. "leads go cold before
   quoting"). Do not assume it's specific to home services — search broadly across
   ANY industry (e-commerce, SaaS, hospitality, healthcare, retail, automotive,
   real estate, insurance, etc.) for real businesses or case studies that solved an
   analogous underlying problem.

2. Use web search to find real, verifiable sources: case studies, company blog
   posts, press coverage, conference talks, books, published data. Every candidate
   must trace back to a real source you can link to. Do not invent a candidate to
   hit a quota — if you can't verify it, drop it.

   **Sourcing credibility guard** (learned from a Day 3 review that caught a
   fabricated case study which had passed initial verification):
   - Treat an unfamiliar domain as a red flag if it bundles many oddly-specific
     statistics, each attributed to a different named company or research firm,
     across many blog posts. This pattern (a "content farm") is how fabricated
     statistics get dressed up as real ones — the specificity itself is not
     evidence of credibility. Fetch the actual primary source it claims to cite,
     not just the aggregator's summary of it.
   - Prefer a claim independently corroborated by at least one other source
     (another outlet reporting the same figures, or the original company/study
     being cited directly) over a single vendor or aggregator blog's self-report,
     even when that single source is real and fetchable. A number that only
     exists in one obscure place is weaker evidence than the same number
     appearing consistently across unrelated sources.
   - When the primary source is the company or researcher the finding is about
     (their own site, their own report, their own talk), that beats a third
     party summarizing it secondhand — re-fetch and cite the first-party page
     directly whenever one exists, rather than settling for whoever wrote about
     it first in search results.

3. Synthesize 3-5 candidate techniques. For each one:
   - Paraphrase and summarize in your own original wording. Never copy-paste
     marketing copy or verbatim text from any source.
   - Fill every field from the `Technique` type above **except** `id`, `createdAt`,
     `updatedAt` (those are assigned at DB insert time, not during research):
     - `name` — short, memorable name for the technique
     - `sourceIndustry` — the industry it came from
     - `sourceCompany` — the specific company/case, or `null` if it's a general
       pattern rather than one company's story
     - `mechanism` — why it worked there, in your own words
     - `evidence` — the concrete proof/data/result you found, paraphrased
     - `targetVerticals` — which home-service verticals (e.g. plumbing, HVAC,
       landscaping, roofing, electrical, pest control) this could plausibly apply to
     - `transferTemplate` — a draft explanation of why this transfers to a
       home-service operator's business. This is a first draft for human review,
       not final copy.
   - Add two fields outside the `Technique` type, needed for review:
     - `sourceUrl` — a real, working link to the source
     - `status` — always the literal string `"candidate"`. Never mark anything
       accepted or final; that decision belongs to a human reviewer later.

4. Boundaries — do not cross these:
   - Never write to Supabase, the live app, or anything the deployed site reads
     from.
   - Never touch diagnosis/matching logic — that component doesn't exist yet and
     isn't this command's job.
   - Only output is the one JSON file described below.

5. Write the result to `research/candidates/<slug>.json`, where `<slug>` is the
   problem type in kebab-case. Create the `research/candidates/` directory first if
   it doesn't exist. The file should contain a JSON object shaped like:

   ```json
   {
     "problemType": "the input problem type, verbatim",
     "generatedAt": "ISO 8601 timestamp",
     "candidates": [
       {
         "name": "...",
         "sourceIndustry": "...",
         "sourceCompany": "...",
         "mechanism": "...",
         "evidence": "...",
         "targetVerticals": ["..."],
         "transferTemplate": "...",
         "sourceUrl": "https://...",
         "status": "candidate"
       }
     ]
   }
   ```

6. After writing the file, report a short summary: how many candidates were found
   and the file path. Keep the summary in your own words — don't paste marketing
   copy from sources there either.
