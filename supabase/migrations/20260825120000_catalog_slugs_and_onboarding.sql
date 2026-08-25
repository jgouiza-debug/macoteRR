-- Onboarding rework: make the scraped Quebec City catalogue addressable from the client,
-- and let a student's profile survive being written before the catalogue is seeded.
--
-- Three changes, each independent:
--
--   1. `catalog_slug` on the two program tables. The generated catalogue
--      (src/lib/data/catalog.generated.ts) keys programs by a human-readable slug, not by a
--      uuid, so routes stay readable and a re-seed cannot renumber a student's saved target.
--      Unique, so supabase/seed/catalog.sql can upsert on replay.
--
--   2. `cegep_programs.type` gains 'special'. The scrape contains "Cheminement particulier"
--      entries (Tremplin DEC and friends) that are neither pre-university nor technical.
--      Dropping them would silently hide real programs from real students.
--
--   3. `student_profiles` gains slug columns plus a resolver trigger. Onboarding runs before
--      the catalogue is guaranteed seeded, and the uuid FKs would reject the insert. The slug
--      columns always accept the write; the trigger backfills the FK the moment a matching
--      catalogue row exists. Guardrail #3 still holds — nothing here is financial.

-- 1 ------------------------------------------------------------------------

alter table cegep_programs add column if not exists catalog_slug text;
create unique index if not exists cegep_programs_catalog_slug_key
  on cegep_programs (catalog_slug);

alter table university_programs add column if not exists catalog_slug text;
create unique index if not exists university_programs_catalog_slug_key
  on university_programs (catalog_slug);

-- 2 ------------------------------------------------------------------------

alter table cegep_programs drop constraint if exists cegep_programs_type_check;
alter table cegep_programs add constraint cegep_programs_type_check
  check (type in ('pre_university', 'technical', 'special'));

-- 3 ------------------------------------------------------------------------

alter table student_profiles add column if not exists cegep_short_code text;
alter table student_profiles add column if not exists cegep_program_slug text;

-- R-score status the student arrived with. The official, self-reported number keeps living
-- in student_r_score_confirmations; this only records which path onboarding took so the UI
-- can keep labelling an estimate as an estimate (guardrail #2).
alter table student_profiles add column if not exists r_score_status text
  check (r_score_status in ('confirmed', 'estimated'));

create or replace function resolve_student_profile_catalog_refs()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.cegep_short_code is not null and new.cegep_id is null then
    select id into new.cegep_id from cegeps where short_code = new.cegep_short_code;
  end if;

  if new.cegep_program_slug is not null and new.cegep_program_id is null then
    select id into new.cegep_program_id from cegep_programs where catalog_slug = new.cegep_program_slug;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists student_profiles_resolve_catalog_refs on student_profiles;
create trigger student_profiles_resolve_catalog_refs
  before insert or update on student_profiles
  for each row execute function resolve_student_profile_catalog_refs();

-- Targets picked during the university-choice quiz. `student_targets.university_program_id`
-- is a uuid FK into a table that is only populated once the seed runs, so the quiz records
-- its picks by slug and the same resolve-on-write pattern applies.
alter table student_targets alter column university_program_id drop not null;
alter table student_targets add column if not exists catalog_slug text;

create or replace function resolve_student_target_catalog_ref()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.catalog_slug is not null and new.university_program_id is null then
    select id into new.university_program_id from university_programs where catalog_slug = new.catalog_slug;
  end if;
  return new;
end;
$$;

drop trigger if exists student_targets_resolve_catalog_ref on student_targets;
create trigger student_targets_resolve_catalog_ref
  before insert or update on student_targets
  for each row execute function resolve_student_target_catalog_ref();

-- A student can only hold one row per target. Not a partial index: PostgREST's upsert
-- emits ON CONFLICT with no predicate, and a partial index would make it unusable.
-- Many NULL slugs are still allowed (unique indexes treat NULLs as distinct by default).
create unique index if not exists student_targets_user_slug_key
  on student_targets (user_id, catalog_slug);
