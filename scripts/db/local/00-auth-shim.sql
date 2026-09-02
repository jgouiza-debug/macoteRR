-- Local verification bed: the minimum of Supabase's `auth` schema that the migrations in
-- supabase/migrations/ reference, so they apply unmodified to a plain Postgres 16.
--
-- This is NOT a Supabase replacement. It exists so that `scripts/db/local/up.sh` can prove
-- three things without a cloud project or the Supabase Docker stack:
--   1. every migration applies from an empty database, in order;
--   2. supabase/full_schema.sql produces the same schema as the migrations;
--   3. the RLS policies actually deny what they should (scripts/db/rls.test.sql).
--
-- auth.uid()/auth.role() read the same `request.jwt.claims` setting PostgREST populates on
-- Supabase, so `set_config('request.jwt.claims', '{"sub":"<uuid>","role":"authenticated"}', true)`
-- inside a transaction impersonates a signed-in student exactly the way the real stack does.

create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key,
  email text,
  created_at timestamptz default now()
);

create or replace function auth.uid() returns uuid
language sql stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
  )::uuid
$$;

create or replace function auth.role() returns text
language sql stable
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'
  )
$$;

-- Supabase's three API roles. `service_role` bypasses RLS (that is what the collector
-- scripts rely on); `anon` and `authenticated` are subject to it.
do $$ begin create role anon nologin; exception when duplicate_object then null; end $$;
do $$ begin create role authenticated nologin; exception when duplicate_object then null; end $$;
do $$ begin create role service_role nologin bypassrls; exception when duplicate_object then null; end $$;

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth to anon, authenticated, service_role;
grant select on auth.users to authenticated, service_role;

-- Supabase grants table privileges to the API roles and relies on RLS to restrict rows.
-- Mirror that, so a "denied" in the RLS test means the policy denied it, not a missing grant.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
