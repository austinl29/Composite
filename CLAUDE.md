@AGENTS.md

# Composite — Project Reference

Reference-style continuity doc for this codebase. Reload at the start of every
session; not meant to be read once and archived. Verify against actual files/DB
before trusting any count or list below if significant time has passed.

## 1. Project Summary

Composite matches a home-service business operator's described problem to
proven growth/conversion techniques drawn from OTHER industries, with a
personalized explanation of why the parallel transfers.

- **Live app:** https://composite-kappa.vercel.app
- **GitHub:** https://github.com/austinl29/Composite (`main` branch)
- **Vercel project:** `compositeideas/composite`

## 2. Tech Stack

- Next.js (App Router) + TypeScript + Tailwind
- Postgres via Vercel/Neon integration (`DATABASE_URL` in `.env.local`, gitignored)
- Deployed on Vercel

**Git → deploy: NOT connected.** Verified directly against the Vercel project's
own API record (no `link`/`gitRepository` field, only unrelated settings toggles
like `gitForkProtection`) — confirmed twice, most recently while writing this
file. `git push` to GitHub does **not** trigger a deployment. Every deploy so
far has been a manual `vercel --prod` from the CLI. If this ever gets connected
(`vercel git connect`), update this note.

## 3. Data Model

`types/technique.ts` — the `Technique` interface:

| Field | Type | Notes |
|---|---|---|
| `id` | `string` | DB-assigned (uuid) |
| `name` | `string` | |
| `sourceIndustry` | `string` | e.g. "e-commerce", "hospitality" |
| `sourceCompany` | `string \| null` | `null` = general pattern, not one company's story |
| `mechanism` | `string` | why it worked in its original context |
| `evidence` | `string` | the concrete proof, paraphrased |
| `targetVerticals` | `string[]` | home-service verticals it could apply to |
| `transferTemplate` | `string` | draft explanation of why it transfers |
| `problemType` | `string` | the problem category it was researched for |
| `sourceUrl` | `string \| null` | link to the source backing the evidence |
| `createdAt` / `updatedAt` | `string` | DB-assigned |

**DB table** (`techniques`, see `supabase/migrations/`):
- `0001_create_techniques.sql` — base table (`id uuid pk default gen_random_uuid()`,
  all `Technique` fields except `source_url`, snake_case columns)
- `0002_add_source_url.sql` — added `source_url text` (nullable) after the fact,
  once the app needed it for the technique detail page

`lib/techniques.ts` maps DB rows ↔ the `Technique` type
(`getTechniques()`, `getTechniqueById(id)`).

## 4. Sourcing Discipline (critical)

This is what keeps the whole database trustworthy — do not weaken it to hit a
candidate-count target.

- **Verify-or-drop, not verify-or-guess.** Every technique requires a real
  `sourceUrl` that was *directly fetched and read*, not inferred from a search
  snippet. If a claim can't be verified this way, drop the candidate — don't
  include it with a softened claim.
- **One quote-worthy claim per source gets scrutinized individually.** A source
  being real doesn't mean every number on the page is trustworthy — check the
  specific stat being cited, not just the domain.
- **Reject content farms and unnamed "one documented case" claims.** Red flag:
  an unfamiliar domain bundling many oddly-specific stats attributed to
  different named firms — that pattern is how fabricated numbers get dressed
  up as real ones. Also reject anonymized placeholder cases ("ABC Manufacturing",
  "one landscaping company," composite/aggregated examples presented as a single
  case) — several of these were caught and rejected across Day 3 and the Data
  Expansion Pass.
- **Vendor benchmark data is acceptable but weaker tier.** Klaviyo, Samsara,
  Chili Piper, etc. publishing their own aggregate customer data is real and
  usable, but ranks below first-party peer-reviewed research or an independent
  journalistic account. Flag tier gaps like this with a `verificationCaveats`
  field on the candidate JSON entry when the claim holds up but isn't top-tier
  (e.g. a promotional client testimonial, or a mechanism inferred from real data
  rather than stated by the source) — don't silently upgrade its credibility.
  Prefer a claim independently corroborated by more than one source over a
  single vendor/aggregator's self-report.
- **Cross-industry over home-service-native.** The whole product premise is
  techniques transferred FROM other industries — a well-sourced HVAC/plumbing
  marketing blog tactic is deliberately excluded even when verifiable, because
  restating what home-service marketers already write about isn't the point.
- The command that runs this process end-to-end is
  `.claude/commands/find-techniques.md` — read it before running a research
  pass; it has the full sourcing-credibility guard written out.

## 5. Current Database State

**26 approved** techniques live in the database right now (verified directly
against both `research/candidates/*.json` and a live DB query while writing
this file). Full counts across all research to date: 26 approved, 1 rejected,
6 candidate (33 total generated since Day 2).

Approved (`status: "approved"` in `research/candidates/*.json`), by problem type:

- **customers don't trust an unfamiliar contractor:** Put the Reviews Where the
  Decision Happens; Guarantee It So They Don't Have To Worry
- **hiring-and-retaining-field-techs:** Let Your Team Hire Their Own Team;
  Build the Trade, Don't Just Hire For It; Widen the Pool by Removing a Filter
  Nobody Re-Examines
- **increasing-average-ticket-size:** Make the Upsell a Tracked, Incentivized
  Habit; Unbundle the Price So Every Extra Is Its Own Yes; Bundle It Into One
  Easy, Good-Value Choice
- **leads go cold before quoting:** Book It Now, No Back-and-Forth; The
  Three-Touch Follow-Up
- **low quote-to-close rate:** This Price Holds for 7 Days
- **no repeat or referral business:** Give Both Sides a Reason to Talk About
  You; Make Coming Back Worth Something; Treat Repeat Business as a Line Item,
  Not an Afterthought
- **price-shopping / commoditized pricing pressure:** Sell the Outcome, Not
  the Part
- **pricing-and-estimating-confidently:** State the Number First; Price the
  Outcome You Deliver, Not the Hours It Takes; Build a Model, Not a Gut Check
- **safety-and-liability-costs:** Make Safety Talks a Daily Habit, Not a
  Poster; Coach the Driving, Not Just the Job; A Small Safety Budget Pays for
  Itself Many Times Over; Fix the Risk the Data Finds, Not the One You Assumed
- **scheduling-and-dispatch-efficiency:** Let the Algorithm Sequence the Day,
  Not the Driver's Gut
- **seasonal-demand-and-cash-flow:** Sell the Season Before It Starts; Find
  the Season Nobody Else Is Using Your Assets For; Ask for the Season's Money
  Before the Season's Work

**Not approved — still `status: "candidate"`:**
- **#24 "Let Customers Reserve a Slot Instead of Waiting in Line"**
  (scheduling-and-dispatch-efficiency, Starbucks Mobile Order & Pay) — the
  current source only establishes mobile-order adoption percentages, not the
  queue/staff-load mechanism actually claimed. Needs re-sourcing before it can
  be approved. See `research/resourcing-proposals.md`.
- 5 more from the original Day 3 review batch (also pending re-sourcing,
  proposals drafted in `research/resourcing-proposals.md`, not yet applied).

**1 rejected** (kept on record, not deleted): a Day 3 entry whose source was a
content farm with a fabricated-looking illustrative case study.

To re-verify any of this, re-run:
```
python3 -c "
import json, glob
from collections import Counter
c = Counter()
for f in glob.glob('research/candidates/*.json'):
    for cand in json.load(open(f))['candidates']:
        c[cand['status']] += 1
print(c)
"
```

## 6. Diagnosis Agent Rules (critical)

Lives in `app/api/diagnose/route.ts` (POST handler) + `lib/prompts/diagnose.ts`
(system prompt, kept separate so it can be iterated on without touching route
logic). Minimal page at `app/diagnose/page.tsx`.

- **Model:** `claude-opus-4-8`, `thinking: { type: "adaptive" }`,
  `output_config: { effort: "high" }`, structured output via
  `client.messages.parse()` + `zodOutputFormat()`.
- **The single most important rule: the model must ONLY reference techniques
  that exist in the database.** This is enforced *structurally*, not just by
  instruction — `techniqueId` in the Zod response schema is
  `z.enum(techniqueIds)` built from the live database's actual current ids on
  every request, so the model is physically incapable of emitting an id
  outside that set.
- **Defense in depth beyond the schema:** `techniqueName` in the response is
  re-derived server-side from the DB record by `techniqueId`, never trusted
  from the model's free-text output. Any match that somehow doesn't resolve to
  a real record is dropped before the response is returned.
- **Honest empty-match is required behavior, not a fallback.** The system
  prompt explicitly instructs: if nothing in the database is a genuine fit,
  return an empty `matches` array and explain why in `assessment` — never
  force-fit the closest available entry. Verified end-to-end with a real
  unrelated-problem test (workers' comp/injuries) that correctly produced zero
  matches and a specific explanation.
- Every match must cite the technique by exact name and get a `confidence` of
  `strong` / `moderate` / `weak` reflecting genuine mechanism fit, not
  keyword overlap.
- No eval/testing infrastructure exists yet for this agent — that's the next
  planned step (see below).

## 7. Where We Are

- **Week 1 (Days 1-4):** complete. Schema, live DB, browse/filter UI, technique
  detail view, GitHub repo, deployment pipeline all working.
- **Week 2 Day 1:** diagnosis agent (`/api/diagnose` + `/diagnose` page) built
  and verified end-to-end, on production, with a real API key.
- **Data Expansion Pass:** 6 new problem categories researched (18 candidates,
  target was ~22 — shortfall is honest, not padded), reviewed (17 approved, 1
  still candidate), loaded into the live DB.
- **Next up: Week 2 Day 2 — an eval layer for the diagnosis agent.** Nothing
  built yet for this.
