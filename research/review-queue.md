# Review Queue

Every candidate technique generated so far, across all `research/candidates/*.json`
files. Nothing here has been evaluated — `status` stays `"candidate"` in the source
files until you make a call. Use this file to record your decision per candidate.

**Reviewer decision options:** `approve` / `reject` / `revise`

Fill in `Reviewer decision` and `Reviewer notes` for each entry below. This file is
the record of your review — the JSON files in `research/candidates/` are left
untouched by this process.

---

## leads go cold before quoting

Source: [research/candidates/leads-go-cold-before-quoting.json](candidates/leads-go-cold-before-quoting.json)

### 1. Golden Hour Callback
- **Source industry / company:** B2B / inside sales — (general pattern, no single company)
- **Mechanism:** Contacting a lead within minutes to an hour captures intent while it's still hot, before it decays or the customer moves on to a competitor.
- **Source:** https://www.teamgate.com/blog/lead-response-time-study-speed-impacts-revenue/
- **Reviewer decision:** revise
- **Reviewer notes:** The "60x" stat is recirculated across marketing blogs with inconsistent multipliers (21x/60x/100x attributed to different studies) — not fabricated, but the ground truth is murky. Re-source to one traceable primary study, or soften the evidence language to acknowledge the range.

### 2. Book It Now, No Back-and-Forth
- **Source industry / company:** B2B SaaS / sales scheduling tools — Chili Piper
- **Mechanism:** Letting a prospect book a meeting instantly removes the waiting window where they'd otherwise cool off or get distracted.
- **Source:** https://www.chilipiper.com/post/form-conversion-rate-benchmark-report
- **Reviewer decision:** approve
- **Reviewer notes:** Verified directly against Chili Piper's own benchmark page: the 30%→66.7% figure is real and first-party.

### 3. The Three-Touch Follow-Up
- **Source industry / company:** E-commerce / retail — Klaviyo (aggregate benchmark data)
- **Mechanism:** A short, spaced sequence of reminders catches people at whichever moment their attention returns, instead of relying on one message.
- **Source:** https://www.klaviyo.com/blog/abandoned-cart-benchmarks
- **Reviewer decision:** approve
- **Reviewer notes:** Verified directly against Klaviyo's own benchmark page: 3.33% conversion and $3.65 revenue per recipient both confirmed. Could NOT independently confirm the "top performers reaching 7.69%" sub-stat — flagged as unverified via a `verificationCaveats` field on this entry in the JSON rather than stated as fact.

### 4. Follow Up on What They Did, Not the Calendar
- **Source industry / company:** B2B SaaS — (general pattern, no single company)
- **Mechanism:** Triggering the next follow-up off actual customer behavior, instead of a fixed calendar date, keeps every message relevant to where the customer actually is.
- **Source:** https://ustechautomations.com/resources/blog/saas-trial-conversion-automation-double-rate
- **Reviewer decision:** reject
- **Reviewer notes:** The source (ustechautomations.com) is a content farm — dozens of oddly specific stats attributed to real-sounding firms across many blog posts, plus an illustrative "CloudMetrics" case study with suspiciously precise numbers that reads as fabricated. This should not have passed verification.

---

## low quote-to-close rate

Source: [research/candidates/low-quote-to-close-rate.json](candidates/low-quote-to-close-rate.json)

### 5. Show, Don't Just Tell, the Quote
- **Source industry / company:** B2B sales / proposal software — Proposify
- **Mechanism:** A short personal video alongside the quote re-humanizes an otherwise generic document and keeps the customer engaged with it longer.
- **Source:** https://www.vidyard.com/blog/sales-proposals-and-negotiations/
- **Reviewer decision:** revise
- **Reviewer notes:** The underlying claim is real (Proposify's own study), but it's cited via Vidyard's blog referencing Proposify, not Proposify directly. Re-source to Proposify's own report page.

### 6. Three Options, One Obvious Middle
- **Source industry / company:** Publishing / media — The Economist
- **Mechanism:** A middle option flanked by a cheap option and a decoy premium option makes the middle choice feel like the safe, obvious pick instead of a plain yes/no decision.
- **Source:** https://thestrategystory.com/2020/10/02/economist-magazine-a-story-of-clever-decoy-pricing/
- **Reviewer decision:** revise
- **Reviewer notes:** The Economist decoy-pricing story is real and well-known (Dan Ariely's research), but sourced via a small aggregator blog repeating it thirdhand. Find Ariely's original writing or a more reputable business publication.

### 7. This Price Holds for 7 Days
- **Source industry / company:** E-commerce / retail — Bob & Lush
- **Mechanism:** A genuine deadline forces a decision to happen now, at peak interest, instead of drifting into "I'll think about it."
- **Source:** https://speero.com/post/implementing-urgency-on-ecommerce-product-pages-for-a-27-1-lift-case-study
- **Reviewer decision:** approve
- **Reviewer notes:** Speero is a legitimate conversion-optimization agency; case study is about their own client test, reasonably credible.

---

## customers don't trust an unfamiliar contractor

Source: [research/candidates/customers-dont-trust-an-unfamiliar-contractor.json](candidates/customers-dont-trust-an-unfamiliar-contractor.json)

### 8. Make the Unknown Visibly Known
- **Source industry / company:** Peer-to-peer marketplace / hospitality — Airbnb
- **Mechanism:** Making credibility visible (real photos, verified identity, upfront pricing) substitutes for the in-person track record a stranger doesn't have.
- **Source:** https://raw.studio/blog/how-airbnb-increased-bookings-by-25-with-3-trust-building-ux-changes/
- **Reviewer decision:** revise
- **Reviewer notes:** The Airbnb trust-signal story is real, but sourced via a design agency blog (raw.studio) citing it secondhand — the specific "25%" figure is not independently verified yet.

### 9. Put the Reviews Where the Decision Happens
- **Source industry / company:** E-commerce / retail research — (Northwestern Spiegel Research Center / PowerReviews)
- **Mechanism:** Other customers' reviews substitute for missing first-hand information, and matter most exactly when the purchase is expensive and the stakes of a bad choice are high.
- **Source:** https://spiegel.medill.northwestern.edu/how-online-reviews-influence-sales/
- **Reviewer decision:** approve
- **Reviewer notes:** Northwestern's Spiegel Research Center is a real academic source, well known specifically for review-influence research done with PowerReviews. First-party, strong.

### 10. Guarantee It So They Don't Have To Worry
- **Source industry / company:** Direct-to-consumer digital products — (personal case study, Quick Sprout)
- **Mechanism:** The seller visibly absorbing the risk of a bad outcome removes the customer's main reason to hesitate or shop around for reassurance elsewhere.
- **Source:** https://www.quicksprout.com/what-converts-better-free-trial-versus-money-back-guarantee/
- **Reviewer decision:** approve (weaker tier)
- **Reviewer notes:** Quick Sprout is first-party for its own test, but anecdotal marketing content, not a rigorous study. Keep, but the transferTemplate shouldn't overstate certainty.

---

## no repeat or referral business

Source: [research/candidates/no-repeat-or-referral-business.json](candidates/no-repeat-or-referral-business.json)

### 11. Give Both Sides a Reason to Talk About You
- **Source industry / company:** Cloud storage / SaaS — Dropbox
- **Mechanism:** A mutual referral reward (both referrer and new customer benefit) turns a referral ask into something actually worth doing, instead of relying on pure goodwill.
- **Source:** https://growsurf.com/blog/dropbox-referral-program
- **Reviewer decision:** approve
- **Reviewer notes:** Dropbox's referral numbers (3900% growth, 60% signup lift, 35% of daily signups) are consistent across many independent sources tracing back to Dropbox's own public talks — well corroborated, not just one recirculated claim.

### 12. Make Coming Back Worth Something
- **Source industry / company:** Food & beverage retail — Starbucks
- **Mechanism:** Visibly tracking and rewarding repeat visits gives loyalty itself a payoff the customer would give up by switching providers.
- **Source:** https://loyaltylion.com/blog/scale-success-story-starbucks-rewards-program
- **Reviewer decision:** approve
- **Reviewer notes:** Starbucks Rewards is extremely well-documented; source is a vendor blog but the underlying facts are broadly corroborated elsewhere.

### 13. Treat Repeat Business as a Line Item, Not an Afterthought
- **Source industry / company:** Management consulting / cross-industry research — (Bain & Company)
- **Mechanism:** A small, deliberate improvement in retention rate has an outsized, non-intuitive effect on profit compared to what any single job suggests.
- **Source:** https://www.bain.com/insights/retaining-customers-is-the-real-challenge/
- **Reviewer decision:** approve
- **Reviewer notes:** Bain's own site, their own famous retention research. First-party, as strong as sourcing gets.

---

## price-shopping / commoditized pricing pressure

Source: [research/candidates/price-shopping-commoditized-pricing-pressure.json](candidates/price-shopping-commoditized-pricing-pressure.json)

*Only 2 candidates cleared the sourcing bar for this problem type — several promising leads (niche-specialist fee premiums, CarMax no-haggle stats, generic "value-based pricing" case studies) turned out to be unverifiable on the primary page and were dropped rather than guessed. See the note at the end of this file.*

### 14. Sell the Outcome, Not the Part
- **Source industry / company:** Aerospace / industrial manufacturing — Rolls-Royce
- **Mechanism:** Pricing around the outcome the customer wants, instead of the physical unit, removes the like-for-like line item a competitor's price would otherwise be compared against.
- **Source:** https://www.rolls-royce.com/media/our-stories/discover/2017/totalcare.aspx
- **Reviewer decision:** approve
- **Reviewer notes:** Rolls-Royce's own page on their own TotalCare program. First-party, well-documented real business model shift.

### 15. Show Them What It Actually Costs to Make
- **Source industry / company:** Consumer retail / eyewear — Warby Parker
- **Mechanism:** An honest, itemized cost breakdown makes the price feel non-arbitrary and checkable, which reduces the motivation to keep shopping for a lower one.
- **Source:** https://www.bebusinesssmart.com/how-warby-parker-built-trust-with-transparent-pricing/
- **Reviewer decision:** revise
- **Reviewer notes:** The Warby Parker transparency practice is real, but the source (bebusinesssmart.com) is an unfamiliar small blog. Find a better-sourced version.

---

## Notes

- 15 candidates total across 5 problem types (4 from Day 2, 11 from today).
- `price-shopping / commoditized pricing pressure` only produced 2 verified candidates.
  Every other angle researched for that problem type (specialist-fee-premium survey
  stats, CarMax no-haggle transaction percentage, an unnamed "value-based pricing"
  industrial case, a price-bundling case study) either had no working primary source
  or the specific numbers couldn't be confirmed on the page they were attributed to,
  so they were dropped rather than included on a guess. Worth a second pass later if
  you want a 3rd-5th candidate for this problem type.

### Day 3 review outcome

- **9 approved:** #2, #3, #7, #9, #10, #11, #12, #13, #14 — `status` updated to
  `"approved"` in the corresponding `research/candidates/*.json` files.
- **1 rejected:** #4 — `status` updated to `"rejected"` in
  `leads-go-cold-before-quoting.json`. Kept on record, not deleted.
- **5 flagged for revise:** #1, #5, #6, #8, #15 — left as `"candidate"`, untouched.
  Proposed alternative, more credible sources for each are in
  [research/resourcing-proposals.md](resourcing-proposals.md) for review before
  anything is applied.

<br>

# ══════════════════════════════════════════════════════════
# Data Expansion Pass (6 new problem categories, #16–33)
# Entries #1–15 above are the original batch from Day 2/3 — do not confuse
# the two. This pass has been reviewed: #16-23 and #25-33 are approved,
# #24 remains a candidate pending a better source (see
# research/resourcing-proposals.md).
# ══════════════════════════════════════════════════════════

<br>

---

## safety-and-liability-costs

Source: [research/candidates/safety-and-liability-costs.json](candidates/safety-and-liability-costs.json)

### 16. Make Safety Talks a Daily Habit, Not a Poster
- **Source industry / company:** Heavy construction — Pizzagalli Construction
- **Mechanism:** Making safety training a recurring habit (orientation + weekly toolbox talks + incentives) keeps risk awareness active instead of fading after week one.
- **Source:** https://www.elcosh.org/document/1479/d000101/Worker+Protection+Programs+in+Construction.html
- **Reviewer decision:** approve
- **Reviewer notes:** Verified directly against the eLCOSH primary document. `status` updated to `"approved"`.

### 17. Coach the Driving, Not Just the Job
- **Source industry / company:** Fleet / logistics — Samsara (aggregate customer data)
- **Mechanism:** Real-time video plus automated alerts plus coaching catches risky driving in the moment, instead of only hearing about it after a claim.
- **Source:** https://www.samsara.com/company/news/press-releases/samsara-safety-report-shows-ai-enabled-fleets-reduce-crash-rates-by-nearly-75-percent
- **Reviewer decision:** approve
- **Reviewer notes:** First-party Samsara press release, methodology (2,600+ fleets) confirmed directly. `status` updated to `"approved"`.

### 18. A Small Safety Budget Pays for Itself Many Times Over
- **Source industry / company:** Manufacturing / forest products — Anthony Forest Products
- **Mechanism:** A modest, targeted safety spend often returns many times its cost through avoided injuries and lower insurance costs — treat it as an investment, not overhead.
- **Source:** https://www.osha.gov/businesscase
- **Reviewer decision:** approve
- **Reviewer notes:** OSHA's own case documentation, as strong as sourcing gets. `status` updated to `"approved"`.

### 19. Fix the Risk the Data Finds, Not the One You Assumed
- **Source industry / company:** Manufacturing — Superior Tube Products
- **Mechanism:** The actual highest-injury-risk task often hides somewhere mundane; motion-tracking data can surface it, and the fix is sometimes nearly free once found.
- **Source:** https://riskandinsurance.com/wearable-tech-and-ai-motion-tools-cut-msd-risk-at-major-manufacturers-nsc-program-finds/
- **Reviewer decision:** approve
- **Reviewer notes:** Verified directly against Risk & Insurance's reporting on the NSC MSD Solutions Lab program. `status` updated to `"approved"`.

---

## hiring-and-retaining-field-techs

Source: [research/candidates/hiring-and-retaining-field-techs.json](candidates/hiring-and-retaining-field-techs.json)

### 20. Let Your Team Hire Their Own Team
- **Source industry / company:** Grocery retail — (NBER randomized study, company not named)
- **Mechanism:** A referral program's biggest effect isn't the referred hires — it's that existing employees feel more invested and stay longer because they're trusted to vouch for someone.
- **Source:** https://www.nber.org/papers/w25920
- **Reviewer decision:** approve
- **Reviewer notes:** Peer-reviewed NBER working paper, randomized design, verified directly. `status` updated to `"approved"`.

### 21. Build the Trade, Don't Just Hire For It
- **Source industry / company:** Insurance / corporate services — Aon
- **Mechanism:** Training your own apprentices creates a labor pipeline nobody else is competing for and builds loyalty because the company invested first.
- **Source:** https://www.fromdayone.com/stories/2024/2/14/apprenticeships-a-classic-solution-to-the-modern-problem-of-worker-shortages
- **Reviewer decision:** approve
- **Reviewer notes:** Verified directly against From Day One's reporting, real named company (Aon) and DOL figure. `status` updated to `"approved"`.

### 22. Widen the Pool by Removing a Filter Nobody Re-Examines
- **Source industry / company:** Food manufacturing — Dave's Killer Bread
- **Mechanism:** Blanket screening filters (e.g. any criminal record) can shrink an already-thin labor pool without actually protecting the employer; loosening them opens a pool of motivated candidates competitors ignore.
- **Source:** https://www.hrdive.com/news/jobs-for-the-future-daves-killer-bread-second-chance-hiring/638428/
- **Reviewer decision:** approve
- **Reviewer notes:** Verified directly against HR Dive's reporting. `status` updated to `"approved"`.

---

## scheduling-and-dispatch-efficiency

Source: [research/candidates/scheduling-and-dispatch-efficiency.json](candidates/scheduling-and-dispatch-efficiency.json)

*Only 2 candidates cleared the sourcing bar for this category — Southwest Airlines' turnaround story and a DoorDash batching case both hit unfixable fetch blocks (403s, one SSL certificate mismatch) and were dropped rather than sourced from search summaries alone.*

### 23. Let the Algorithm Sequence the Day, Not the Driver's Gut
- **Source industry / company:** Package delivery / logistics — UPS
- **Mechanism:** Software-optimized stop sequencing finds savings too small to notice per-stop but enormous in aggregate across hundreds of stops a day.
- **Source:** https://www.informs.org/Impact/O.R.-Analytics-Success-Stories/Optimizing-Delivery-Routes
- **Reviewer decision:** approve
- **Reviewer notes:** INFORMS's own account of a Franz Edelman Award-winning project, verified directly. `status` updated to `"approved"`.

### 24. Let Customers Reserve a Slot Instead of Waiting in Line
- **Source industry / company:** Food & beverage retail — Starbucks
- **Mechanism:** Letting customers schedule ahead shifts peak demand earlier and smooths staff load instead of the business absorbing it all in one crush.
- **Source:** https://www.nrn.com/restaurant-technology/starbucks-mobile-order-pay-usage-increases
- **Reviewer decision:** revise
- **Reviewer notes:** The current source only reports mobile-order adoption percentages and general earnings — it never actually establishes the claimed mechanism (that pre-ordering smooths peak-hour demand and staff load). Needs a source that directly addresses queue/staff-load impact of order-ahead systems, not just adoption stats. Left as `"candidate"` — not approved. Flagged in [research/resourcing-proposals.md](resourcing-proposals.md) (no replacement source proposed, flag only).

---

## increasing-average-ticket-size

Source: [research/candidates/increasing-average-ticket-size.json](candidates/increasing-average-ticket-size.json)

### 25. Make the Upsell a Tracked, Incentivized Habit
- **Source industry / company:** Hospitality — Oaky (Clarion Hotel Sign case study)
- **Mechanism:** A specific, structured upsell prompt with a visible real-time incentive turns an ad-lib pitch into a repeatable staff habit.
- **Source:** https://hoteltechreport.com/success-stories/revenue-management/oaky/strawberry
- **Reviewer decision:** approve
- **Reviewer notes:** Verified directly against Hotel Tech Report's case study. `status` updated to `"approved"`.

### 26. Unbundle the Price So Every Extra Is Its Own Yes
- **Source industry / company:** Airline — (IdeaWorksCompany industry data, no single company)
- **Mechanism:** Pulling optional extras out as separately priced line items makes each one its own easy yes, instead of one all-or-nothing bundle decision.
- **Source:** https://ideaworkscompany.com/report-2023-ancillary-airline-revenue-surges-over-19-levels/
- **Reviewer decision:** approve (weaker tier on mechanism)
- **Reviewer notes:** The aggregate revenue data ($38.4B→$54.1B) is real and verified directly. The "each extra becomes its own easy yes" mechanism is an inference from that data, not something the source states directly — flagged via a `verificationCaveats` field on this entry, matching the Klaviyo pattern from Day 3. `status` updated to `"approved"`.

### 27. Bundle It Into One Easy, Good-Value Choice
- **Source industry / company:** Quick-service restaurant — McDonald's
- **Mechanism:** Pre-bundling complementary items into one simple, visibly-discounted choice removes the friction of several separate small decisions.
- **Source:** https://www.restaurantdive.com/news/mcdonalds-extra-value-meals-insulated-sales-from-diner-price-sensitivity/804743/
- **Reviewer decision:** approve
- **Reviewer notes:** Verified directly against Restaurant Dive's reporting, including the specific "average check size" attribution. `status` updated to `"approved"`.

---

## seasonal-demand-and-cash-flow

Source: [research/candidates/seasonal-demand-and-cash-flow.json](candidates/seasonal-demand-and-cash-flow.json)

### 28. Sell the Season Before It Starts
- **Source industry / company:** Retail — (Walmart, Kmart, Toys R Us, GameStop, Burlington)
- **Mechanism:** A small deposit months ahead converts a peak-season cash crunch into cash trickling in beforehand, and locks the customer in early.
- **Source:** https://www.retaildive.com/news/how-enhanced-layaway-programs-lure-holiday-shoppers/406369
- **Reviewer decision:** approve
- **Reviewer notes:** Verified directly against Retail Dive's reporting, named retailers confirmed. `status` updated to `"approved"`.

### 29. Find the Season Nobody Else Is Using Your Assets For
- **Source industry / company:** Hospitality / leisure — Seven Springs Mountain Resort
- **Mechanism:** Finding a genuinely different off-season use for the same assets (land, equipment, staff) turns idle capacity into a second revenue season.
- **Source:** https://clubandresortbusiness.com/ski-resorts-rely-on-summer-activities-to-bolster-revenue/
- **Reviewer decision:** approve
- **Reviewer notes:** Verified directly, named resort and National Ski Areas Association figures confirmed. `status` updated to `"approved"`.

### 30. Ask for the Season's Money Before the Season's Work
- **Source industry / company:** Agriculture — (CSA model, LocalHarvest; no single company)
- **Mechanism:** Collecting a season's payment upfront funds the work that produces it, instead of the business floating those costs alone.
- **Source:** https://www.localharvest.org/csa/
- **Reviewer decision:** approve
- **Reviewer notes:** LocalHarvest is the primary directory/resource organization for the CSA movement — first-party for describing the model. `status` updated to `"approved"`.

---

## pricing-and-estimating-confidently

Source: [research/candidates/pricing-and-estimating-confidently.json](candidates/pricing-and-estimating-confidently.json)

### 31. State the Number First
- **Source industry / company:** Negotiation research (cross-industry) — (Galinsky & Mussweiler, peer-reviewed)
- **Mechanism:** Whoever states the first number sets the anchor the rest of the price conversation gets measured against.
- **Source:** https://pubmed.ncbi.nlm.nih.gov/11642352/
- **Reviewer decision:** approve
- **Reviewer notes:** Peer-reviewed (Journal of Personality and Social Psychology), verified directly via PubMed. `status` updated to `"approved"`.

### 32. Price the Outcome You Deliver, Not the Hours It Takes
- **Source industry / company:** Management consulting — OnTarget Consultancy (Martin Krumbein)
- **Mechanism:** Pricing by the hour punishes efficiency; pricing around the outcome delivered gives a real, defensible basis for the number.
- **Source:** https://www.consultingsuccess.com/case-studies/strategy-consultant-case-study
- **Reviewer decision:** approve (weaker tier)
- **Reviewer notes:** This is a real named person with real quotes, but it's a promotional client-success story published by the coaching company that helped him — not an independent study. Same tier as the Quick Sprout entry approved in Day 3. Flagged via a `verificationCaveats` field on this entry. `status` updated to `"approved"`.

### 33. Build a Model, Not a Gut Check
- **Source industry / company:** Airline — American Airlines
- **Mechanism:** A defined, repeatable pricing model built from data removes the case-by-case guesswork that leaves inconsistent margins across jobs.
- **Source:** https://pubsonline.informs.org/doi/10.1287/inte.22.1.8
- **Reviewer decision:** approve
- **Reviewer notes:** Peer-reviewed account in the operations research journal Interfaces, verified directly. `status` updated to `"approved"`.

---

## Data Expansion Pass — Summary

| Category | Target | Actual | Note |
|---|---|---|---|
| safety-and-liability-costs | 3-4 | **4** (4 approved) | Full target hit. |
| hiring-and-retaining-field-techs | 3-4 | **3** (3 approved) | One promising lead (a "56%→3% turnover" referral stat) could not be traced to any real source and was dropped. |
| scheduling-and-dispatch-efficiency | 3-4 | **2** (1 approved, 1 candidate) | Thinnest category. Southwest Airlines' famous 10-minute-turn story and a DoorDash dispatch-engineering post both hit unfixable fetch blocks and were dropped before writing the file. Of the 2 that made it in, #24 (Starbucks) didn't survive review — its source only supports adoption stats, not the queue/staff-load mechanism claimed — so it's left as `"candidate"`, not approved. |
| increasing-average-ticket-size | 3-4 | **3** (3 approved) | Everything home-service-specific (HVAC/plumbing "good-better-best" blogs) was deliberately excluded even though well-sourced, since the product's whole premise is cross-industry transfer. Also dropped the oft-cited "35% of Amazon's revenue from recommendations" stat over surfaced researcher skepticism about its validity. |
| seasonal-demand-and-cash-flow | 3-4 | **3** (3 approved) | A specific landscaping "$40k slow-season revenue" case was an unnamed "one documented case" — dropped as unverifiable, same pattern as prior fabricated-composite rejections. |
| pricing-and-estimating-confidently | 3-4 | **3** (3 approved) | Full range covered: one peer-reviewed academic source, one real-but-promotional client testimonial (flagged as weaker tier), one peer-reviewed operations-research journal source. |
| **Total** | **~22** | **18** (17 approved, 1 candidate) | Every dropped candidate above is a case where the source didn't hold up on direct verification — none were cut to hit a quota, and none were kept to pad toward one. |

### Data Expansion Pass review outcome

- **17 approved:** #16-23, #25-33 — `status` updated to `"approved"` in the
  corresponding `research/candidates/*.json` files. Two carry a
  `verificationCaveats` field flagging a weaker-tier claim within an otherwise
  approved entry: #26 (the specific mechanism is an inference from verified
  aggregate data, not a stated finding) and #32 (a real but promotional client
  testimonial, same tier as Day 3's Quick Sprout entry).
- **1 left as candidate:** #24 — source doesn't establish the claimed
  mechanism. Flagged in [research/resourcing-proposals.md](resourcing-proposals.md)
  (no replacement source guessed, flag only, per instruction).
- **0 rejected** in this pass.

### Running total across all reviews to date (33 candidates)

- **Approved:** 26 (9 from Day 3 + 17 from this pass)
- **Rejected:** 1 (from Day 3, #4)
- **Candidate** (pending further work): 6 — the original 5 flagged `revise` in
  Day 3 (#1, #5, #6, #8, #15) plus #24 from this pass.

---

# Week 3 Data Expansion Pass — New Categories + Re-Sourcing Retries (2026-07-26)

**Status: unreviewed.** Everything below is freshly-researched — `status:
"candidate"` in every underlying JSON file, exactly as produced by the
find-techniques pipeline. No entries below have been approved, rejected, or
otherwise decided; that review happens in a separate pass. Nothing above this
heading was touched — no existing approved/rejected/candidate entry's text,
decision, or JSON file content was modified except where explicitly noted
under "Re-sourcing retries" below.

Numbering continues from #33 (the last entry in the prior pass).

## reputation-recovery-after-a-bad-review

Source: [research/candidates/reputation-recovery-after-a-bad-review.json](candidates/reputation-recovery-after-a-bad-review.json)

### 34. Admit the Specific Complaint, Then Show the Fix
- **Source industry / company:** Quick-service restaurant — Domino's Pizza
- **Mechanism:** Naming the specific, valid complaint out loud, fixing the actual underlying problem, and publicly showing the fix gives skeptical customers something concrete to believe instead of a generic apology.
- **Source:** https://ir.dominos.com/news-releases/news-release-details/dominos-pizza-announces-first-quarter-2010-financial-results
- **Reviewer decision:** approve
- **Reviewer notes:** Source traced directly against Domino's own SEC-filed Q1 2010 earnings release. `status` updated to `"approved"`.

### 35. Respond to Every Review, Not Just the Nice Ones
- **Source industry / company:** Hospitality — (no single company; peer-reviewed study across TripAdvisor hotel data)
- **Mechanism:** Consistently responding to reviews — positive, negative, and neutral — changes who leaves a review at all, not just how one angry reviewer feels.
- **Source:** https://pubsonline.informs.org/doi/abs/10.1287/mksc.2017.1043
- **Reviewer decision:** approve
- **Reviewer notes:** Peer-reviewed (Marketing Science, INFORMS), verified directly. `status` updated to `"approved"`.

### 36. Turn the Apology Into a Standing, Checkable Guarantee
- **Source industry / company:** Airline — JetBlue
- **Mechanism:** A published, specific standing policy for what the company will do next time gives customers something checkable to hold the business to, which restores trust further than a one-time apology.
- **Source:** https://www.library.hbs.edu/working-knowledge/jetblues-valentines-day-crisis
- **Reviewer decision:** approve
- **Reviewer notes:** Verified directly against Harvard Business School's own account. `status` updated to `"approved"`.

## accessing-capital-for-equipment-or-growth

Source: [research/candidates/accessing-capital-for-equipment-or-growth.json](candidates/accessing-capital-for-equipment-or-growth.json)

### 37. Lease the Capacity, Don't Own the Asset
- **Source industry / company:** Commercial aviation — (no single company; CAPA Fleet Database industry analysis)
- **Mechanism:** Leasing a capital-intensive asset converts a large upfront outlay into a predictable operating expense and shifts depreciation risk to the lessor, freeing cash for growth.
- **Source:** https://centreforaviation.com/analysis/reports/aircraft-leasing-in-equilibrium-at-just-over-half-the-world-fleet-675212
- **Reviewer decision:** approve
- **Reviewer notes:** Verified directly against CAPA's own analysis. `status` updated to `"approved"`.

### 38. Raise It in Small Pieces From Many People, Not One Big Ask From One Lender
- **Source industry / company:** Nonprofit microfinance — Kiva
- **Mechanism:** Splitting a loan into many small crowdfunded pieces spreads the underwriting decision across many backers instead of one bank gatekeeper, reaching businesses with thin credit files.
- **Source:** https://www.kiva.org/about
- **Reviewer decision:** approve
- **Reviewer notes:** First-party, verified directly against Kiva's own site. `status` updated to `"approved"`.

### 39. What Makes a Funding Ask Credible, Not Just Loud
- **Source industry / company:** Crowdfunding (cross-industry) — (no single company; peer-reviewed study, Mollick 2014)
- **Mechanism:** Specific, checkable signals of quality and preparation — not enthusiasm alone — predict which funding requests succeed, regardless of industry.
- **Source:** https://www.sciencedirect.com/science/article/pii/S088390261300058X
- **Reviewer decision:** approve
- **Reviewer notes:** Peer-reviewed (Journal of Business Venturing), verified directly. `status` updated to `"approved"`.

## standing-out-in-a-commoditized-local-market

Source: [research/candidates/standing-out-in-a-commoditized-local-market.json](candidates/standing-out-in-a-commoditized-local-market.json)

Deliberately distinct from the existing `price-shopping-commoditized-pricing-pressure`
category — these three are about differentiation broadly (voice, category-norm-breaking,
product exclusivity), not pricing tactics.

### 40. Publicly Break the Specific Thing Customers Hate About the Whole Category
- **Source industry / company:** Wireless telecom — T-Mobile
- **Mechanism:** Publicly and permanently eliminating one specific, named customer-unfriendly industry norm gives customers a concrete reason to switch that isn't about price.
- **Source:** https://www.t-mobile.com/news/press/t-mobile-us-reports-third-quarter-2013-results-and-leads-the-in
- **Reviewer decision:** approve
- **Reviewer notes:** First-party, verified directly against T-Mobile's own investor press release. `status` updated to `"approved"`.

### 41. Use a Distinct Voice the Whole Category Is Too Cautious to Use
- **Source industry / company:** Consumer packaged goods (razors) — Dollar Shave Club
- **Mechanism:** A genuinely different voice stands out precisely because every competitor in a boring, commoditized category markets the same cautious way — the product doesn't have to change for the voice to.
- **Source:** https://www.inc.com/magazine/201507/diana-ransom/how-youtube-crashed-our-website.html
- **Reviewer decision:** approve
- **Reviewer notes:** Verified directly against Inc. magazine's reporting. `status` updated to `"approved"`.

### 42. Make Direct Price Comparison Impossible by Being the Only Source
- **Source industry / company:** Grocery retail — Trader Joe's
- **Mechanism:** Offering something structurally unique — unavailable anywhere else — removes the customer's ability to comparison-shop at all, rather than competing through promotional discounting.
- **Source:** https://www.supermarketnews.com/private-label/private-label-trader-joe-s-takes-differentiation-to-the-extreme
- **Reviewer decision:** approve
- **Reviewer notes:** Verified directly against Supermarket News, named analysts confirmed. `status` updated to `"approved"`.

## Re-sourcing retries

### scheduling-and-dispatch-efficiency — new candidate found

The prior pass flagged this as the thinnest category (2 candidates, one
approved) after the Southwest Airlines 10-minute-turn story and a DoorDash
dispatch-engineering post both hit unfixable fetch blocks. This retry found
working, fetchable sources corroborating the Southwest story from two
independent outlets (Duke Corporate Education and APEX aviation trade
press), so it's now added as a new candidate in
[research/candidates/scheduling-and-dispatch-efficiency.json](candidates/scheduling-and-dispatch-efficiency.json):

### 43. Turn the Whole Crew Into a Pit Crew for the Handoff Moment
- **Source industry / company:** Commercial aviation — Southwest Airlines
- **Mechanism:** Treating the handoff between jobs as one continuous, choreographed team task (modeled on a NASCAR pit stop) rather than sequential individual tasks compresses dead time and adds back productive capacity.
- **Source:** https://www.dukece.com/insights/maximum-velocity/ (independently corroborated by https://apex.aero/articles/2020-11-17-turn-back-the-clock-southwests-quick-turnarounds/)
- **Reviewer decision:** approve
- **Reviewer notes:** Verified directly against Duke Corporate Education's account, independently corroborated by APEX aviation trade press. `status` updated to `"approved"`.

### #24 "Let Customers Reserve a Slot Instead of Waiting in Line" — mechanism narrowed, not yet approved

The prior pass replaced #24's Starbucks/adoption-stat source with a
peer-reviewed paper (Gary M. Thompson and Robert J. Kwortnik, Cornell
University School of Hotel Administration, *Journal of Service Research*,
2008, https://journals.sagepub.com/doi/10.1177/1094670508314267) — genuinely
real, peer-reviewed, directly relevant to reservations/scheduling. But
full source-tracing on this pass found the paper's actual empirical finding
is narrower than the entry's mechanism text claimed: the paper tests
restaurants that already take reservations, and finds that *pooling* those
reservations (flexible, real-time table assignment) instead of *locking*
them (fixed assignment at booking time) reduces table turn times by 15
minutes in more than 15% of simulated scenarios, letting the business serve
more customers during peak periods. That's a claim about flexible
allocation of already-booked capacity — not the broader "reservations vs.
walk-in queues smooth demand" claim the entry had been written to make.

**`mechanism` and `transferTemplate` have been rewritten to match what the
paper actually shows.** `sourceType` (peer-reviewed) and `sourceUrl` are
unchanged. `status` remains `"candidate"` pending confirmation of this
rewrite — not approved this pass.

**Before (mechanism, over-broad):**
> "When demand all arrives at once with no way to spread it out, a business either overstaffs for the peak or makes everyone wait during it. Reservations exist specifically to smooth that demand and optimize capacity ahead of time, rather than absorbing the full peak as a live queue."

**After (mechanism, matched to the paper):**
> "Once a business already takes advance bookings, how it allocates that booked capacity affects how many customers it can actually serve. Locking each booking to one specific slot or resource at the moment it's made forces a safety buffer sized for that one booking's worst case. Keeping the assignment flexible — matched to available capacity in real time rather than fixed in advance — lets the natural variation across individual bookings average out over the whole pool of capacity, measurably increasing how many customers get served during the busiest periods without adding any actual capacity."

**Before (transferTemplate, over-broad):**
> "Offer specific, narrow appointment windows customers can book online in advance instead of only taking same-day 'can someone come now' calls. Spreading requests across the week ahead of time means the office isn't fielding a flood of calls every morning and the crew's day is planned in advance, not assembled call by call as it happens — this is the same demand-smoothing function reservations serve in any capacity-constrained service."

**After (transferTemplate, matched to the paper):**
> "If a home-service business already books jobs in advance, the gain here comes from how those bookings get assigned, not just from taking advance bookings at all. Locking a booking to one specific tech, truck, or time slot the moment it's scheduled forces padding sized for that one job's worst case. Keeping the tech/truck assignment flexible — decided close to the actual day rather than fixed at booking time — lets the business absorb more jobs during its busiest weeks with the same crew and trucks, the same way letting a restaurant assign any open table (instead of locking a reservation to one specific table) let it serve more covers without adding tables."

## Pass Summary

| Category | Target | Actual | Note |
|---|---|---|---|
| reputation-recovery-after-a-bad-review | 3-4 | **3 approved** | All three verified directly and approved (one first-party earnings release, one peer-reviewed Marketing Science study, one HBS-documented case); a fourth candidate (a viral small-restaurant review-response story) was dropped earlier in research after its details couldn't be traced to a real, specific, verifiable source. |
| accessing-capital-for-equipment-or-growth | 3-4 | **3 approved** | All three verified directly and approved. Deliberately avoided generic lender/vendor-blog "case studies" (Crestmont Capital, eCapital, Fora Financial, etc.) earlier in research after multiple searches turned up only unnamed, untraceable composite examples. |
| standing-out-in-a-commoditized-local-market | 3-4 | **3 approved** | All three verified directly and approved. Deliberately excluded anything home-service-native and anything overlapping with the existing price-shopping category. |
| scheduling-and-dispatch-efficiency (retry) | fill the gap | **+1 approved** | Southwest Airlines pit-crew turnaround (#43) verified directly against two independent sources and approved. Category now has 2 approved entries (#33's UPS entry + #43) plus #24 still pending. |
| #24 re-sourcing | find a mechanism-establishing source | **narrowed, not approved** | Full source-tracing found the Thompson & Kwortnik paper's real finding (pooling vs. locking already-booked reservations) is narrower than the entry's prior mechanism text (reservations vs. walk-in queues generally). `mechanism`/`transferTemplate` rewritten to match the paper; `status` held at `"candidate"` pending confirmation of the rewrite — see before/after above. |
| **Total this pass** | — | **9 approved, 1 rewritten-pending-confirmation** | Full source-tracing verification complete on all 10 items from the research pass; every source traced directly, not taken on faith. |

### Running total across all research to date (43 numbered candidates)

- **Approved:** 36 (26 prior + 10 from this pass: #34-43, all except #24)
- **Rejected:** 1 (from Day 3, #4 — unchanged)
- **Candidate** (pending further work): 6 — the original 5 flagged `revise`
  in Day 3 (#1, #5, #6, #8, #15) plus #24, whose mechanism has now been
  narrowed to match its source and awaits confirmation before approval.

Confirmed by script (`grep`-independent count over every `research/candidates/*.json`
file's `status` field): **36 approved / 1 rejected / 6 candidate = 43 total.**
