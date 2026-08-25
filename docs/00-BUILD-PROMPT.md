---
title: "MaCote: Build Prompt"
audience: AI coding agent (e.g. Claude Code)
status: ready for execution
---

# MaCote: Build Prompt

Paste this file into a coding agent to start execution. It references three supporting documents in the same folder; the agent should read all three before writing code, not just this one.

- `01-data-architecture.md`: every table, why it exists, and the one hard technical constraint (IDGZ/IFGZ are not public data) that shapes how the R-score feature has to work. Read this before touching anything related to cote R.
- `02-scraping-collection-plan.md`: which institutions, what to collect from each, how, and in what order.
- `03-bursary-matching-system.md`: the bursary matching logic, and what it deliberately does not do.

The product itself, why it exists, and the full market research behind it live in the project's `rscore-tracker-market-research-mvp.md`. This prompt assumes that reasoning, it doesn't repeat it. Read it if the "why" behind a decision here isn't obvious.

## What you're building

MaCote is a free tool for Quebec cegep students, starting in Quebec City, that tracks a student's real cote R (R-score) session over session, shows them exactly what each target university program needs from them (cutoff, prerequisites, course-specific grade floors), surfaces bursaries they may qualify for anchored on their own cegep's foundation, and generates a one-page prep export for the rare real appointment with an actual cegep counselor. All of that stays free forever. A cheap premium layer (comparison, what-if planning, polished exports) is the only paid part. This is a solo-founder, sustainable-business build, not a venture-scale bet, size every decision accordingly: correctness and trust over feature breadth.

## Tech stack (fixed, reused from the founder's existing StackSense project)

Next.js (App Router) with TypeScript and Tailwind CSS for the frontend. Supabase for auth, Postgres, and row-level security. Stripe for the premium tier. Deployed on Vercel. Built as an installable PWA. Don't introduce a different stack or a "better" alternative; the point of reusing this one is that the founder has already solved auth and billing once and shouldn't have to relearn a stack under a school-semester time crunch.

## Non-negotiable guardrails

These override any instinct to move faster or make the product feel more impressive. Violating any of these is a worse outcome than shipping a week later.

1. **Never display a number without a source and a verification date.** Every cutoff, prerequisite, grade floor, and bursary amount traces back to `source_url` and `last_verified_at` on its row. If a collector can't populate both, that row doesn't ship to production, full stop.
2. **Never conflate a confirmed cote R with an estimated one.** Per `01-data-architecture.md`, the app cannot independently compute the true official cote R for a future session; it can only ask the student to confirm their official number and project future what-ifs from a personal calibration. These are visually distinct in the UI (different badge, different color, explicit "estimate" language) everywhere, no exceptions.
3. **Never collect income, household, or other financial data for bursary matching.** Match only on program, cegep, session, R-score, and voluntary self-tags, per `03-bursary-matching-system.md`. If a feature idea requires financial data to work, it's out of scope for this build, flag it instead of building a workaround.
4. **Never scrape behind a login.** Omnivox or any other credentialed student portal is out of bounds, both technically and as a matter of not handling other people's credentials.
5. **Never let the product imply it's a substitute for a real conseiller d'orientation.** Conseiller d'orientation is a reserved professional title in Quebec (OCCOQ, Code des professions). Program-to-career content stays factual and sourced, never a personalized ranking or recommendation of what a student "should" become. The counselor-prep export is the feature; an AI-generated recommendation is not.
6. **A wrong number is a P0 bug, not a normal one.** Treat data-accuracy issues (a bad cutoff, a stale bursary deadline) with the same urgency as a security bug. This is a tool students use to plan their actual future.

## Repository structure (suggested)

```
/app                      Next.js App Router pages
  /(marketing)             public landing page
  /dashboard               authenticated student home
  /programs                program profile browser + reverse lookup
  /bursaries                bursary directory
  /counselor-prep           export generator
  /api                      route handlers (matching, R-score calc, Stripe webhooks)
/components                shared UI components
/lib
  /db                       Supabase client, typed table helpers
  /rscore                   calibration + projection logic (see Phase 3)
  /matching                 bursary matching query (see 03-bursary-matching-system.md)
/scripts
  /collectors               scraping/parsing scripts, one per source type (see 02-scraping-collection-plan.md)
/supabase
  /migrations                schema from 01-data-architecture.md, one migration per table cluster
  /seed                      Sainte-Foy pilot dataset
/docs                       this folder, kept in the repo for reference
```

## Build phases

Each phase has a concrete acceptance check. Don't move to the next phase until the current one's check passes. This intentionally starts with data, not UI: a polished screen showing wrong or empty data is worse than a plain screen showing real, verified data.

### Phase 0: Scaffold
Next.js + TypeScript + Tailwind + Supabase project wired up, PWA manifest configured, Vercel deploy pipeline working end to end on a placeholder page.
**Done when:** a blank deploy is live at a real URL and auth (email or magic link) works against a test account.

### Phase 1: Schema and pilot data
Run every migration from `01-data-architecture.md`. Stand up the collector scaffolding from `02-scraping-collection-plan.md`, staging tables included. Manually compile and verify Sainte-Foy's program profiles, cutoffs, and bursaries through the full staging-to-production pipeline. The 2026-08-24 data audit found the market research doc's HEC BAA figures (27,5 overall / 26,5 math floor) unverifiable against HEC's current admission page — re-verify from a primary source before reusing them as a seed; Sainte-Foy's bursary totals are unaffected.
**Done when:** querying production tables for Sainte-Foy returns real, source-linked rows for at least 5 to 10 university programs and Sainte-Foy's bursary list, and the staging-to-production promotion step has been exercised at least once by a human, not just written.

### Phase 2: Core profile and R-score engine
Student auth, profile (cegep, program, session), manual course/grade entry, and the confirmed-vs-estimated R-score model from `01-data-architecture.md`: a screen to confirm an official session cote R, and a calibration engine that derives a personal projection constant from confirmed history.
**Done when:** a test student can enter grades, confirm an official cote R, and see a clearly-labeled projected estimate for a hypothetical next session that is visually distinct from the confirmed number.

### Phase 3: Program profiles and reverse lookup
The screen for "published cutoff range, prerequisites, and grade floors for a target program," built against Phase 1's real data, plus the reverse view: every program a student already qualifies for today given their current score and completed prerequisites.
**Done when:** a test student targeting a verified program (e.g. UdeM's Droit) sees the published low/high cutoff range with its admission year, called out distinctly and sourced, and the reverse-lookup view returns a correct, real list for that same student. Never a single current-year cutoff number — see the 2026-08-24 data audit and `src/lib/rscore/cutoff-range.ts`.

### Phase 4: Bursary directory and matching
Build per `03-bursary-matching-system.md` exactly: the three-tier matching query, the "why this matched" chips, self-tags in the profile screen.
**Done when:** a test Sainte-Foy student profile returns a non-empty, correctly-tiered, source-dated bursary list, and changing their self-tags visibly changes the results.

### Phase 5: Deadline feed and counselor-prep export
The rotating home-screen feed (admission rounds, AFE, withdrawal dates, upcoming bursary deadlines pulled from the same `deadlines` and `bursaries` tables). The one-page counselor-prep export: current score, target-program status, flagged risk areas, generated as a clean printable page.
**Done when:** the export renders correctly for a test student with at least one target program and one flagged grade-floor risk, and reads as something an actual student would hand to a counselor without embarrassment.

### Phase 6: Premium and launch prep
Stripe integration gating comparison view, multi-session what-if planning, and the polished export, at the pricing already set in the research doc ($4 to $6 CAD/month or a flat $10 to $15/session). Final design pass. Disclaimer copy ("unofficial estimate, confirm with your cegep's orientation counselor") visible on every score, everywhere it appears.
**Done when:** a full signup-to-paid-upgrade flow works against Stripe test mode, and every screen showing a number has been checked for the confirmed-vs-estimated distinction and a visible disclaimer.

### Phase 7 (post-launch, not v1): widen institutions
Repeat Phase 1's collection process for Limoilou, then Garneau, then Champlain St. Lawrence, per the priority order in `02-scraping-collection-plan.md`. Do not start this before Phases 0 through 6 are live and Sainte-Foy's data has survived contact with real users; widening coverage before the core product is proven just multiplies the maintenance burden on an unvalidated base.

## Definition of done for v1

Every item in the MVP feature list from the market research doc is live, every number on screen is source-linked and dated, the confirmed-vs-estimated R-score distinction is visually unmistakable everywhere, bursary matching runs on non-sensitive fields only, and the counselor-prep export is good enough that the founder would hand it to their own counselor at Sainte-Foy without hesitation. That last check is the real one, not a metaphorical one, run it for real before calling this done.
