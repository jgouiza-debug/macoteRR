# Sainte-Foy pilot seed data

Empty templates, not fabricated data. Fill these in with real, sourced research (per
`docs/02-scraping-collection-plan.md`'s Sainte-Foy-first build order and the numbers already
gathered in the market research doc — HEC's BAA prerequisites/floors, Sainte-Foy's bursary
totals), then run `npm run collect:sainte-foy` to push them through `staging_*` and
`npm run promote` to review and promote into production.

`cegeps` and `universities` (cluster 1) are stable/manual and assumed already seeded directly —
see `docs/01-data-architecture.md`'s ownership table ("Manual, rarely changes"). The compile
script resolves the human-friendly codes below against those tables; if a lookup fails, that row
is skipped and reported rather than silently dropped.

## `programs.json` — feeds `staging_cegep_programs`

```jsonc
{
  "cegep_short_code": "sainte-foy",      // must match cegeps.short_code
  "programs": [
    {
      "program_code": "200.B0",           // ministerial code
      "name": "Sciences de la nature",
      "type": "pre_university"            // "pre_university" | "technical"
    }
  ]
}
```

## `cutoffs.json` — feeds `staging_university_programs`, `staging_university_program_prerequisites`,
`staging_university_program_grade_floors`, `staging_cutoff_history`

```jsonc
{
  "university_programs": [
    {
      "university_short_code": "hec",     // must match universities.short_code
      "name": "BAA",
      "degree_type": "BAA",
      "overall_cutoff": 27.5,
      "admission_type": "r_score_only",   // see docs/01-data-architecture.md for the full enum
      "source_url": "https://...",        // required — no number ships without one
      "last_verified_at": "2026-08-24",
      "prerequisites": ["201-NYA-05"],    // course_code list; courses must already exist in `courses`
      "grade_floors": [
        {
          "course_code": "201-NYA-05",
          "min_grade": 26.5,
          "floor_type": "course_cote_r_floor",
          "source_url": "https://...",
          "notes": null
        }
      ],
      "cutoff_history": [
        {
          "admission_year": 2025,
          "cote_r_last_admitted": 27.5,
          "source_url": "https://...",
          "source_type": "official_pdf",
          "verified_at": "2026-08-24"
        }
      ]
    }
  ]
}
```

## `bursaries.json` — feeds `staging_bursaries`

```jsonc
{
  "cegep_short_code": "sainte-foy",
  "bursaries": [
    {
      "name": "...",
      "source_org": "Fondation du Cegep de Sainte-Foy",
      "category": "academic_merit",       // see docs/01-data-architecture.md for the full enum
      "amount_min": null,
      "amount_max": null,
      "deadline_type": "recurring_annual",
      "deadline_date": null,
      "application_url": "https://...",
      "description": "...",
      "min_r_score": null,
      "min_session": null,
      "requires_essay": false,
      "requires_recommendation": false,
      "tag_criteria": [],
      "last_verified_at": "2026-08-24"
    }
  ]
}
```
