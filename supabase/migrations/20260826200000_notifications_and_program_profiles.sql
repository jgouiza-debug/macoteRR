-- Migration: 20260826200000_notifications_and_program_profiles.sql
-- Part A: Notification preferences and events (habit-respecting, deduped, RLS-protected)
-- Part C: Generic program profiles for standardized pre-university DEC programs (300.A0, 200.B0)

-- ============================================================================
-- 1. NOTIFICATION PREFERENCES (RLS-protected, default false for all categories)
-- ============================================================================

create table if not exists notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  deadline_reminders boolean not null default false,
  cutoff_updates boolean not null default false,
  new_bursary_matches boolean not null default false,
  grade_window_reminders boolean not null default false,
  updated_at timestamptz default now()
);

alter table notification_preferences enable row level security;

create policy "own prefs only" on notification_preferences
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create index if not exists idx_notif_prefs_user on notification_preferences(user_id);

-- ============================================================================
-- 2. NOTIFICATION EVENTS (RLS-protected, deterministic dedupe_key)
-- ============================================================================

create table if not exists notification_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text check (category in
    ('deadline_reminder','cutoff_update','new_bursary_match','grade_window','counselor_season')) not null,
  subject_type text not null,          -- 'bursary','university_program','deadline'
  subject_id uuid not null,
  payload jsonb,                       -- rendered copy variables, e.g. { "days_left": 9, "amount": 500 }
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  dedupe_key text not null,            -- prevents re-sending the same event twice
  created_at timestamptz default now(),
  unique(user_id, dedupe_key)
);

alter table notification_events enable row level security;

create policy "own events only" on notification_events
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create index if not exists idx_notif_events_user on notification_events(user_id);
create index if not exists idx_notif_events_scheduled on notification_events(scheduled_for, sent_at);

-- ============================================================================
-- 3. GENERIC PROGRAM PROFILES (Standardized DEC profiles across cégeps)
-- ============================================================================

create table if not exists generic_program_profiles (
  id uuid primary key default gen_random_uuid(),
  program_code text unique not null,        -- '300.A0', '200.B0'
  name text not null,
  description text not null,                -- factual, sourced, no ranking language
  profils jsonb not null default '[]',       -- [{ "name": "Individu", "description": "..." }, ...]
  typical_courses text[],
  leads_to_program_categories text[],        -- broad factual categories, not a ranked fit list
  factual_career_examples text[],            -- named, sourced examples only from program directories
  source_url text not null,
  last_verified_at date not null,
  created_at timestamptz default now()
);

alter table generic_program_profiles enable row level security;

create policy "public read" on generic_program_profiles for select using (true);

create index if not exists idx_generic_prog_profiles_code on generic_program_profiles(program_code);
