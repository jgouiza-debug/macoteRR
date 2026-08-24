-- Migration: 20260824200000_performance_indexes_and_rls.sql
-- Workstream 2: Database Performance, Covering Indexes, and RLS Optimization
--
-- 1. Enable pg_stat_statements for slow query profiling
-- 2. Optimize RLS policies using subquery caching: (select auth.uid()) = user_id
-- 3. Add B-Tree & composite indexes for foreign keys, join paths, and RLS predicates
-- 4. Add covering + GIN indexes for bursary matching queries
-- 5. Add review_status indexes for staging tables

-- Enable pg_stat_statements extension
create extension if not exists pg_stat_statements;

-- ============================================================================
-- 1. RLS POLICY OPTIMIZATIONS (Subquery caching avoids per-row function calls)
-- ============================================================================

-- student_profiles
drop policy if exists "own profile only" on student_profiles;
create policy "own profile only" on student_profiles
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- student_course_grades
drop policy if exists "own grades only" on student_course_grades;
create policy "own grades only" on student_course_grades
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- student_r_score_confirmations
drop policy if exists "own confirmations only" on student_r_score_confirmations;
create policy "own confirmations only" on student_r_score_confirmations
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- student_targets
drop policy if exists "own targets only" on student_targets;
create policy "own targets only" on student_targets
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ============================================================================
-- 2. INDEXES FOR RLS & STUDENT DATA TABLES
-- ============================================================================

create index if not exists idx_student_profiles_user on student_profiles(user_id);
create index if not exists idx_student_course_grades_user_session on student_course_grades(user_id, session);
create index if not exists idx_student_r_score_confirmations_user on student_r_score_confirmations(user_id, session);
create index if not exists idx_student_targets_user on student_targets(user_id);

-- ============================================================================
-- 3. COMPOSITE INDEXES FOR UNIVERSITY & CEGEP CATALOG TABLES
-- ============================================================================

create index if not exists idx_cegep_programs_cegep on cegep_programs(cegep_id, program_code);
create index if not exists idx_univ_prereqs_prog_course on university_program_prerequisites(university_program_id, course_id);
create index if not exists idx_univ_floors_prog_course on university_program_grade_floors(university_program_id, course_id);
create index if not exists idx_cutoff_history_prog_year on cutoff_history(university_program_id, admission_year desc);
create index if not exists idx_deadlines_cegep_date on deadlines(applies_to_cegep_id, date);

-- ============================================================================
-- 4. BURSARY MATCHING COVERING & GIN INDEXES
-- ============================================================================

-- Composite covering index for scalar predicates: cegep, min R-score, and session
create index if not exists idx_bursaries_matching on bursaries(cegep_id, min_r_score, min_session);

-- GIN indexes for array membership matching (programs and tag criteria)
create index if not exists idx_bursaries_eligible_programs on bursaries using gin(eligible_cegep_programs);
create index if not exists idx_bursaries_tag_criteria on bursaries using gin(tag_criteria);

-- ============================================================================
-- 5. STAGING TABLES INDEXES (Fast review and promotion scans)
-- ============================================================================

create index if not exists idx_staging_cegep_programs_status on staging_cegep_programs(review_status);
create index if not exists idx_staging_courses_status on staging_courses(review_status);
create index if not exists idx_staging_univ_programs_status on staging_university_programs(review_status);
create index if not exists idx_staging_bursaries_status on staging_bursaries(review_status);
create index if not exists idx_staging_cutoff_history_status on staging_cutoff_history(review_status);
create index if not exists idx_staging_deadlines_status on staging_deadlines(review_status);
