# lib/matching

Bursary matching query. Built in Phase 4, exactly per `docs/03-bursary-matching-system.md`:
deterministic, rules-based, three-tier (Matched / Close / Explore). No ML, no ranking score
beyond the tiers, and matching runs only on non-sensitive fields the student already provided
for other reasons (cegep, program, session, R-score, self-tags) — never income or household data.

Likely a Postgres function or a well-indexed query behind `src/app/api/bursaries/matches`, not a
separate service — see the doc's "Data model note".
