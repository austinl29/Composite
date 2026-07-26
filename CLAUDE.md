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

**Git → deploy: CONNECTED.** Set up via `vercel git connect --yes` on
2026-07-24, then verified directly against the Vercel project's own API record
— `link.type: "github"`, repo `Composite`, `productionBranch: "main"`. A push
to `main` now triggers a real production deployment automatically; manual
`vercel --prod` is no longer required (though it still works if ever needed).
This replaced the prior not-connected state, and was confirmed working end to
end with a real push (not just the API config check) the same day.

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
| `sourceType` | `SourceType` | sourcing credibility tier — see below |
| `targetVerticals` | `string[]` | home-service verticals it could apply to |
| `transferTemplate` | `string` | draft explanation of why it transfers |
| `problemType` | `string` | the problem category it was researched for |
| `sourceUrl` | `string \| null` | link to the source backing the evidence |
| `createdAt` / `updatedAt` | `string` | DB-assigned |

`SourceType` (`types/technique.ts`) — the sourcing credibility tier, from
strongest to weakest evidence: `"peer-reviewed"` | `"first-party-research"` |
`"secondary-verified"` | `"vendor-benchmark"` | `"promotional-testimonial"`.
Not the same axis as `verificationCaveats` on the candidate JSON (which flags
a specific claim-level caveat) — `sourceType` classifies the source itself.

**DB table** (`techniques`, see `supabase/migrations/`):
- `0001_create_techniques.sql` — base table (`id uuid pk default gen_random_uuid()`,
  all `Technique` fields except `source_url`/`source_type`, snake_case columns)
- `0002_add_source_url.sql` — added `source_url text` (nullable) after the fact,
  once the app needed it for the technique detail page
- `0003_add_source_type.sql` — added `source_type text` (nullable, with a check
  constraint against the 5 valid values) and backfilled for all 26 approved
  entries based on each one's actual sourcing tier

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
  journalistic account. This tiering is now structured, not just prose: every
  approved entry has a `sourceType` field (`peer-reviewed` > `first-party-research`
  > `secondary-verified` > `vendor-benchmark` > `promotional-testimonial`).
  `sourceType` classifies the source itself; `verificationCaveats` (below) flags
  a specific claim-level caveat within an otherwise-acceptable source — the two
  are separate axes. Flag tier gaps like this with a `verificationCaveats`
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

- **Model/effort is configurable, not hardcoded** — `lib/diagnose.ts`
  (`runDiagnosis`, `DEFAULT_DIAGNOSE_CONFIG`) reads `DIAGNOSE_MODEL` /
  `DIAGNOSE_EFFORT` from the environment, falling back to
  `claude-opus-4-8` / `effort: "high"` (`HARDCODED_FALLBACK_CONFIG`) when
  unset. Production has neither var set, so it always runs the hardcoded
  opus-4-8/high fallback — see §8 for the local-dev override and why it
  exists. Structured output via `client.messages.parse()` +
  `zodOutputFormat()` either way.
  - **Not every model supports adaptive thinking / effort control.**
    `claude-haiku-4-5-20251001` rejects both outright (confirmed against
    the live API, 2026-07-26). `DiagnoseModelConfig.supportsAdaptiveReasoning`
    is resolved automatically from the model name
    (`MODELS_WITHOUT_ADAPTIVE_REASONING` in `lib/diagnose.ts`) and gates
    whether `thinking` and `output_config.effort` are sent at all — if you
    add another model to `DIAGNOSE_MODEL` that doesn't support this, add it
    to that list or the request will 400.
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

## 7. Eval Suite & Push-Gate Hook (critical)

**Eval suite:** `evals/diagnose-cases.json` (23 cases: strong-match,
moderate-match, honest-no-match, adversarial — keyword-bait, vague input,
prompt-injection) + `scripts/run-evals.mjs`, which hits `/api/diagnose` live,
checks fabrication/forced-match/forbidden-match/expected-match, and writes
`evals/.last-run.json` (timestamp, pass/fail counts, `blockingFailureCount`,
a sha256 hash of the diagnosis-related files at run time). Run with:
```
node scripts/run-evals.mjs                          # against production
EVAL_BASE_URL=http://localhost:3000 node scripts/run-evals.mjs   # against local dev
```
Failure categories: `fabrication`, `forbidden-match`, `forbidden-pattern`,
and `request-error` are **blocking** (must be zero); `forced-match` (a
plausible-but-debatable match on an ambiguous honest-no-match case),
`missing-expected-match`, and `missing-concrete-reasoning` are known
model-behavior variance and don't block. This split was a deliberate
decision, not an oversight — see the push-gate hook below.

**Eval model policy (2026-07-26):** most eval runs during routine,
unrelated feature work (UX, schema, hooks) don't need real verification of
matching quality — they're just confirming nothing broke.
- **Local/dev default: Haiku.** `.env.local` sets
  `DIAGNOSE_MODEL=claude-haiku-4-5-20251001` and `DIAGNOSE_EFFORT=medium`.
  Cheap, fast, good enough to catch a broken route or a regression in
  ordinary flow. **Not** a substitute for real verification — a real run
  caught Haiku matching a technique it was explicitly forbidden from
  matching on an adversarial keyword-bait case (`adversarial-03`,
  2026-07-26) that opus-4-8/high has never failed. Treat any Haiku-run
  blocking failure as "needs a real opus pass to know if it's real," not
  as evidence the agent itself regressed.
- **Real verification: opus-4-8/effort:high.** Use this — by temporarily
  removing/commenting the two lines above in `.env.local`, or just hitting
  the production endpoint directly (which always uses it) — before
  anything that touches diagnosis reasoning ships, or whenever actually
  evaluating matching quality/behavior itself (not just "did the route
  still respond").
- The push-gate hook (below) doesn't care which model produced a passing
  run, only that it's current and has zero blocking failures. It is not a
  substitute for judgment about which mode of verification a given change
  actually needs.

**Push-gate hook:** `.claude/settings.json` registers a `PreToolUse`
hook (matcher `Bash`) running `.claude/hooks/check-diagnose-eval.py`
before every `git push`. It blocks unless `evals/.last-run.json` exists,
its file hash matches the current on-disk state of
`app/api/diagnose/route.ts`, `lib/prompts/diagnose.ts`, `lib/diagnose.ts`,
and `evals/diagnose-cases.json`, and `blockingFailureCount === 0`. Dumb and
fast on purpose — no LLM calls, just stdin JSON, a regex check for whether
the command is actually a `git push`, a file hash, and a field read. If it
blocks, the message tells you to run `node scripts/run-evals.mjs`; if the
files haven't changed since the last passing run, no re-run is forced.

## 8. Where We Are

- **Week 1 (Days 1-4):** complete. Schema, live DB, browse/filter UI, technique
  detail view, GitHub repo, deployment pipeline all working.
- **Week 2 Day 1:** diagnosis agent (`/api/diagnose` + `/diagnose` page) built
  and verified end-to-end, on production, with a real API key.
- **Data Expansion Pass:** 6 new problem categories researched (18 candidates,
  target was ~22 — shortfall is honest, not padded), reviewed (17 approved, 1
  still candidate), loaded into the live DB.
- **Infrastructure/schema cleanup pass:** git-to-deploy connected and verified
  with a real push, `sourceType` added to schema/DB/all 26 approved entries,
  git identity fixed (`austinl29` / `228589130+austinl29@users.noreply.github.com`).
- **Week 2 Day 2:** eval suite built (23 cases, see §7) and the diagnose
  page UX redesigned (loading state, confidence-coded match cards,
  `sourceType` surfaced per match, respectful honest-no-match display,
  detail-page links).
- **Week 3 Day 1:** optional business context (avg ticket price,
  active/repeat customer count, crew size, primary lead source) added to
  the diagnose form and prompt — used for concrete reasoning when present,
  with an explicit anti-fabrication rule against turning those numbers into
  a projected outcome/dollar figure. All fields optional; no-context flow
  unchanged.
- **Model/effort tiering evaluated** via `scripts/eval-config-compare.ts`
  against opus-4-8/medium and sonnet-5/high — neither cleared the bar
  (see `lib/diagnose.ts`'s `HARDCODED_FALLBACK_CONFIG` comment for the full
  evidence). Kept opus-4-8/high as the hardcoded production fallback; later
  made model/effort configurable via `DIAGNOSE_MODEL`/`DIAGNOSE_EFFORT` so
  routine local eval runs could default to cheap Haiku instead — see §7.
- **Push-gate hook** built: `git push` is blocked unless a fresh, zero-
  blocking-failure eval run covers the current diagnosis-related files.
  See §7.
- **Next up:** the free-text equipment/situation field mentioned during the
  Week 3 model-tiering pass isn't built yet — when it lands, decide whether
  it needs its own always-opus-high tier (see the tiering-rule discussion
  in `lib/diagnose.ts`'s comment history).
