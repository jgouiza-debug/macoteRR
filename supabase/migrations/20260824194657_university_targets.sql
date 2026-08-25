-- Cluster 3: university-side targets. See docs/01-data-architecture.md.

create table university_programs (
  id uuid primary key default gen_random_uuid(),
  university_id uuid references universities(id) not null,
  name text not null,
  degree_type text,                        -- 'BAA', 'BSc', 'MD', etc.
  -- No overall_cutoff column: universities publish multi-year ranges, or min/max/average,
  -- or nothing at all — never one current-year number. See the 2026-08-24 data audit and
  -- docs/01-data-architecture.md. cutoff_history is the only home for figures.
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

-- Every published figure carries its own year AND its own figure type: universities
-- publish last-admitted, minimum-required, maximum, average, or a range_low/range_high pair
-- for the SAME program and year, never one canonical number. A student's score is compared
-- against the resulting low/high band (see src/lib/rscore/cutoff-range.ts), never against a
-- single cutoff.
create table cutoff_history (
  id uuid primary key default gen_random_uuid(),
  university_program_id uuid references university_programs(id) not null,
  admission_year int not null,
  cutoff numeric not null,
  figure_type text check (figure_type in
    ('last_admitted','minimum_required','maximum','average','range_low','range_high')) not null,
  -- university_official always wins over cegep_compiled when both exist for a program+year.
  source_tier text check (source_tier in ('university_official','cegep_compiled')) not null,
  source_url text not null,
  source_type text check (source_type in ('official_pdf','cegep_published','bci','other')) not null,
  verified_at date not null,
  unique(university_program_id, admission_year, figure_type)
);

alter table university_programs enable row level security;
create policy "public read" on university_programs for select using (true);

alter table university_program_prerequisites enable row level security;
create policy "public read" on university_program_prerequisites for select using (true);

alter table university_program_grade_floors enable row level security;
create policy "public read" on university_program_grade_floors for select using (true);

alter table cutoff_history enable row level security;
create policy "public read" on cutoff_history for select using (true);
