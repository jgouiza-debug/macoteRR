# lib/rscore

Cote R calibration and projection engine. Built in Phase 2.

Per `docs/01-data-architecture.md`: no outside app can compute a student's true official cote R
for a future session (IDGZ/IFGZ are not public data). This module only ever does two things:

- `calibration.ts` — back-solves a personal calibration constant from a student's confirmed
  `(official_cote_r, courses+grades)` pair.
- `projection.ts` — applies that constant to hypothetical future grades for the what-if slider.

Every value this module produces is an **estimate** and must be labeled as such in the UI,
visually distinct from a confirmed official score, everywhere it's shown (non-negotiable guardrail
#2 in `docs/00-BUILD-PROMPT.md`).
