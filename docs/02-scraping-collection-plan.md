# Scraping & Data Collection Plan: MaCote

*Supporting doc for `00-BUILD-PROMPT.md`. Populates the tables defined in `01-data-architecture.md`.*

You picked comprehensive, most Quebec City cegeps, over the narrower Sainte-Foy-only scope. This doc is built for that, but it sequences the work so nothing ships slower for it: Sainte-Foy still goes first as the verified pilot, because it's the founder's own cegep and the go-to-market plan depends on it, and the same pipeline then widens to the rest without a redesign.

## Target institutions

Confirmed against SRACQ's own member list, not guessed ([SRACQ, cégeps membres](https://www.sracq.qc.ca/ete/cegep.asp)). The Capitale-Nationale (Quebec City) region has exactly three public French cegeps in that consortium:

| Cegep | Sector | Priority | Notes |
|---|---|---|---|
| Cégep de Sainte-Foy | Public, French | 1, pilot | Founder's own cegep. Build and verify the whole pipeline here first. |
| Cégep Limoilou | Public, French | 2 | Two campuses (Quebec, Charlesbourg); one shared program/bursary dataset. |
| Cégep Garneau | Public, French | 2 | |
| Cégep Champlain St. Lawrence | Public, English | 2 | **Correction to flag**: the market research doc cited "Champlain Saint-Lambert" for a program example. That's the wrong campus, Saint-Lambert is on Montreal's South Shore. The actual Quebec City campus is Champlain St. Lawrence (slc.qc.ca). Re-source any Champlain content against slc.qc.ca before it ships. |
| Collège Mérici | Private | 3, optional | Smaller, lower student volume. Add once the four above are stable. |
| Collège O'Sullivan de Québec | Private | 3, optional | Same. |

Note what's deliberately excluded: cegeps outside the Capitale-Nationale region (Rimouski, Lévis, Thetford, Victoriaville, and the rest of the SRACQ list) are a different, later expansion, not Quebec City. Don't let "comprehensive" quietly become "province-wide"; that's a different, much bigger product.

## What to collect, per institution, and where it actually lives

Not everything comes from the cegep's own website. Be precise about the real source for each data type, since citing the wrong institution for a claim is exactly the kind of error worth designing the pipeline to prevent.

**From each cegep's own site:**
- Program catalog (`cegep_programs`): pre-university and technical DEC programs offered, with ministerial codes. Usually a clean, structured "programmes d'études" page.
- Course catalog for pre-university programs (`courses`): the ministerial course codes (discipline number + letter sequence, e.g. `201-NYA-05`) relevant to prerequisite-tracking. Cégep Garneau's "préalables universitaires" page is a strong model for how one cegep already structures this ([Cégep Garneau](https://cegepgarneau.ca/programmes/tous-les-programmes/prealables-universitaires/)).
- Foundation bursaries (`bursaries` where `cegep_id` is set): each cegep's foundation runs its own bursary program with its own categories, amounts, and deadlines. These pages vary a lot in structure and completeness between institutions, expect to do more manual work here than anywhere else in the pipeline. Sainte-Foy publishes solid numbers (1,000+ bursaries, $275,000+/year, [programme de bourses](https://sites2.csfoy.ca/fondation/bourses-fonds/programme-de-bourses/)). Limoilou's page currently surfaces around 50 named merit bursaries with categories but no visible annual total ([Cégep Limoilou, bourses](https://www.cegeplimoilou.ca/fondation/bourses/)); Garneau's foundation page gives a 30-year cumulative figure (over $6,000,000) but not a clean annual breakdown ([Fondation du Cégep Garneau](https://cegepgarneau.ca/notre-cegep/fondation/)). Don't force these into false parity with Sainte-Foy's numbers. Show what's actually verified for each, and flag what still needs a direct email to the foundation office to pin down.

**From university sites and the BCI, not cegep sites:**
- University program cutoffs, admission type, and source PDFs (`university_programs`, `cutoff_history`).
- Prerequisite courses and course-specific grade floors (`university_program_prerequisites`, `university_program_grade_floors`). HEC Montréal's official prerequisites PDF is the reference example for how these should be sourced ([HEC Montréal, cours préalables, PDF](https://d3v2l0729gt15o.cloudfront.net/PDFs/Zone-%C3%A9tudiante/Orientation-et-recherche-demploi/Pr%C3%A9alables-et-cote-R/Cours-pr%C3%A9alables-exig%C3%A9s-BAA-et-BSC_H2023.pdf)).
- Several cegeps also independently compile and publish "cote de la dernière personne admise" tables as a convenience to their own students (Collège Montmorency, Cégep Limoilou, Cégep Sherbrooke are the examples already found). These are useful cross-checks against the university's own numbers, but the university's own published cutoff is always the source of record when the two disagree.

**Province-wide, not tied to any single cegep:**
- AFE deadlines and general rules (`deadlines`, and a `bursaries` row for AFE itself where relevant).
- SRACQ admission rounds (`deadlines`, `type = 'sracq_round'`).

## Collection method per data type

Not everything should be scraped the same way. Match the method to how the data actually behaves:

- **Structured HTML pages that rarely change shape** (program catalogs, course lists): a real scraper, run on a schedule, parsing the page's actual markup. Low risk, low maintenance once written.
- **PDFs republished annually with a stable layout** (cutoff tables, prerequisite documents): a PDF-parsing step (text extraction plus a hand-written pattern per document, since these are not uniform across institutions) that runs once a year and always lands in a staging table for human review before it touches production data. Never auto-promote a parsed PDF straight to a table a student sees.
- **Small, high-consequence, irregularly-formatted data** (bursary lists, deadlines): don't fight it with a scraper. Compile these by hand from the source pages once, then re-verify manually each admission season. The Limoilou and Garneau research above is a live example of why: neither page is structured enough to scrape reliably, and getting a bursary amount or deadline wrong is a worse outcome than the time saved automating it.
- **Anything behind a login** (Omnivox, a cegep's internal student portal): never scraped, never attempted. Out of scope entirely, both technically and because it would mean handling other people's credentials.

## Legal and ethical baseline

Check and respect `robots.txt` on every target domain before writing a scraper against it, and don't build around a disallow rule. Rate-limit requests generously; there's no reason to hit a cegep's public website harder than a normal visitor would. Prefer official PDFs and public program pages over any page that looks like it's meant for internal use. Keep a `source_url` on every row for exactly this reason: if an institution asks what's being pulled from their site and why, the answer should be immediate and specific. Longer term, once there's real usage data, the right move for the higher-volume institutions is the same one the market research doc already flagged: approach the cegep directly about an actual data-sharing or licensing relationship, instead of scraping the same institution indefinitely. That's a later-stage conversation, not a v1 blocker.

## Pipeline architecture

Keep this boring and inspectable, not clever. A wrong cutoff is worse than a slow pipeline.

1. **Collector scripts** (Node or Python, one per source type: HTML program-catalog scraper, PDF cutoff parser, manual-entry bursary compiler) run on a schedule via GitHub Actions or a Supabase scheduled Edge Function. Each run writes to a `staging_*` mirror of the real table (`staging_university_programs`, `staging_bursaries`, etc.), never directly to production.
2. **Snapshot every raw source.** Store the fetched HTML or PDF alongside the parsed row (Supabase Storage is fine for this) so a future disagreement about what a page said on a given date is answerable, not a guess.
3. **Diff against the previous verified version.** Before anything is promoted, generate a plain diff: what changed since last time. A cutoff that jumped by 10 points or a bursary amount that dropped to zero should get flagged automatically for a human to look at twice, not silently accepted.
4. **Manual promotion.** A human (you, at this stage) reviews the staging diff and promotes it into the real table, setting `last_verified_at` to that day. This is the step that turns "a scraper found some numbers" into "this is safe to show a student planning their future."
5. **Annual cycle, not continuous.** Programs, cutoffs, and prerequisites change once a year around results season. Run the full collection pass each summer, ahead of the fall admission cycle referenced in the MVP timeline. Bursaries get an additional quarterly check, since foundation deadlines don't all cluster on the same calendar.

## Build order inside this workstream

Matches the MVP plan's Weeks 1 to 3 in the research doc, expanded now that the scope is wider:

1. Build the collector scaffolding and staging tables first, against Sainte-Foy only.
2. Manually compile and verify Sainte-Foy's program profiles, cutoffs, and bursaries through the full pipeline, end to end, before touching a second institution. This proves the pipeline works on real, already-researched data (the HEC and Sainte-Foy numbers in the market research doc are a ready-made seed set).
3. Once Sainte-Foy is clean, point the same collectors at Limoilou, then Garneau, then Champlain St. Lawrence. Each one will break something in the scraper, that's expected, cegep websites are not uniform, budget real time for it rather than assuming the second institution is free.
4. Add the two private colleges only after the four public/semi-public ones are stable and verified.
