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
