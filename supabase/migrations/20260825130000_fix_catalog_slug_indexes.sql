-- Fixes the unique indexes added by 20260825120000, which were created as PARTIAL indexes
-- (`where catalog_slug is not null`).
--
-- Two problems with that:
--
--   1. `ON CONFLICT (catalog_slug)` cannot infer a partial index unless the statement repeats
--      the index predicate (`ON CONFLICT (catalog_slug) WHERE catalog_slug is not null`).
--      supabase/seed/catalog.sql does not, so it failed with:
--        42P10: there is no unique or exclusion constraint matching the ON CONFLICT specification
--
--   2. More seriously, PostgREST generates `ON CONFLICT (cols) DO UPDATE` with no predicate and
--      offers no way to add one. So `student_targets`' partial index would have broken every
--      upsert from src/lib/profile/sync.ts at runtime — a failure the seed happened to surface
--      first, but which would otherwise have shown up only once a student saved a target.
--
-- The predicate bought nothing to begin with: a unique index already permits many NULLs
-- (NULLS DISTINCT is the default), so a plain unique index has exactly the intended semantics
-- — at most one row per non-null slug, unconstrained nulls.

drop index if exists cegep_programs_catalog_slug_key;
create unique index cegep_programs_catalog_slug_key
  on cegep_programs (catalog_slug);

drop index if exists university_programs_catalog_slug_key;
create unique index university_programs_catalog_slug_key
  on university_programs (catalog_slug);

drop index if exists student_targets_user_slug_key;
create unique index student_targets_user_slug_key
  on student_targets (user_id, catalog_slug);
