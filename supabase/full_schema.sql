-- Cluster 1: institutions. See docs/01-data-architecture.md.
-- Rarely changes; no RLS needed beyond the public-read policy every catalog
-- cluster gets (see cegep_catalog migration for the rationale).

create extension if not exists pgcrypto;

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

alter table cegeps enable row level security;
create policy "public read" on cegeps for select using (true);

alter table universities enable row level security;
create policy "public read" on universities for select using (true);
-- Cluster 2: cegep-side catalog. See docs/01-data-architecture.md.
--
-- RLS note (addition beyond the doc's literal SQL, flagged in the build plan):
-- the spec writes no RLS for clusters 1-5, but these tables are meant to be
-- publicly browsable (program directory) while writes should only ever happen
-- via the service-role key from scripts/collectors/, which bypasses RLS. A
-- single public read-only policy accomplishes that on every table below.

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
  weighting numeric,                       -- 'ponderation'
  created_at timestamptz default now()
);

alter table cegep_programs enable row level security;
create policy "public read" on cegep_programs for select using (true);

alter table courses enable row level security;
create policy "public read" on courses for select using (true);
-- Cluster 3: university-side targets. See docs/01-data-architecture.md.

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

alter table university_programs enable row level security;
create policy "public read" on university_programs for select using (true);

alter table university_program_prerequisites enable row level security;
create policy "public read" on university_program_prerequisites for select using (true);

alter table university_program_grade_floors enable row level security;
create policy "public read" on university_program_grade_floors for select using (true);

alter table cutoff_history enable row level security;
create policy "public read" on cutoff_history for select using (true);
-- Cluster 4: bursaries. See docs/01-data-architecture.md and
-- docs/03-bursary-matching-system.md for the matching logic that reads this
-- table. Eligibility fields here are intentionally non-sensitive only -- no
-- income, no household data.

create table bursaries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_org text not null,                -- 'Fondation du Cegep de Sainte-Foy', 'AFE', etc.
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

alter table bursaries enable row level security;
create policy "public read" on bursaries for select using (true);
-- Cluster 5: deadlines (admission rounds, AFE, withdrawal dates; bursary
-- deadlines live on the bursaries row itself and get unioned in at query
-- time, not duplicated here). See docs/01-data-architecture.md.

create table deadlines (
  id uuid primary key default gen_random_uuid(),
  type text check (type in ('sracq_round','sram_round','afe_deadline','withdrawal_no_penalty','other')) not null,
  title text not null,
  date date not null,
  applies_to_cegep_id uuid references cegeps(id),  -- null = province-wide
  source_url text not null,
  last_verified_at date not null
);

alter table deadlines enable row level security;
create policy "public read" on deadlines for select using (true);
-- Cluster 6: student data (RLS-protected; each table locked to auth.uid()).
-- See docs/01-data-architecture.md. Policies copied verbatim from the spec.

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
-- Cluster 7: staging tables (this repo's own design, cross-checked against
-- docs/02-scraping-collection-plan.md's pipeline architecture -- not defined
-- by name in docs/01-data-architecture.md, which only names the production
-- schema). One per scraped/compiled production table in clusters 2-5 (not 1
-- or 6: institutions rarely change, student data isn't scraped), matching
-- the naming docs/02-scraping-collection-plan.md itself uses
-- ("staging_university_programs", "staging_bursaries").
--
-- Each carries the same business columns as its production counterpart,
-- relaxed: FK-shaped columns are plain nullable uuid with no enforced
-- reference (staging data is inherently unvalidated -- a scraped row may
-- point at an entity that doesn't exist in production yet), and unique
-- constraints are dropped. Every table also carries shared pipeline
-- metadata: where the raw snapshot lives, who/when collected it, the diff
-- against the last promoted version, and its human review status.
--
-- RLS is enabled with zero policies for anon/authenticated (default-deny).
-- Only the service-role key (scripts/collectors/lib/staging-client.ts)
-- reads or writes these tables, and that key bypasses RLS entirely.

create table staging_cegep_programs (
  id uuid primary key default gen_random_uuid(),
  cegep_id uuid,
  program_code text,
  name text not null,
  type text check (type in ('pre_university','technical')) not null,
  created_at timestamptz,
  raw_snapshot_path text,
  collected_at timestamptz not null default now(),
  collector_name text not null,
  diff_summary jsonb,
  review_status text check (review_status in ('pending','flagged','approved','rejected')) not null default 'pending',
  promoted_at timestamptz,
  promoted_by text
);

create table staging_courses (
  id uuid primary key default gen_random_uuid(),
  course_code text not null,
  discipline_code text,
  name text not null,
  name_en text,
  weighting numeric,
  created_at timestamptz,
  raw_snapshot_path text,
  collected_at timestamptz not null default now(),
  collector_name text not null,
  diff_summary jsonb,
  review_status text check (review_status in ('pending','flagged','approved','rejected')) not null default 'pending',
  promoted_at timestamptz,
  promoted_by text
);

create table staging_university_programs (
  id uuid primary key default gen_random_uuid(),
  university_id uuid,
  name text not null,
  degree_type text,
  overall_cutoff numeric,
  admission_type text check (admission_type in
    ('r_score_only','r_score_plus_interview','r_score_plus_portfolio','r_score_plus_test','other')) not null,
  source_url text not null,
  last_verified_at date not null,
  created_at timestamptz,
  raw_snapshot_path text,
  collected_at timestamptz not null default now(),
  collector_name text not null,
  diff_summary jsonb,
  review_status text check (review_status in ('pending','flagged','approved','rejected')) not null default 'pending',
  promoted_at timestamptz,
  promoted_by text
);

create table staging_university_program_prerequisites (
  id uuid primary key default gen_random_uuid(),
  university_program_id uuid,
  course_id uuid,
  required boolean,
  raw_snapshot_path text,
  collected_at timestamptz not null default now(),
  collector_name text not null,
  diff_summary jsonb,
  review_status text check (review_status in ('pending','flagged','approved','rejected')) not null default 'pending',
  promoted_at timestamptz,
  promoted_by text
);

create table staging_university_program_grade_floors (
  id uuid primary key default gen_random_uuid(),
  university_program_id uuid,
  course_id uuid,
  min_grade numeric not null,
  floor_type text check (floor_type in ('course_cote_r_floor','course_percentage_floor')) not null,
  source_url text not null,
  notes text,
  raw_snapshot_path text,
  collected_at timestamptz not null default now(),
  collector_name text not null,
  diff_summary jsonb,
  review_status text check (review_status in ('pending','flagged','approved','rejected')) not null default 'pending',
  promoted_at timestamptz,
  promoted_by text
);

create table staging_cutoff_history (
  id uuid primary key default gen_random_uuid(),
  university_program_id uuid,
  admission_year int not null,
  cote_r_last_admitted numeric,
  source_url text not null,
  source_type text check (source_type in ('official_pdf','cegep_published','bci','other')) not null,
  verified_at date not null,
  raw_snapshot_path text,
  collected_at timestamptz not null default now(),
  collector_name text not null,
  diff_summary jsonb,
  review_status text check (review_status in ('pending','flagged','approved','rejected')) not null default 'pending',
  promoted_at timestamptz,
  promoted_by text
);

create table staging_bursaries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_org text not null,
  cegep_id uuid,
  category text check (category in
    ('financial_need','academic_merit','athletics','arts_culture',
     'community_engagement','perseverance','program_specific','mobility','event_based','other')) not null,
  amount_min numeric,
  amount_max numeric,
  deadline_type text check (deadline_type in ('fixed_date','recurring_annual','rolling')) not null,
  deadline_date date,
  application_url text not null,
  description text,
  eligible_cegep_programs uuid[],
  eligible_university_programs uuid[],
  min_r_score numeric,
  min_session int,
  requires_essay boolean default false,
  requires_recommendation boolean default false,
  tag_criteria text[],
  last_verified_at date not null,
  created_at timestamptz,
  raw_snapshot_path text,
  collected_at timestamptz not null default now(),
  collector_name text not null,
  diff_summary jsonb,
  review_status text check (review_status in ('pending','flagged','approved','rejected')) not null default 'pending',
  promoted_at timestamptz,
  promoted_by text
);

create table staging_deadlines (
  id uuid primary key default gen_random_uuid(),
  type text check (type in ('sracq_round','sram_round','afe_deadline','withdrawal_no_penalty','other')) not null,
  title text not null,
  date date not null,
  applies_to_cegep_id uuid,
  source_url text not null,
  last_verified_at date not null,
  raw_snapshot_path text,
  collected_at timestamptz not null default now(),
  collector_name text not null,
  diff_summary jsonb,
  review_status text check (review_status in ('pending','flagged','approved','rejected')) not null default 'pending',
  promoted_at timestamptz,
  promoted_by text
);

alter table staging_cegep_programs enable row level security;
alter table staging_courses enable row level security;
alter table staging_university_programs enable row level security;
alter table staging_university_program_prerequisites enable row level security;
alter table staging_university_program_grade_floors enable row level security;
alter table staging_cutoff_history enable row level security;
alter table staging_bursaries enable row level security;
alter table staging_deadlines enable row level security;
-- Migration: 20260824200000_performance_indexes_and_rls.sql
-- Workstream 2: Database Performance, Covering Indexes, and RLS Optimization
--
-- 1. Enable pg_stat_statements for slow query profiling
-- 2. Optimize RLS policies using subquery caching: (select auth.uid()) = user_id
-- 3. Add B-Tree & composite indexes for foreign keys, join paths, and RLS predicates
-- 4. Add covering + GIN indexes for bursary matching queries
-- 5. Add review_status indexes for staging tables

-- Enable pg_stat_statements extension
create extension if not exists pg_stat_statements;

-- ============================================================================
-- 1. RLS POLICY OPTIMIZATIONS (Subquery caching avoids per-row function calls)
-- ============================================================================

-- student_profiles
drop policy if exists "own profile only" on student_profiles;
create policy "own profile only" on student_profiles
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- student_course_grades
drop policy if exists "own grades only" on student_course_grades;
create policy "own grades only" on student_course_grades
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- student_r_score_confirmations
drop policy if exists "own confirmations only" on student_r_score_confirmations;
create policy "own confirmations only" on student_r_score_confirmations
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- student_targets
drop policy if exists "own targets only" on student_targets;
create policy "own targets only" on student_targets
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ============================================================================
-- 2. INDEXES FOR RLS & STUDENT DATA TABLES
-- ============================================================================

create index if not exists idx_student_profiles_user on student_profiles(user_id);
create index if not exists idx_student_course_grades_user_session on student_course_grades(user_id, session);
create index if not exists idx_student_r_score_confirmations_user on student_r_score_confirmations(user_id, session);
create index if not exists idx_student_targets_user on student_targets(user_id);

-- ============================================================================
-- 3. COMPOSITE INDEXES FOR UNIVERSITY & CEGEP CATALOG TABLES
-- ============================================================================

create index if not exists idx_cegep_programs_cegep on cegep_programs(cegep_id, program_code);
create index if not exists idx_univ_prereqs_prog_course on university_program_prerequisites(university_program_id, course_id);
create index if not exists idx_univ_floors_prog_course on university_program_grade_floors(university_program_id, course_id);
create index if not exists idx_cutoff_history_prog_year on cutoff_history(university_program_id, admission_year desc);
create index if not exists idx_deadlines_cegep_date on deadlines(applies_to_cegep_id, date);

-- ============================================================================
-- 4. BURSARY MATCHING COVERING & GIN INDEXES
-- ============================================================================

-- Composite covering index for scalar predicates: cegep, min R-score, and session
create index if not exists idx_bursaries_matching on bursaries(cegep_id, min_r_score, min_session);

-- GIN indexes for array membership matching (programs and tag criteria)
create index if not exists idx_bursaries_eligible_programs on bursaries using gin(eligible_cegep_programs);
create index if not exists idx_bursaries_tag_criteria on bursaries using gin(tag_criteria);

-- ============================================================================
-- 5. STAGING TABLES INDEXES (Fast review and promotion scans)
-- ============================================================================

create index if not exists idx_staging_cegep_programs_status on staging_cegep_programs(review_status);
create index if not exists idx_staging_courses_status on staging_courses(review_status);
create index if not exists idx_staging_univ_programs_status on staging_university_programs(review_status);
create index if not exists idx_staging_bursaries_status on staging_bursaries(review_status);
create index if not exists idx_staging_cutoff_history_status on staging_cutoff_history(review_status);
create index if not exists idx_staging_deadlines_status on staging_deadlines(review_status);
