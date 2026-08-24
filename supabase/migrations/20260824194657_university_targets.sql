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
