# Bursary Matching System: MaCote

*Supporting doc for `00-BUILD-PROMPT.md`. Reads the `bursaries` and `student_profiles` tables defined in `01-data-architecture.md`.*

## The boundary this system respects

The product does not collect income, household size, or any other financial-need data to power matching. That was a deliberate call, not a technical shortcut: a two-person startup holding financial data on teenagers is a real security and liability burden, and a national platform (ScholarshipsCanada.com, free since 1997, per the market research doc) already does income-based matching reasonably well at scale. Duplicating that isn't the differentiator. Hyper-local, cegep-specific bursary coverage is. So this system matches on things the student already told the product for other reasons: their program, their cegep, their session, their R-score, and whatever they voluntarily self-tag. Nothing new or sensitive gets collected just to make matching feel smarter.

That constraint also means this system will sometimes say "you may qualify, based on what you've told us" for a bursary that actually requires financial need to be demonstrated. That's fine and expected: the product is a discovery layer, not a decision-maker. The application still happens on the foundation's own terms, through the real application URL.

## Eligibility taxonomy (non-sensitive fields only)

Every bursary in the `bursaries` table can carry any combination of these criteria. None is required; a bursary with no criteria set at all is treated as open to any student at the relevant cegep (or province-wide, if `cegep_id` is null).

| Field | Type | What it matches against | Example |
|---|---|---|---|
| `cegep_id` | single reference | `student_profiles.cegep_id` | Sainte-Foy Foundation bursaries only match Sainte-Foy students |
| `eligible_cegep_programs` | array of program IDs | `student_profiles.cegep_program_id` | A bursary restricted to Sciences de la nature students |
| `eligible_university_programs` | array of program IDs | `student_targets.university_program_id` | A commerce-specific bursary matching a student targeting HEC's BAA |
| `min_r_score` | number | latest confirmed or estimated cote R | An academic-merit bursary requiring a 30+ |
| `min_session` | integer | `student_profiles.current_session` | A bursary only open to final-year students |
| `tag_criteria` | array of tags | `student_profiles.self_tags` | Athletics, arts, leadership, community engagement |
| `requires_essay`, `requires_recommendation` | boolean | shown as a badge, not filtered on | Sets expectations before the student clicks through |

`self_tags` are entirely self-selected by the student from a fixed list (sports, arts and culture, community engagement, leadership, entrepreneurship, and similar), the same way a resume lists activities. Nothing here is inferred, scored, or verified by the product; it's a voluntary declaration the student controls and can edit anytime.

## Matching logic

Rule-based, deterministic, fully explainable. No machine learning needed or wanted here: the entire value of this feature is that a student can see exactly why a bursary showed up, which a rules engine gives for free and a black-box model doesn't.

For a given student and each row in `bursaries`, evaluate in order:

1. **Cegep match.** If `bursaries.cegep_id` is set and doesn't equal the student's `cegep_id`, exclude. If null, this criterion passes for anyone.
2. **Program match.** If `eligible_cegep_programs` is set and the student's `cegep_program_id` isn't in it, exclude.
3. **Target-program match.** If `eligible_university_programs` is set, check it against the student's `student_targets`. If the student has no matching target, don't hard-exclude, since a student may not have added every relevant target yet. Instead, down-rank it into a secondary "related to your field" group rather than the primary match list.
4. **R-score threshold.** If `min_r_score` is set and the student's most recent score (confirmed or estimated, whichever is more recent) is below it, don't hard-exclude either. Show it in a "not yet, but on track" group if the gap is small (within roughly 2 points), since that's genuinely useful information, not noise.
5. **Session threshold.** If `min_session` is set and the student's `current_session` is lower, exclude for now; this one is a hard gate, since a first-session student genuinely cannot apply to a final-year-only bursary yet.
6. **Tag overlap.** If `tag_criteria` is set, check for any intersection with the student's `self_tags`. No overlap doesn't hard-exclude (tags are incomplete by nature, a student who forgot to tag "sports" shouldn't lose access to a sports bursary), but it also doesn't count as a positive match signal, it's neutral.

Result: three tiers per student, not one flat list. **Matched now** (passed every hard gate). **Close** (missed only a soft gate like R-score-within-2-points or an unset target). **Explore** (province-wide or open bursaries with no specific criteria, always shown as a baseline). Sort each tier by deadline proximity first, amount second.

## Data model note

This logic is a handful of set comparisons, not a service that needs its own infrastructure. It runs client-side in `src/lib/matching/match.ts` over the reference catalogue the app already holds, so the bursaries screen needs no network round-trip and works offline; the `/api/bursaries/matches` route once planned here was retired (2026-09) rather than left as a 501 stub. The `bursaries` table is the source the catalogue bundle is built from (`scripts/data/build-catalog.ts`, `/api/reference/bundle`), and `eligible_cegep_program_codes` holds the ministerial DEC codes the matcher compares, since a DEC code is province-wide and one code maps to many per-cégep offering rows.

## UI/UX requirements

- Every matched bursary shows **why** it matched, as plain text chips: "Your cegep," "Your program," "Your R-score," "Tagged: Athletics." A student should never see a bursary and wonder why the product thinks it's relevant.
- The three-tier structure (Matched / Close / Explore) is a real UI distinction, not just an internal query detail, surface it as three visibly different sections, not one merged list with a score.
- Every bursary card links out to the foundation's real, current application URL. The product never hosts or proxies an actual application form.
- A visible "last verified" date on every bursary, sourced from `bursaries.last_verified_at`. This is the same trust discipline as the cutoffs data, and it should look and feel consistent with how program-profile data is dated elsewhere in the product.
- Self-tags live in the same profile screen as the rest of the student's data, editable anytime, with a one-line explanation of what they're used for ("helps surface bursaries you might qualify for, never shared or sold").

## Explicit non-goals for v1

Do not build: an eligibility questionnaire that collects income, household size, or other financial-need data. Automated bursary application or auto-fill of a foundation's own form. A recommendation model or any ranking beyond the deterministic tiers above. A "success probability" score for any bursary, since the product has no data to back that number and it would read as false precision on something that materially affects a student's finances. Any of these would be a reasonable v2 conversation once there's real usage and, ideally, an actual conversation with a cegep foundation about a legitimate data-sharing relationship, not a v1 decision.
