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
