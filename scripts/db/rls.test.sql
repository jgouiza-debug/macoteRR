-- Real row-level-security test, run by scripts/benchmark/test-rls.ts against the local bed
-- (scripts/db/local/up.sh) or any Postgres carrying the migrations plus the auth shim.
--
-- The previous "test" compared three hard-coded strings to each other and printed PASS. This
-- one creates two users, switches roles the way PostgREST does (set role + request.jwt.claims),
-- and asserts what each can see and do. ON_ERROR_STOP turns any failed assertion into a
-- non-zero exit.
\set ON_ERROR_STOP on
\pset footer off
\o /dev/null
\set a '00000000-0000-4000-8000-00000000000a'
\set b '00000000-0000-4000-8000-00000000000b'

reset role;

create or replace function public.assert_true(cond boolean, msg text) returns void
language plpgsql as $$
begin
  if not coalesce(cond, false) then raise exception 'ASSERT FAILED: %', msg; end if;
end $$;

-- Runs `stmt` as the CURRENT role (security invoker) and passes only if RLS denies it.
create or replace function public.assert_denied(stmt text, msg text) returns void
language plpgsql as $$
begin
  execute stmt;
  raise exception 'ASSERT FAILED (should have been denied): %', msg;
exception
  when insufficient_privilege then return;
end $$;

grant execute on function public.assert_true(boolean, text) to anon, authenticated;
grant execute on function public.assert_denied(text, text) to anon, authenticated;

-- Fixtures: two users, and a real (cégep, DEC) pair from the seed for the resolver test.
delete from auth.users where id in (:'a', :'b');
insert into auth.users (id, email) values (:'a', 'rls-a@test.local'), (:'b', 'rls-b@test.local');
select c.short_code as seed_cegep, p.program_code as seed_dec
  from cegep_programs p join cegeps c on c.id = p.cegep_id
 order by c.short_code, p.program_code limit 1 \gset

-- ---------------------------------------------------------------- 1. A writes and reads own rows
select set_config('request.jwt.claims', json_build_object('sub', :'a', 'role', 'authenticated')::text, false);
set role authenticated;

insert into student_profiles (user_id, cegep_short_code, cegep_program_code, current_session, self_tags, r_score_status, interest_ids, goal_skipped, estimated_cote_r)
  values (:'a', :'seed_cegep', :'seed_dec', 3, '{sports}', 'confirmed', '{sante}', false, null);
insert into student_r_score_confirmations (user_id, session, official_cote_r) values (:'a', 3, 31.2);
insert into student_targets (user_id, catalog_slug) values (:'a', 'rls-test-target');
insert into notification_preferences (user_id, deadline_reminders) values (:'a', true);
insert into notification_events (user_id, category, subject_type, subject_slug, scheduled_for, dedupe_key)
  values (:'a', 'deadline_reminder', 'deadline', 'sram-round-1-2027', now(), 'rls-test-k1');
insert into push_subscriptions (user_id, endpoint, p256dh, auth) values (:'a', 'https://push.example/rls-a', 'p', 'a');

select assert_true((select count(*) from student_profiles) = 1, 'A sees exactly own profile');
select assert_true((select count(*) from student_r_score_confirmations) = 1, 'A sees own confirmation');
select assert_true((select count(*) from student_targets) = 1, 'A sees own target');
select assert_true((select count(*) from notification_preferences) = 1, 'A sees own prefs');
select assert_true((select count(*) from notification_events) = 1, 'A sees own events');
select assert_true((select count(*) from push_subscriptions) = 1, 'A sees own push subscription');
select assert_true((select cegep_id is not null from student_profiles where user_id = :'a'),
  'resolver trigger filled cegep_id under RLS (security definer works)');
select assert_true((select cegep_program_id is not null from student_profiles where user_id = :'a'),
  'resolver trigger filled cegep_program_id under RLS');
select assert_true((select updated_at is not null from student_profiles where user_id = :'a'), 'updated_at maintained');

-- ---------------------------------------------------------------- 2. B cannot see or touch A
reset role;
select set_config('request.jwt.claims', json_build_object('sub', :'b', 'role', 'authenticated')::text, false);
set role authenticated;

select assert_true((select count(*) from student_profiles) = 0, 'B sees no profile of A');
select assert_true((select count(*) from student_r_score_confirmations) = 0, 'B sees no confirmation of A');
select assert_true((select count(*) from student_targets) = 0, 'B sees no target of A');
select assert_true((select count(*) from notification_preferences) = 0, 'B sees no prefs of A');
select assert_true((select count(*) from notification_events) = 0, 'B sees no events of A');
select assert_true((select count(*) from push_subscriptions) = 0, 'B sees no push subscription of A');

with touched as (update student_profiles set current_session = 9 where user_id = :'a' returning 1)
select assert_true((select count(*) from touched) = 0, 'B update on A''s profile affects 0 rows');
with touched as (delete from student_targets where user_id = :'a' returning 1)
select assert_true((select count(*) from touched) = 0, 'B delete on A''s targets affects 0 rows');

select assert_denied(format('insert into student_profiles (user_id) values (%L)', :'a'), 'B inserts a profile for A');
select assert_denied(format('insert into student_targets (user_id, catalog_slug) values (%L, %L)', :'a', 'x'), 'B inserts a target for A');
select assert_denied(format('insert into notification_events (user_id, category, subject_type, subject_slug, scheduled_for, dedupe_key) values (%L, %L, %L, %L, now(), %L)', :'a', 'deadline_reminder', 'deadline', 'x', 'rls-test-k2'), 'B inserts an event for A');

-- A's data is intact after B's attempts.
reset role;
select set_config('request.jwt.claims', json_build_object('sub', :'a', 'role', 'authenticated')::text, false);
set role authenticated;
select assert_true((select current_session from student_profiles where user_id = :'a') = 3, 'A''s session untouched by B');
select assert_true((select count(*) from student_targets) = 1, 'A''s target untouched by B');

-- ---------------------------------------------------------------- 3. anon: catalogue read-only, nothing personal
reset role;
select set_config('request.jwt.claims', '{"role":"anon"}', false);
set role anon;

select assert_true((select count(*) from student_profiles) = 0, 'anon sees no profiles');
select assert_true((select count(*) from student_targets) = 0, 'anon sees no targets');
select assert_true((select count(*) from push_subscriptions) = 0, 'anon sees no push subscriptions');
select assert_true((select count(*) from cegeps) > 0, 'anon reads the cégep catalogue');
select assert_true((select count(*) from university_programs) > 0, 'anon reads the university catalogue');
select assert_true((select count(*) from catalog_versions) >= 0, 'anon can read catalog_versions');
select assert_denied('insert into cegeps (name, short_code, sector) values (''X'', ''rls-x'', ''public_french'')', 'anon inserts a cégep');
-- UPDATE/DELETE with no policy are filtered to zero rows rather than raising (Postgres RLS
-- semantics, same on Supabase); the row must stay untouched either way.
with touched as (update cegeps set name = 'X' where true returning 1)
select assert_true((select count(*) from touched) = 0, 'anon update on the catalogue affects 0 rows');
select assert_true((select count(*) from cegeps where name = 'X') = 0, 'anon update changed nothing');
select assert_denied(format('insert into student_profiles (user_id) values (%L)', :'a'), 'anon inserts a profile');
select assert_true((select count(*) from staging_bursaries) = 0, 'staging is invisible to anon (default deny)');
select assert_denied('insert into staging_bursaries (name, source_org, category, deadline_type, last_verified_at, collector_name) values (''X'', ''X'', ''other'', ''rolling'', current_date, ''rls'')', 'anon writes staging');

-- ---------------------------------------------------------------- 4. seed provenance (guardrail #1)
reset role;
select assert_true((select count(*) from cegeps) >= 11, 'seed: at least the 11 Quebec City cégeps');
select assert_true((select count(*) from university_programs) > 0, 'seed: university programmes present');
select assert_true((select count(*) from university_programs where source_url is null or last_verified_at is null) = 0, 'seed: every university programme has source + date');
select assert_true((select count(*) from bursaries where source_url is null or last_verified_at is null) = 0, 'seed: every bursary has source + date');
select assert_true((select count(*) from cutoff_history where source_url is null or verified_at is null) = 0, 'seed: every cutoff has source + date');
select assert_true((select count(*) from deadlines where source_url is null or last_verified_at is null) = 0, 'seed: every deadline has source + date');
select assert_true((select count(*) from bursaries b where b.cegep_id is not null and not exists (select 1 from cegeps c where c.id = b.cegep_id)) = 0, 'seed: every bursary cégep exists');

-- ---------------------------------------------------------------- cleanup
delete from auth.users where id in (:'a', :'b');
drop function public.assert_denied(text, text);
drop function public.assert_true(boolean, text);
\o
\echo RLS: all assertions passed
