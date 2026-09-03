# lib/rscore

Cote R estimation, calibration and projection. Built in the 2026-09 pass.

Per `docs/01-data-architecture.md`: no outside app can compute a student's true official cote R
for a future session (IDGZ/IFGZ are not public data). This module only ever produces
**estimates**, and every one of them must be labelled as such in the UI, visually distinct from
a confirmed official score, everywhere it is shown (guardrail #2 in `docs/00-BUILD-PROMPT.md`).

- `calibration.ts` — the engine. `deriveCalibration(confirmations, grades)` back-solves a
  personal ratio from every session that has both a confirmed cote R and grades (least squares
  through the origin over two or more sessions, the single-session ratio for one, the shipped
  `DEFAULT_RATIO` heuristic labelled `"uncalibrated"` for none). `projectEstimate` applies a
  calibration to one session's grades; `whatIf` projects the change from replacing one grade;
  `estimateFromGrades` is the plain uncalibrated helper the estimate screen uses. Clamped to
  the database's `estimated_cote_r` check (15..50). Verified by
  `scripts/checks/calibration.check.ts` (`npm run check:rscore`).
- `cutoff-range.ts` — the published-range vocabulary (`above` / `inside` / `below` /
  `unknown`) every screen uses to place a score against a programme. A null range is "not yet
  verified", never open admission (guardrail #5).
- `bands.ts` — sourced, disclaimed score bands for the "what does 28,4 mean" sheet.
- `impact.ts` — cote Z per course (`computeCoteZ`, `classifySession`) for the optional path
  where a student supplies group averages. Degrades to percentage points when no standard
  deviation is available and says so.
