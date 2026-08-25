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
  -- No overall_cutoff: see the matching note on the production university_programs table.
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
  cutoff numeric not null,
  figure_type text check (figure_type in
    ('last_admitted','minimum_required','maximum','average','range_low','range_high')) not null,
  source_tier text check (source_tier in ('university_official','cegep_compiled')) not null,
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
