-- 2026-09 onboarding/app pass. Everything the client now writes or reads that the schema
-- did not have a home for, plus what the reference-data overlay and push scaffolding need.
-- Every statement is idempotent (add column if not exists / drop constraint if exists) so
-- a project that already ran part of it can replay it.
--
-- Guardrail #3 still holds: nothing here is financial. `estimated_cote_r` is the student's
-- own guess and lives in its own, explicitly named column so it can never be mistaken for
-- the confirmed figures in student_r_score_confirmations (guardrail #2).

-- A ------------------------------------------------------------------------- student_profiles

alter table student_profiles
  add column if not exists interest_ids text[] not null default '{}',   -- goal quiz output
  add column if not exists dec_profile_id text,                          -- SH/SN profile pick
  add column if not exists goal_skipped boolean not null default false,  -- "Passer cette étape"
  add column if not exists estimated_cote_r numeric
    check (estimated_cote_r is null or estimated_cote_r between 15 and 50);

comment on column student_profiles.estimated_cote_r is
  'Student''s own estimate (see src/lib/profile/sync.ts). Never an official figure; those are student_r_score_confirmations rows.';

-- B ------------------------------------------------------------- staging_cegep_programs.type
-- 20260825120000 widened the production table to accept "special" (Tremplin DEC and
-- friends) but left staging on the two-value check, so a "special" row could be scraped
-- and never promoted.

alter table staging_cegep_programs drop constraint if exists staging_cegep_programs_type_check;
alter table staging_cegep_programs add constraint staging_cegep_programs_type_check
  check (type in ('pre_university', 'technical', 'special'));

-- C ---------------------------------------------------------------------- notification_events
-- The client derives events by catalogue slug (the uuid FKs only exist once the seed runs),
-- and an inbox needs a read marker. subject_type was free text; it is now the three values
-- src/lib/notifications/types.ts has always assumed.

alter table notification_events drop constraint if exists notification_events_subject_type_check;
alter table notification_events add constraint notification_events_subject_type_check
  check (subject_type in ('bursary', 'university_program', 'deadline'));
alter table notification_events alter column subject_id drop not null;
alter table notification_events add column if not exists subject_slug text;
alter table notification_events add column if not exists read_at timestamptz;
alter table notification_events drop constraint if exists notification_events_subject_present;
alter table notification_events add constraint notification_events_subject_present
  check (subject_id is not null or subject_slug is not null);
create index if not exists idx_notif_events_user_unread
  on notification_events (user_id) where read_at is null;

-- D ---------------------------------------------------------------------------------- bursaries
-- The client matches on ministerial DEC codes (src/lib/matching/match.ts), which the uuid[]
-- column cannot hold, and every shipped bursary carries its own source URL and deadline
-- precision. `catalog_slug` is the natural key the seed upserts on. application_url becomes
-- nullable: some foundations have no public form and route students to a human.

alter table bursaries add column if not exists catalog_slug text;
create unique index if not exists bursaries_catalog_slug_key on bursaries (catalog_slug);
alter table bursaries add column if not exists eligible_cegep_program_codes text[];
create index if not exists idx_bursaries_eligible_program_codes
  on bursaries using gin (eligible_cegep_program_codes);
alter table bursaries add column if not exists deadline_precision text
  check (deadline_precision is null or deadline_precision in ('day', 'month', 'year'));
alter table bursaries add column if not exists source_url text;
update bursaries set source_url = application_url where source_url is null;
alter table bursaries alter column source_url set not null;              -- guardrail #1
alter table bursaries alter column application_url drop not null;

alter table staging_bursaries
  add column if not exists catalog_slug text,
  add column if not exists eligible_cegep_program_codes text[],
  add column if not exists deadline_precision text,
  add column if not exists source_url text;
alter table staging_bursaries alter column application_url drop not null;

-- E ---------------------------------------------------------------------------------- deadlines
-- src/lib/data/important-dates.ts carries bilingual titles and details, a category, and the
-- university programs a date applies to. Widen the row to hold them so the bundle can be
-- rebuilt from the database without loss.

alter table deadlines add column if not exists catalog_slug text;
create unique index if not exists deadlines_catalog_slug_key on deadlines (catalog_slug);
alter table deadlines
  add column if not exists title_en text,
  add column if not exists detail text,
  add column if not exists detail_en text,
  add column if not exists program_slugs text[],
  add column if not exists category text;
alter table deadlines drop constraint if exists deadlines_category_check;
alter table deadlines add constraint deadlines_category_check
  check (category is null or category in ('cegep', 'university', 'bursary', 'test', 'general'));
alter table deadlines drop constraint if exists deadlines_type_check;
alter table deadlines add constraint deadlines_type_check check (type in
  ('sracq_round', 'sram_round', 'afe_deadline', 'withdrawal_no_penalty',
   'university_admission', 'test', 'bursary', 'other'));

alter table staging_deadlines
  add column if not exists catalog_slug text,
  add column if not exists title_en text,
  add column if not exists detail text,
  add column if not exists detail_en text,
  add column if not exists program_slugs text[],
  add column if not exists category text;
alter table staging_deadlines drop constraint if exists staging_deadlines_type_check;
alter table staging_deadlines add constraint staging_deadlines_type_check check (type in
  ('sracq_round', 'sram_round', 'afe_deadline', 'withdrawal_no_penalty',
   'university_admission', 'test', 'bursary', 'other'));

-- F ----------------------------------------------------------------- generic_program_profiles
-- Ministerial revisions and double-DEC variants (200.B1, 200.11, 300.M0, …) are the same
-- programme as their base code; `aliases` records that instead of duplicating the profile.

alter table generic_program_profiles
  add column if not exists name_en text,
  add column if not exists description_en text,
  add column if not exists aliases text[] not null default '{}';
create index if not exists idx_generic_prog_profiles_aliases
  on generic_program_profiles using gin (aliases);

-- G --------------------------------------------------------------------- push_subscriptions
-- Web Push endpoints, one row per browser. Only read by the service-role sender
-- (scripts/notifications/send-due.ts); students see and delete only their own.

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  endpoint text unique not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  locale text check (locale is null or locale in ('fr', 'en')),
  created_at timestamptz default now(),
  last_seen_at timestamptz default now()
);
alter table push_subscriptions enable row level security;
drop policy if exists "own subscriptions only" on push_subscriptions;
create policy "own subscriptions only" on push_subscriptions
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create index if not exists idx_push_subscriptions_user on push_subscriptions (user_id);

-- H ------------------------------------------------------------------------ catalog_versions
-- What /api/reference/version reports. One row per seed or promotion; the newest wins.

create table if not exists catalog_versions (
  version text primary key,
  generated_at timestamptz not null,
  source text not null check (source in ('build-catalog', 'promote')),
  row_counts jsonb
);
alter table catalog_versions enable row level security;
drop policy if exists "public read" on catalog_versions;
create policy "public read" on catalog_versions for select using (true);
