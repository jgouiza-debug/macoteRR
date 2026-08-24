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
