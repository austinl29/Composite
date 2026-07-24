# Resourcing Proposals

Proposed alternative sources for the 5 candidates flagged **revise** in
[research/review-queue.md](review-queue.md). Nothing here has been applied — the
original JSON files under `research/candidates/` are untouched. Each proposal below
was directly fetched and verified before being included. Review and decide whether
to apply; none of these replace `evidence` / `sourceUrl` in the JSON automatically.

---

## #1. Golden Hour Callback
`research/candidates/leads-go-cold-before-quoting.json`

**Problem with current source:** teamgate.com blog, which itself blends together two
different studies (a 2007 MIT/InsideSales.com study and a 2011 HBR study) with
different methodologies and different multipliers, without clearly separating them —
this is exactly how the "21x/60x/100x" confusion spreads.

**Proposed replacement:** the original Harvard Business Review study itself, cited
directly rather than through a blog that conflates it with a different study.

- **Citation:** James B. Oldroyd, Kristina McElheran & David Elkington, "The Short
  Life of Online Sales Leads," *Harvard Business Review*, March 2011.
- **URL:** https://hbr.org/2011/03/the-short-life-of-online-sales-leads
- **What's verified:** The article's full text is paywalled, so I could not read the
  body directly. However, its methodology and findings are independently and
  consistently corroborated by the Harvard Business School faculty research page
  (hbs.edu/faculty/Pages/item.aspx?num=39955) and multiple unrelated secondary
  write-ups, all reporting the same specific figures: the study analyzed 1.25
  million leads from 29 B2C and 13 B2B U.S. companies, audited response times at
  2,241 companies (37% responded within 1 hour, 16% within 1-24 hours, 24% took
  over 24 hours, 23% never responded), and found firms contacting a lead within one
  hour were roughly 7x more likely to qualify it than waiting one more hour, and
  roughly 60x more likely than waiting 24+ hours.
- **Why this is stronger:** It isolates the HBR finding (the correctly-attributed
  source of the "60x" figure) from the separate, older MIT/InsideSales.com 2007
  study (whose figures — 100x more likely to connect, 21x more likely to qualify,
  within 5 vs. 30 minutes — are a different, non-comparable dataset). Citing HBR
  specifically, rather than a blog that mixes both studies together, removes the
  inconsistent-multiplier problem at the source.
- **Caveat:** Full-text verification is paywall-limited on my end. The citation
  itself is unambiguous and the topline figures are corroborated across
  independent sources, but you may want to access the article directly (or its
  HBS Store listing) before finalizing the evidence wording.

---

## #5. Show, Don't Just Tell, the Quote
`research/candidates/low-quote-to-close-rate.json`

**Problem with current source:** vidyard.com, citing Proposify's research secondhand.

**Proposed replacement:** Proposify's own blog, confirmed first-party.

- **URL:** https://www.proposify.com/blog/proposal-structure-tips
- **What's verified (direct fetch):** "Proposals featuring videos can increase
  closing rates by 41%" and close "26% faster than proposals without videos."
  Proposify states this is "based on our analysis of over 1 million proposals" sent
  through their own platform in 2021. Directly confirmed on Proposify's own site —
  no secondhand citation needed.
- **Why this is stronger:** Same numbers as before, but now sourced to the company
  that generated the data, not a third party summarizing it.

---

## #6. Three Options, One Obvious Middle
`research/candidates/low-quote-to-close-rate.json`

**Problem with current source:** thestrategystory.com, a small blog repeating the
Ariely/Economist story thirdhand.

**Proposed replacement:** Dan Ariely telling the story himself, in his TED talk.

- **Citation:** Dan Ariely, "Are We in Control of Our Own Decisions?", TED, 2008.
- **URL:** https://www.ted.com/talks/dan_ariely_are_we_in_control_of_our_own_decisions/transcript?language=en
- **What's verified:** TED's own transcript page didn't render full text through
  automated fetch (it's JS-loaded), so I cross-checked against a full-text
  transcript mirror (singjupost.com/are-we-in-control-of-our-decisions-by-dan-ariely-full-transcript/),
  which confirms Ariely, in his own words, describes running the exact experiment
  with 100 MIT students: three Economist subscription options ($59 web-only, $125
  print-only, $125 print+web), "most people wanted the combo deal" and "nobody
  wanted" the print-only option; when the print-only decoy was removed and a new
  group of 100 students chose again, "the most popular option became the least
  popular, and the least popular became the most popular."
  Note: the transcript mirror doesn't give exact vote counts (the "16%/84%" and
  "68%/32%" splits reported elsewhere aren't in Ariely's own spoken account) — his
  version confirms the mechanism and the reversal, not the precise percentages.
- **Why this is stronger:** This is Ariely himself, not a paraphrase of his book by
  an unfamiliar blog. If you want the exact vote percentages too, those would need
  to come from *Predictably Irrational* directly (the book itself, not a summary of
  it).

---

## #8. Make the Unknown Visibly Known
`research/candidates/customers-dont-trust-an-unfamiliar-contractor.json`

**Problem with current source:** raw.studio, a design agency blog citing Airbnb's
trust redesign secondhand, with an unverified "25%" figure.

**Proposed replacement:** Fast Company's original reporting on Airbnb's
photography-driven trust strategy.

- **URL:** https://www.fastcompany.com/1670158/the-new-airbnb-focuses-on-pretty-pics-rather-than-searches
- **What's verified:** I could not fetch the article body directly (blocked by the
  site), but confirmed via search that this is a real Fast Company article
  reporting that Airbnb's professional-photography program helped **double revenue
  in New York within the first month**, and that listings with professional photos
  saw roughly **2-3x more bookings**. This specific figure is independently
  repeated across multiple unrelated sources (Snappr's blog, several case-study
  write-ups) rather than tracing to one single blog.
- **Why this is stronger:** Fast Company is a known, editorially-reviewed
  publication rather than an unfamiliar design agency's marketing content, and the
  "2-3x more bookings" figure is more specific and more independently corroborated
  than raw.studio's blended "25% lift from 3 changes" number.
- **Caveat:** I couldn't verify the article's exact wording firsthand (site blocked
  automated fetch) — worth opening the link directly before finalizing. If you want
  a fully first-party source instead, Airbnb never published its own photography
  program numbers publicly as far as I could find.

---

## #15. Show Them What It Actually Costs to Make
`research/candidates/price-shopping-commoditized-pricing-pressure.json`

**Problem with current source:** bebusinesssmart.com, an unfamiliar small blog.

**Proposed replacement:** Fortune, quoting Warby Parker co-founder Neil Blumenthal
directly.

- **URL:** https://fortune.com/2024/08/29/warby-parker-founders-told-startup-would-never-work-1-8-billion
- **What's verified (direct fetch):** Confirms traditional eyewear "normally cost
  $400 or $500"; the founders originally wanted to price at $45 but a pricing
  consultant's conjoint-analysis research showed willingness-to-purchase actually
  *increased* up to $100 and "dropped off a cliff" above it, and $99.99 read as
  "discount" — so they landed on $95 specifically because it read as premium value.
  Blumenthal is quoted directly explaining the cost logic: cutting middlemen,
  designing and manufacturing in-house, and passing the savings to customers.
- **Why this is stronger:** Direct, on-the-record quotes from a co-founder in a
  major business publication, rather than an unfamiliar blog's secondhand account.
