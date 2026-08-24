# Data Architecture: MaCote

*Supporting doc for `00-BUILD-PROMPT.md`. Read that file first for context on how this fits together.*

This document specifies every table the product needs, why it exists, where its data comes from, and how often it needs to be refreshed. It also documents one constraint that changes how the R-score feature has to work, and that the original market research doc glossed over. Read that section before touching the R-score tables.

## The constraint you need to know about first: IDGZ and IFGZ are not public data

The cote R formula is `(Cote Z × IDGZ + IFGZ + 5) × 5`. Cote Z is a student's own standardized grade in a course. IDGZ and IFGZ are group-strength indices, and here's the part that matters: they are computed by the BCI (Bureau de coopération interuniversitaire) from the secondary-school Z-scores of every student sitting in that specific course section that semester, at the group level, not the individual level ([Quebec government access-to-information response, PDF](https://cdn-contenu.quebec.ca/cdn-contenu/adm/min/education/publications-adm/enseignement-superieur/Acces-information/reponses-transmises/2023/juillet-septembre/23-31_Diffusion.pdf)). That response confirms this data is not released to outside third parties. Only the BCI, the ministry, and cegeps (who receive the final computed numbers back) have it.

Practical consequence: no outside app, including this one, can independently compute a student's true official cote R from scratch. This is exactly why coter.online's own site admits IDGZ/IFGZ are "très difficile à obtenir." Neither existing free calculator actually solves this; they approximate.

Here's the design that works honestly within that limit, and it's better than what either competitor does:

1. **Ground truth comes from the student, confirmed each session.** Cegeps do tell students their own official cote R each term through their internal portal. The product asks the student to enter that confirmed number once it's published. This is real data, not an estimate.
2. **Projections use a personal calibration, not the real formula.** Once a student has at least one confirmed `(cote_r, courses+grades)` pair for a session, back-solve an effective personal calibration constant from it. Apply that constant to hypothetical future grades for the what-if slider. This is an approximation of how sensitive *this specific student's* score has historically been to their grades, not a recomputation of the ministry's group math, and it gets more accurate as the student confirms more sessions.
3. **Every projected number is labeled as an estimate, every confirmed number is labeled as official.** These are two different colors/badges in the UI, never merged into one ambiguous number. This is the single most important trust-preserving UI rule in the whole product; treat it as non-negotiable.

This refines, not reverses, what the earlier research doc said ("the tool calculates a real cote R using the actual published formula"). The formula is real and public. Two of its three inputs for a *future, not-yet-graded* session are not obtainable by anyone outside the ministry, even in principle, until that session's grades exist. Build accordingly.

## Entity overview

Seven clusters of tables:

1. **Institutions**: `cegeps`, `universities`
2. **Cegep-side catalog**: `cegep_programs`, `courses`
3. **University-side targets**: `university_programs`, `university_program_prerequisites`, `university_program_grade_floors`, `cutoff_history`
4. **Bursaries**: `bursaries`
5. **Deadlines**: `deadlines`
6. **Student data**: `student_profiles`, `student_course_grades`, `student_r_score_confirmations`, `student_targets`
7. **Provenance**: every scraped/compiled table below carries `source_url` and `last_verified_at` columns on purpose. A wrong number here is a trust-destroying bug per the research doc's own reality check, so nothing gets displayed without a traceable source and a verification date.

## Schema (Postgres / Supabase)

```sql
-- ============================================================
-- 1. INSTITUTIONS
-- ============================================================

create table cegeps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_code text unique not null,        -- 'sainte-foy', 'limoilou', 'garneau', 'champlain-slc'
  sector text not null check (sector in ('public_french','public_english','private')),
  region text not null default 'Quebec City',
  website_url text,
  admission_service text,                  -- 'SRACQ', 'direct', etc.
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table universities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_code text unique not null,
  website_url text,
  bci_member boolean default true
);

-- ============================================================
-- 2. CEGEP-SIDE CATALOG
-- ============================================================

create table cegep_programs (
  id uuid primary key default gen_random_uuid(),
  cegep_id uuid references cegeps(id) not null,
  program_code text,                       -- ministerial code, e.g. '200.B0'
  name text not null,
  type text check (type in ('pre_university','technical')) not null,
  created_at timestamptz default now()
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  course_code text unique not null,        -- e.g. '201-NYA-05'
  discipline_code text,                    -- '201' = mathematics, etc.
  name text not null,
  name_en text,
  weighting numeric,                       -- 'pondération'
  created_at timestamptz default now()
);

-- ============================================================
-- 3. UNIVERSITY-SIDE TARGETS
-- ============================================================

create table university_programs (
  id uuid primary key default gen_random_uuid(),
  university_id uuid references universities(id) not null,
  name text not null,
  degree_type text,                        -- 'BAA', 'BSc', 'MD', etc.
  overall_cutoff numeric,                  -- most recent known cutoff; history lives in cutoff_history
  admission_type text check (admission_type in
    ('r_score_only','r_score_plus_interview','r_score_plus_portfolio','r_score_plus_test','other')) not null,
  source_url text not null,
  last_verified_at date not null,
  created_at timestamptz default now()
);

create table university_program_prerequisites (
  id uuid primary key default gen_random_uuid(),
  university_program_id uuid references university_programs(id) not null,
  course_id uuid references courses(id) not null,
  required boolean default true,
  unique(university_program_id, course_id)
);

create table university_program_grade_floors (
  id uuid primary key default gen_random_uuid(),
  university_program_id uuid references university_programs(id) not null,
  course_id uuid references courses(id) not null,
  min_grade numeric not null,              -- e.g. HEC's 26.5 math floor
  floor_type text check (floor_type in ('course_cote_r_floor','course_percentage_floor')) not null,
  source_url text not null,
  notes text
);

create table cutoff_history (
  id uuid primary key default gen_random_uuid(),
  university_program_id uuid references university_programs(id) not null,
  admission_year int not null,
  cote_r_last_admitted numeric,
  source_url text not null,
  source_type text check (source_type in ('official_pdf','cegep_published','bci','other')) not null,
  verified_at date not null,
  unique(university_program_id, admission_year)
);

-- ============================================================
-- 4. BURSARIES  (see 03-bursary-matching-system.md for the matching logic
--    that reads this table; eligibility fields here are intentionally
--    non-sensitive only, per the product decision on data collection)
-- ============================================================

create table bursaries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_org text not null,                -- 'Fondation du Cégep de Sainte-Foy', 'AFE', etc.
  cegep_id uuid references cegeps(id),     -- null = province-wide / not cegep-specific
  category text check (category in
    ('financial_need','academic_merit','athletics','arts_culture',
     'community_engagement','perseverance','program_specific','mobility','event_based','other')) not null,
  amount_min numeric,
  amount_max numeric,
  deadline_type text check (deadline_type in ('fixed_date','recurring_annual','rolling')) not null,
  deadline_date date,
  application_url text not null,
  description text,
  -- Non-sensitive eligibility criteria only. No income, no household data. See 03-bursary-matching-system.md.
  eligible_cegep_programs uuid[],          -- null = open to any program at the cegep
  eligible_university_programs uuid[],     -- for program-specific bursaries tied to a target field of study
  min_r_score numeric,
  min_session int,
  requires_essay boolean default false,
  requires_recommendation boolean default false,
  tag_criteria text[],                     -- matched against student_profiles.self_tags
  last_verified_at date not null,
  created_at timestamptz default now()
);

-- ============================================================
-- 5. DEADLINES  (admission rounds, AFE, withdrawal dates; bursary
--    deadlines live on the bursaries row itself and get unioned in
--    at query time, not duplicated here)
-- ============================================================

create table deadlines (
  id uuid primary key default gen_random_uuid(),
  type text check (type in ('sracq_round','sram_round','afe_deadline','withdrawal_no_penalty','other')) not null,
  title text not null,
  date date not null,
  applies_to_cegep_id uuid references cegeps(id),  -- null = province-wide
  source_url text not null,
  last_verified_at date not null
);

-- ============================================================
-- 6. STUDENT DATA  (RLS-protected; each table locked to auth.uid())
-- ============================================================

create table student_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cegep_id uuid references cegeps(id),
  cegep_program_id uuid references cegep_programs(id),
  current_session int,
  self_tags text[] default '{}',           -- e.g. 'sports','arts','community_engagement','leadership'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table student_profiles enable row level security;
create policy "own profile only" on student_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table student_course_grades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  session int not null,
  course_id uuid references courses(id),
  course_name_freetext text,               -- fallback when the course isn't in the catalog yet
  grade numeric,
  cote_z numeric,                          -- optional, if the student's own portal shows it
  created_at timestamptz default now()
);
alter table student_course_grades enable row level security;
create policy "own grades only" on student_course_grades
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table student_r_score_confirmations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  session int not null,
  official_cote_r numeric not null,        -- self-reported from the student's own cegep portal
  confirmed_at timestamptz default now(),
  unique(user_id, session)
);
alter table student_r_score_confirmations enable row level security;
create policy "own confirmations only" on student_r_score_confirmations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table student_targets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  university_program_id uuid references university_programs(id) not null,
  notes text,
  created_at timestamptz default now()
);
alter table student_targets enable row level security;
create policy "own targets only" on student_targets
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

## What's deliberately not in this schema

No income field. No household size, no financial-need dollar figures, no government ID numbers, nothing under the "include financial eligibility" option that was explicitly turned down for v1. `min_r_score`, `min_session`, and `tag_criteria` are the only eligibility levers a bursary gets, because those are things the student already told the product for other reasons (their score, their session, and voluntary self-tags), not new sensitive data collected specifically to unlock bursary matching. If a real bursary's actual eligibility rule needs income data to apply correctly, the product shows it in the directory with a plain note ("based on financial need, apply directly") rather than trying to pre-qualify the student for it.

## Data ownership and refresh cadence

| Table cluster | Who maintains it | Refresh cadence | Why |
|---|---|---|---|
| `cegeps`, `universities` | Manual, rarely changes | As needed | New cegeps/universities essentially never appear |
| `cegep_programs`, `courses` | Semi-automated scrape + manual review | Annually, before fall admission cycle | Program codes and course catalogs change slowly but do change |
| `university_programs`, prerequisites, grade floors | Semi-automated scrape + manual review | Annually | Cutoffs and prerequisites are republished yearly; a stale floor is a trust-destroying bug |
| `cutoff_history` | Append-only, one row per program per year | Annually, never overwritten | This is what powers the trend line; overwriting old years destroys the feature |
| `bursaries` | Semi-automated scrape + manual review | Each foundation's own cycle, checked quarterly at minimum | Deadlines and amounts change yearly per foundation; verify before every admission/bursary season |
| `deadlines` | Manual, structured content | Annually, each spring for the coming year | Small dataset, high consequence if wrong, not worth scraping |
| Student data | User-generated | Real-time | N/A |

See `02-scraping-collection-plan.md` for exactly how the scraped/compiled clusters get populated and kept honest.
