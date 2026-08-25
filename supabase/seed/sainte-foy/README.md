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

No `overall_cutoff` field: universities publish multi-year ranges, or min/max/average, or
nothing at all — never one current-year number (2026-08-24 data audit). Every
`cutoff_history` entry carries its own `figure_type` and `source_tier`; a program can (and
often does) have several entries for the same year. See `src/lib/rscore/cutoff-range.ts` for
how these turn into the low/high band shown to students.

```jsonc
{
  "university_programs": [
    {
      "university_short_code": "hec",     // must match universities.short_code
      "name": "BAA",
      "degree_type": "BAA",
      "admission_type": "r_score_only",   // see docs/01-data-architecture.md for the full enum
      "source_url": "https://...",        // required — no number ships without one
      "last_verified_at": "2026-08-24",
      "prerequisites": ["201-NYA-05"],    // course_code list; courses must already exist in `courses`
      // HEC's own BAA admission page published no cote R figure as of the 2026-08-24
      // verification pass — leave grade_floors/cutoff_history empty until re-confirmed
      // rather than reusing the old, unverifiable 27,5 / 26,5 figures.
      "grade_floors": [],
      "cutoff_history": []
    },
    {
      // Example of a program WITH verified figures, showing the multi-entry shape.
      "university_short_code": "udem",
      "name": "Droit",
      "degree_type": "LLB",
      "admission_type": "r_score_only",
      "source_url": "https://admission.umontreal.ca/statistiques-dadmission-cote-r/",
      "last_verified_at": "2026-08-24",
      "prerequisites": [],
      "grade_floors": [],
      "cutoff_history": [
        {
          "admission_year": 2024,
          "cutoff": 31.505,
          "figure_type": "last_admitted",
          "source_tier": "university_official",
          "source_url": "https://admission.umontreal.ca/statistiques-dadmission-cote-r/",
          "source_type": "official_pdf",
          "verified_at": "2026-08-24"
        },
        {
          "admission_year": 2024,
          "cutoff": 33.168,
          "figure_type": "average",
          "source_tier": "university_official",
          "source_url": "https://admission.umontreal.ca/statistiques-dadmission-cote-r/",
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
