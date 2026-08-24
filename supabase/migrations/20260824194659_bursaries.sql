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
