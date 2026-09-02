/**
 * Hand-authored to match docs/01-data-architecture.md exactly, since `supabase gen types`
 * needs either Docker (local stack) or a linked cloud project, and neither exists yet.
 * Regenerate via `npx supabase gen types typescript` once a project exists, and diff
 * against this file as a correctness check.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CegepSector = "public_french" | "public_english" | "private";
export type CegepProgramType = "pre_university" | "technical" | "special";
export type AdmissionType =
  | "r_score_only"
  | "r_score_plus_interview"
  | "r_score_plus_portfolio"
  | "r_score_plus_test"
  | "other";
export type GradeFloorType = "course_cote_r_floor" | "course_percentage_floor";
export type CutoffSourceType = "official_pdf" | "cegep_published" | "bci" | "other";
// No single "current cutoff": universities publish multi-year ranges, min/max/average, or
// nothing at all. Every cutoff_history row carries both of these. See the 2026-08-24 data
// audit and docs/01-data-architecture.md.
export type CutoffFigureType =
  | "last_admitted"
  | "minimum_required"
  | "maximum"
  | "average"
  | "range_low"
  | "range_high";
export type CutoffSourceTier = "university_official" | "cegep_compiled";
export type BursaryCategory =
  | "financial_need"
  | "academic_merit"
  | "athletics"
  | "arts_culture"
  | "community_engagement"
  | "perseverance"
  | "program_specific"
  | "mobility"
  | "event_based"
  | "other";
export type BursaryDeadlineType = "fixed_date" | "recurring_annual" | "rolling";
/** Which onboarding path produced the student's score. See src/lib/profile/store.ts. */
export type RScoreStatus = "confirmed" | "estimated";
export type DeadlineType =
  | "sracq_round"
  | "sram_round"
  | "afe_deadline"
  | "withdrawal_no_penalty"
  | "other";
export type ReviewStatus = "pending" | "flagged" | "approved" | "rejected";
export type NotificationCategory =
  | "deadline_reminder"
  | "cutoff_update"
  | "new_bursary_match"
  | "grade_window"
  | "counselor_season";
export type NotificationSubjectType = "bursary" | "university_program" | "deadline";

// ---- GENERATED below this line by scripts/db/gen-types.ts (29 tables) ----

export type Database = {
  public: {
    Tables: {
      bursaries: {
        Row: {
          id: string;
          name: string;
          source_org: string;
          cegep_id: string | null;
          category: "financial_need" | "academic_merit" | "athletics" | "arts_culture" | "community_engagement" | "perseverance" | "program_specific" | "mobility" | "event_based" | "other";
          amount_min: number | null;
          amount_max: number | null;
          deadline_type: "fixed_date" | "recurring_annual" | "rolling";
          deadline_date: string | null;
          application_url: string | null;
          description: string | null;
          eligible_cegep_programs: string[] | null;
          eligible_university_programs: string[] | null;
          min_r_score: number | null;
          min_session: number | null;
          requires_essay: boolean | null;
          requires_recommendation: boolean | null;
          tag_criteria: string[] | null;
          last_verified_at: string;
          created_at: string | null;
          catalog_slug: string | null;
          eligible_cegep_program_codes: string[] | null;
          deadline_precision: "day" | "month" | "year" | null;
          source_url: string;
        };
        Insert: {
          id?: string;
          name: string;
          source_org: string;
          cegep_id?: string | null;
          category: "financial_need" | "academic_merit" | "athletics" | "arts_culture" | "community_engagement" | "perseverance" | "program_specific" | "mobility" | "event_based" | "other";
          amount_min?: number | null;
          amount_max?: number | null;
          deadline_type: "fixed_date" | "recurring_annual" | "rolling";
          deadline_date?: string | null;
          application_url?: string | null;
          description?: string | null;
          eligible_cegep_programs?: string[] | null;
          eligible_university_programs?: string[] | null;
          min_r_score?: number | null;
          min_session?: number | null;
          requires_essay?: boolean | null;
          requires_recommendation?: boolean | null;
          tag_criteria?: string[] | null;
          last_verified_at: string;
          created_at?: string | null;
          catalog_slug?: string | null;
          eligible_cegep_program_codes?: string[] | null;
          deadline_precision?: "day" | "month" | "year" | null;
          source_url: string;
        };
        Update: {
          id?: string;
          name?: string;
          source_org?: string;
          cegep_id?: string | null;
          category?: "financial_need" | "academic_merit" | "athletics" | "arts_culture" | "community_engagement" | "perseverance" | "program_specific" | "mobility" | "event_based" | "other";
          amount_min?: number | null;
          amount_max?: number | null;
          deadline_type?: "fixed_date" | "recurring_annual" | "rolling";
          deadline_date?: string | null;
          application_url?: string | null;
          description?: string | null;
          eligible_cegep_programs?: string[] | null;
          eligible_university_programs?: string[] | null;
          min_r_score?: number | null;
          min_session?: number | null;
          requires_essay?: boolean | null;
          requires_recommendation?: boolean | null;
          tag_criteria?: string[] | null;
          last_verified_at?: string;
          created_at?: string | null;
          catalog_slug?: string | null;
          eligible_cegep_program_codes?: string[] | null;
          deadline_precision?: "day" | "month" | "year" | null;
          source_url?: string;
        };
        Relationships: [];
      };
      catalog_versions: {
        Row: {
          version: string;
          generated_at: string;
          source: "build-catalog" | "promote";
          row_counts: Json | null;
        };
        Insert: {
          version: string;
          generated_at: string;
          source: "build-catalog" | "promote";
          row_counts?: Json | null;
        };
        Update: {
          version?: string;
          generated_at?: string;
          source?: "build-catalog" | "promote";
          row_counts?: Json | null;
        };
        Relationships: [];
      };
      cegep_programs: {
        Row: {
          id: string;
          cegep_id: string;
          program_code: string | null;
          name: string;
          type: "pre_university" | "technical" | "special";
          created_at: string | null;
          catalog_slug: string | null;
        };
        Insert: {
          id?: string;
          cegep_id: string;
          program_code?: string | null;
          name: string;
          type: "pre_university" | "technical" | "special";
          created_at?: string | null;
          catalog_slug?: string | null;
        };
        Update: {
          id?: string;
          cegep_id?: string;
          program_code?: string | null;
          name?: string;
          type?: "pre_university" | "technical" | "special";
          created_at?: string | null;
          catalog_slug?: string | null;
        };
        Relationships: [];
      };
      cegeps: {
        Row: {
          id: string;
          name: string;
          short_code: string;
          sector: "public_french" | "public_english" | "private";
          region: string;
          website_url: string | null;
          admission_service: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          short_code: string;
          sector: "public_french" | "public_english" | "private";
          region?: string;
          website_url?: string | null;
          admission_service?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          short_code?: string;
          sector?: "public_french" | "public_english" | "private";
          region?: string;
          website_url?: string | null;
          admission_service?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          course_code: string;
          discipline_code: string | null;
          name: string;
          name_en: string | null;
          weighting: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          course_code: string;
          discipline_code?: string | null;
          name: string;
          name_en?: string | null;
          weighting?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          course_code?: string;
          discipline_code?: string | null;
          name?: string;
          name_en?: string | null;
          weighting?: number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      cutoff_history: {
        Row: {
          id: string;
          university_program_id: string;
          admission_year: number;
          cutoff: number;
          figure_type: "last_admitted" | "minimum_required" | "maximum" | "average" | "range_low" | "range_high";
          source_tier: "university_official" | "cegep_compiled";
          source_url: string;
          source_type: "official_pdf" | "cegep_published" | "bci" | "other";
          verified_at: string;
        };
        Insert: {
          id?: string;
          university_program_id: string;
          admission_year: number;
          cutoff: number;
          figure_type: "last_admitted" | "minimum_required" | "maximum" | "average" | "range_low" | "range_high";
          source_tier: "university_official" | "cegep_compiled";
          source_url: string;
          source_type: "official_pdf" | "cegep_published" | "bci" | "other";
          verified_at: string;
        };
        Update: {
          id?: string;
          university_program_id?: string;
          admission_year?: number;
          cutoff?: number;
          figure_type?: "last_admitted" | "minimum_required" | "maximum" | "average" | "range_low" | "range_high";
          source_tier?: "university_official" | "cegep_compiled";
          source_url?: string;
          source_type?: "official_pdf" | "cegep_published" | "bci" | "other";
          verified_at?: string;
        };
        Relationships: [];
      };
      deadlines: {
        Row: {
          id: string;
          type: "sracq_round" | "sram_round" | "afe_deadline" | "withdrawal_no_penalty" | "university_admission" | "test" | "bursary" | "other";
          title: string;
          date: string;
          applies_to_cegep_id: string | null;
          source_url: string;
          last_verified_at: string;
          catalog_slug: string | null;
          title_en: string | null;
          detail: string | null;
          detail_en: string | null;
          program_slugs: string[] | null;
          category: "cegep" | "university" | "bursary" | "test" | "general" | null;
        };
        Insert: {
          id?: string;
          type: "sracq_round" | "sram_round" | "afe_deadline" | "withdrawal_no_penalty" | "university_admission" | "test" | "bursary" | "other";
          title: string;
          date: string;
          applies_to_cegep_id?: string | null;
          source_url: string;
          last_verified_at: string;
          catalog_slug?: string | null;
          title_en?: string | null;
          detail?: string | null;
          detail_en?: string | null;
          program_slugs?: string[] | null;
          category?: "cegep" | "university" | "bursary" | "test" | "general" | null;
        };
        Update: {
          id?: string;
          type?: "sracq_round" | "sram_round" | "afe_deadline" | "withdrawal_no_penalty" | "university_admission" | "test" | "bursary" | "other";
          title?: string;
          date?: string;
          applies_to_cegep_id?: string | null;
          source_url?: string;
          last_verified_at?: string;
          catalog_slug?: string | null;
          title_en?: string | null;
          detail?: string | null;
          detail_en?: string | null;
          program_slugs?: string[] | null;
          category?: "cegep" | "university" | "bursary" | "test" | "general" | null;
        };
        Relationships: [];
      };
      generic_program_profiles: {
        Row: {
          id: string;
          program_code: string;
          name: string;
          description: string;
          profils: Json;
          typical_courses: string[] | null;
          leads_to_program_categories: string[] | null;
          factual_career_examples: string[] | null;
          source_url: string;
          last_verified_at: string;
          created_at: string | null;
          name_en: string | null;
          description_en: string | null;
          aliases: string[];
        };
        Insert: {
          id?: string;
          program_code: string;
          name: string;
          description: string;
          profils?: Json;
          typical_courses?: string[] | null;
          leads_to_program_categories?: string[] | null;
          factual_career_examples?: string[] | null;
          source_url: string;
          last_verified_at: string;
          created_at?: string | null;
          name_en?: string | null;
          description_en?: string | null;
          aliases?: string[];
        };
        Update: {
          id?: string;
          program_code?: string;
          name?: string;
          description?: string;
          profils?: Json;
          typical_courses?: string[] | null;
          leads_to_program_categories?: string[] | null;
          factual_career_examples?: string[] | null;
          source_url?: string;
          last_verified_at?: string;
          created_at?: string | null;
          name_en?: string | null;
          description_en?: string | null;
          aliases?: string[];
        };
        Relationships: [];
      };
      notification_events: {
        Row: {
          id: string;
          user_id: string;
          category: "deadline_reminder" | "cutoff_update" | "new_bursary_match" | "grade_window" | "counselor_season";
          subject_type: "bursary" | "university_program" | "deadline";
          subject_id: string | null;
          payload: Json | null;
          scheduled_for: string;
          sent_at: string | null;
          dedupe_key: string;
          created_at: string | null;
          subject_slug: string | null;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: "deadline_reminder" | "cutoff_update" | "new_bursary_match" | "grade_window" | "counselor_season";
          subject_type: "bursary" | "university_program" | "deadline";
          subject_id?: string | null;
          payload?: Json | null;
          scheduled_for: string;
          sent_at?: string | null;
          dedupe_key: string;
          created_at?: string | null;
          subject_slug?: string | null;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: "deadline_reminder" | "cutoff_update" | "new_bursary_match" | "grade_window" | "counselor_season";
          subject_type?: "bursary" | "university_program" | "deadline";
          subject_id?: string | null;
          payload?: Json | null;
          scheduled_for?: string;
          sent_at?: string | null;
          dedupe_key?: string;
          created_at?: string | null;
          subject_slug?: string | null;
          read_at?: string | null;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          user_id: string;
          deadline_reminders: boolean;
          cutoff_updates: boolean;
          new_bursary_matches: boolean;
          grade_window_reminders: boolean;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          deadline_reminders?: boolean;
          cutoff_updates?: boolean;
          new_bursary_matches?: boolean;
          grade_window_reminders?: boolean;
          updated_at?: string | null;
        };
        Update: {
          user_id?: string;
          deadline_reminders?: boolean;
          cutoff_updates?: boolean;
          new_bursary_matches?: boolean;
          grade_window_reminders?: boolean;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      pg_stat_statements: {
        Row: {
          userid: string | null;
          dbid: string | null;
          toplevel: boolean | null;
          queryid: number | null;
          query: string | null;
          plans: number | null;
          total_plan_time: number | null;
          min_plan_time: number | null;
          max_plan_time: number | null;
          mean_plan_time: number | null;
          stddev_plan_time: number | null;
          calls: number | null;
          total_exec_time: number | null;
          min_exec_time: number | null;
          max_exec_time: number | null;
          mean_exec_time: number | null;
          stddev_exec_time: number | null;
          rows: number | null;
          shared_blks_hit: number | null;
          shared_blks_read: number | null;
          shared_blks_dirtied: number | null;
          shared_blks_written: number | null;
          local_blks_hit: number | null;
          local_blks_read: number | null;
          local_blks_dirtied: number | null;
          local_blks_written: number | null;
          temp_blks_read: number | null;
          temp_blks_written: number | null;
          blk_read_time: number | null;
          blk_write_time: number | null;
          temp_blk_read_time: number | null;
          temp_blk_write_time: number | null;
          wal_records: number | null;
          wal_fpi: number | null;
          wal_bytes: number | null;
          jit_functions: number | null;
          jit_generation_time: number | null;
          jit_inlining_count: number | null;
          jit_inlining_time: number | null;
          jit_optimization_count: number | null;
          jit_optimization_time: number | null;
          jit_emission_count: number | null;
          jit_emission_time: number | null;
        };
        Insert: {
          userid?: string | null;
          dbid?: string | null;
          toplevel?: boolean | null;
          queryid?: number | null;
          query?: string | null;
          plans?: number | null;
          total_plan_time?: number | null;
          min_plan_time?: number | null;
          max_plan_time?: number | null;
          mean_plan_time?: number | null;
          stddev_plan_time?: number | null;
          calls?: number | null;
          total_exec_time?: number | null;
          min_exec_time?: number | null;
          max_exec_time?: number | null;
          mean_exec_time?: number | null;
          stddev_exec_time?: number | null;
          rows?: number | null;
          shared_blks_hit?: number | null;
          shared_blks_read?: number | null;
          shared_blks_dirtied?: number | null;
          shared_blks_written?: number | null;
          local_blks_hit?: number | null;
          local_blks_read?: number | null;
          local_blks_dirtied?: number | null;
          local_blks_written?: number | null;
          temp_blks_read?: number | null;
          temp_blks_written?: number | null;
          blk_read_time?: number | null;
          blk_write_time?: number | null;
          temp_blk_read_time?: number | null;
          temp_blk_write_time?: number | null;
          wal_records?: number | null;
          wal_fpi?: number | null;
          wal_bytes?: number | null;
          jit_functions?: number | null;
          jit_generation_time?: number | null;
          jit_inlining_count?: number | null;
          jit_inlining_time?: number | null;
          jit_optimization_count?: number | null;
          jit_optimization_time?: number | null;
          jit_emission_count?: number | null;
          jit_emission_time?: number | null;
        };
        Update: {
          userid?: string | null;
          dbid?: string | null;
          toplevel?: boolean | null;
          queryid?: number | null;
          query?: string | null;
          plans?: number | null;
          total_plan_time?: number | null;
          min_plan_time?: number | null;
          max_plan_time?: number | null;
          mean_plan_time?: number | null;
          stddev_plan_time?: number | null;
          calls?: number | null;
          total_exec_time?: number | null;
          min_exec_time?: number | null;
          max_exec_time?: number | null;
          mean_exec_time?: number | null;
          stddev_exec_time?: number | null;
          rows?: number | null;
          shared_blks_hit?: number | null;
          shared_blks_read?: number | null;
          shared_blks_dirtied?: number | null;
          shared_blks_written?: number | null;
          local_blks_hit?: number | null;
          local_blks_read?: number | null;
          local_blks_dirtied?: number | null;
          local_blks_written?: number | null;
          temp_blks_read?: number | null;
          temp_blks_written?: number | null;
          blk_read_time?: number | null;
          blk_write_time?: number | null;
          temp_blk_read_time?: number | null;
          temp_blk_write_time?: number | null;
          wal_records?: number | null;
          wal_fpi?: number | null;
          wal_bytes?: number | null;
          jit_functions?: number | null;
          jit_generation_time?: number | null;
          jit_inlining_count?: number | null;
          jit_inlining_time?: number | null;
          jit_optimization_count?: number | null;
          jit_optimization_time?: number | null;
          jit_emission_count?: number | null;
          jit_emission_time?: number | null;
        };
        Relationships: [];
      };
      pg_stat_statements_info: {
        Row: {
          dealloc: number | null;
          stats_reset: string | null;
        };
        Insert: {
          dealloc?: number | null;
          stats_reset?: string | null;
        };
        Update: {
          dealloc?: number | null;
          stats_reset?: string | null;
        };
        Relationships: [];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent: string | null;
          locale: "fr" | "en" | null;
          created_at: string | null;
          last_seen_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          user_agent?: string | null;
          locale?: "fr" | "en" | null;
          created_at?: string | null;
          last_seen_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          user_agent?: string | null;
          locale?: "fr" | "en" | null;
          created_at?: string | null;
          last_seen_at?: string | null;
        };
        Relationships: [];
      };
      staging_bursaries: {
        Row: {
          id: string;
          name: string;
          source_org: string;
          cegep_id: string | null;
          category: "financial_need" | "academic_merit" | "athletics" | "arts_culture" | "community_engagement" | "perseverance" | "program_specific" | "mobility" | "event_based" | "other";
          amount_min: number | null;
          amount_max: number | null;
          deadline_type: "fixed_date" | "recurring_annual" | "rolling";
          deadline_date: string | null;
          application_url: string | null;
          description: string | null;
          eligible_cegep_programs: string[] | null;
          eligible_university_programs: string[] | null;
          min_r_score: number | null;
          min_session: number | null;
          requires_essay: boolean | null;
          requires_recommendation: boolean | null;
          tag_criteria: string[] | null;
          last_verified_at: string;
          created_at: string | null;
          raw_snapshot_path: string | null;
          collected_at: string;
          collector_name: string;
          diff_summary: Json | null;
          review_status: "pending" | "flagged" | "approved" | "rejected";
          promoted_at: string | null;
          promoted_by: string | null;
          catalog_slug: string | null;
          eligible_cegep_program_codes: string[] | null;
          deadline_precision: string | null;
          source_url: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          source_org: string;
          cegep_id?: string | null;
          category: "financial_need" | "academic_merit" | "athletics" | "arts_culture" | "community_engagement" | "perseverance" | "program_specific" | "mobility" | "event_based" | "other";
          amount_min?: number | null;
          amount_max?: number | null;
          deadline_type: "fixed_date" | "recurring_annual" | "rolling";
          deadline_date?: string | null;
          application_url?: string | null;
          description?: string | null;
          eligible_cegep_programs?: string[] | null;
          eligible_university_programs?: string[] | null;
          min_r_score?: number | null;
          min_session?: number | null;
          requires_essay?: boolean | null;
          requires_recommendation?: boolean | null;
          tag_criteria?: string[] | null;
          last_verified_at: string;
          created_at?: string | null;
          raw_snapshot_path?: string | null;
          collected_at?: string;
          collector_name: string;
          diff_summary?: Json | null;
          review_status?: "pending" | "flagged" | "approved" | "rejected";
          promoted_at?: string | null;
          promoted_by?: string | null;
          catalog_slug?: string | null;
          eligible_cegep_program_codes?: string[] | null;
          deadline_precision?: string | null;
          source_url?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          source_org?: string;
          cegep_id?: string | null;
          category?: "financial_need" | "academic_merit" | "athletics" | "arts_culture" | "community_engagement" | "perseverance" | "program_specific" | "mobility" | "event_based" | "other";
          amount_min?: number | null;
          amount_max?: number | null;
          deadline_type?: "fixed_date" | "recurring_annual" | "rolling";
          deadline_date?: string | null;
          application_url?: string | null;
          description?: string | null;
          eligible_cegep_programs?: string[] | null;
          eligible_university_programs?: string[] | null;
          min_r_score?: number | null;
          min_session?: number | null;
          requires_essay?: boolean | null;
          requires_recommendation?: boolean | null;
          tag_criteria?: string[] | null;
          last_verified_at?: string;
          created_at?: string | null;
          raw_snapshot_path?: string | null;
          collected_at?: string;
          collector_name?: string;
          diff_summary?: Json | null;
          review_status?: "pending" | "flagged" | "approved" | "rejected";
          promoted_at?: string | null;
          promoted_by?: string | null;
          catalog_slug?: string | null;
          eligible_cegep_program_codes?: string[] | null;
          deadline_precision?: string | null;
          source_url?: string | null;
        };
        Relationships: [];
      };
      staging_cegep_programs: {
        Row: {
          id: string;
          cegep_id: string | null;
          program_code: string | null;
          name: string;
          type: "pre_university" | "technical" | "special";
          created_at: string | null;
          raw_snapshot_path: string | null;
          collected_at: string;
          collector_name: string;
          diff_summary: Json | null;
          review_status: "pending" | "flagged" | "approved" | "rejected";
          promoted_at: string | null;
          promoted_by: string | null;
        };
        Insert: {
          id?: string;
          cegep_id?: string | null;
          program_code?: string | null;
          name: string;
          type: "pre_university" | "technical" | "special";
          created_at?: string | null;
          raw_snapshot_path?: string | null;
          collected_at?: string;
          collector_name: string;
          diff_summary?: Json | null;
          review_status?: "pending" | "flagged" | "approved" | "rejected";
          promoted_at?: string | null;
          promoted_by?: string | null;
        };
        Update: {
          id?: string;
          cegep_id?: string | null;
          program_code?: string | null;
          name?: string;
          type?: "pre_university" | "technical" | "special";
          created_at?: string | null;
          raw_snapshot_path?: string | null;
          collected_at?: string;
          collector_name?: string;
          diff_summary?: Json | null;
          review_status?: "pending" | "flagged" | "approved" | "rejected";
          promoted_at?: string | null;
          promoted_by?: string | null;
        };
        Relationships: [];
      };
      staging_courses: {
        Row: {
          id: string;
          course_code: string;
          discipline_code: string | null;
          name: string;
          name_en: string | null;
          weighting: number | null;
          created_at: string | null;
          raw_snapshot_path: string | null;
          collected_at: string;
          collector_name: string;
          diff_summary: Json | null;
          review_status: "pending" | "flagged" | "approved" | "rejected";
          promoted_at: string | null;
          promoted_by: string | null;
        };
        Insert: {
          id?: string;
          course_code: string;
          discipline_code?: string | null;
          name: string;
          name_en?: string | null;
          weighting?: number | null;
          created_at?: string | null;
          raw_snapshot_path?: string | null;
          collected_at?: string;
          collector_name: string;
          diff_summary?: Json | null;
          review_status?: "pending" | "flagged" | "approved" | "rejected";
          promoted_at?: string | null;
          promoted_by?: string | null;
        };
        Update: {
          id?: string;
          course_code?: string;
          discipline_code?: string | null;
          name?: string;
          name_en?: string | null;
          weighting?: number | null;
          created_at?: string | null;
          raw_snapshot_path?: string | null;
          collected_at?: string;
          collector_name?: string;
          diff_summary?: Json | null;
          review_status?: "pending" | "flagged" | "approved" | "rejected";
          promoted_at?: string | null;
          promoted_by?: string | null;
        };
        Relationships: [];
      };
      staging_cutoff_history: {
        Row: {
          id: string;
          university_program_id: string | null;
          admission_year: number;
          cutoff: number;
          figure_type: "last_admitted" | "minimum_required" | "maximum" | "average" | "range_low" | "range_high";
          source_tier: "university_official" | "cegep_compiled";
          source_url: string;
          source_type: "official_pdf" | "cegep_published" | "bci" | "other";
          verified_at: string;
          raw_snapshot_path: string | null;
          collected_at: string;
          collector_name: string;
          diff_summary: Json | null;
          review_status: "pending" | "flagged" | "approved" | "rejected";
          promoted_at: string | null;
          promoted_by: string | null;
        };
        Insert: {
          id?: string;
          university_program_id?: string | null;
          admission_year: number;
          cutoff: number;
          figure_type: "last_admitted" | "minimum_required" | "maximum" | "average" | "range_low" | "range_high";
          source_tier: "university_official" | "cegep_compiled";
          source_url: string;
          source_type: "official_pdf" | "cegep_published" | "bci" | "other";
          verified_at: string;
          raw_snapshot_path?: string | null;
          collected_at?: string;
          collector_name: string;
          diff_summary?: Json | null;
          review_status?: "pending" | "flagged" | "approved" | "rejected";
          promoted_at?: string | null;
          promoted_by?: string | null;
        };
        Update: {
          id?: string;
          university_program_id?: string | null;
          admission_year?: number;
          cutoff?: number;
          figure_type?: "last_admitted" | "minimum_required" | "maximum" | "average" | "range_low" | "range_high";
          source_tier?: "university_official" | "cegep_compiled";
          source_url?: string;
          source_type?: "official_pdf" | "cegep_published" | "bci" | "other";
          verified_at?: string;
          raw_snapshot_path?: string | null;
          collected_at?: string;
          collector_name?: string;
          diff_summary?: Json | null;
          review_status?: "pending" | "flagged" | "approved" | "rejected";
          promoted_at?: string | null;
          promoted_by?: string | null;
        };
        Relationships: [];
      };
      staging_deadlines: {
        Row: {
          id: string;
          type: "sracq_round" | "sram_round" | "afe_deadline" | "withdrawal_no_penalty" | "university_admission" | "test" | "bursary" | "other";
          title: string;
          date: string;
          applies_to_cegep_id: string | null;
          source_url: string;
          last_verified_at: string;
          raw_snapshot_path: string | null;
          collected_at: string;
          collector_name: string;
          diff_summary: Json | null;
          review_status: "pending" | "flagged" | "approved" | "rejected";
          promoted_at: string | null;
          promoted_by: string | null;
          catalog_slug: string | null;
          title_en: string | null;
          detail: string | null;
          detail_en: string | null;
          program_slugs: string[] | null;
          category: string | null;
        };
        Insert: {
          id?: string;
          type: "sracq_round" | "sram_round" | "afe_deadline" | "withdrawal_no_penalty" | "university_admission" | "test" | "bursary" | "other";
          title: string;
          date: string;
          applies_to_cegep_id?: string | null;
          source_url: string;
          last_verified_at: string;
          raw_snapshot_path?: string | null;
          collected_at?: string;
          collector_name: string;
          diff_summary?: Json | null;
          review_status?: "pending" | "flagged" | "approved" | "rejected";
          promoted_at?: string | null;
          promoted_by?: string | null;
          catalog_slug?: string | null;
          title_en?: string | null;
          detail?: string | null;
          detail_en?: string | null;
          program_slugs?: string[] | null;
          category?: string | null;
        };
        Update: {
          id?: string;
          type?: "sracq_round" | "sram_round" | "afe_deadline" | "withdrawal_no_penalty" | "university_admission" | "test" | "bursary" | "other";
          title?: string;
          date?: string;
          applies_to_cegep_id?: string | null;
          source_url?: string;
          last_verified_at?: string;
          raw_snapshot_path?: string | null;
          collected_at?: string;
          collector_name?: string;
          diff_summary?: Json | null;
          review_status?: "pending" | "flagged" | "approved" | "rejected";
          promoted_at?: string | null;
          promoted_by?: string | null;
          catalog_slug?: string | null;
          title_en?: string | null;
          detail?: string | null;
          detail_en?: string | null;
          program_slugs?: string[] | null;
          category?: string | null;
        };
        Relationships: [];
      };
      staging_university_program_grade_floors: {
        Row: {
          id: string;
          university_program_id: string | null;
          course_id: string | null;
          min_grade: number;
          floor_type: "course_cote_r_floor" | "course_percentage_floor";
          source_url: string;
          notes: string | null;
          raw_snapshot_path: string | null;
          collected_at: string;
          collector_name: string;
          diff_summary: Json | null;
          review_status: "pending" | "flagged" | "approved" | "rejected";
          promoted_at: string | null;
          promoted_by: string | null;
        };
        Insert: {
          id?: string;
          university_program_id?: string | null;
          course_id?: string | null;
          min_grade: number;
          floor_type: "course_cote_r_floor" | "course_percentage_floor";
          source_url: string;
          notes?: string | null;
          raw_snapshot_path?: string | null;
          collected_at?: string;
          collector_name: string;
          diff_summary?: Json | null;
          review_status?: "pending" | "flagged" | "approved" | "rejected";
          promoted_at?: string | null;
          promoted_by?: string | null;
        };
        Update: {
          id?: string;
          university_program_id?: string | null;
          course_id?: string | null;
          min_grade?: number;
          floor_type?: "course_cote_r_floor" | "course_percentage_floor";
          source_url?: string;
          notes?: string | null;
          raw_snapshot_path?: string | null;
          collected_at?: string;
          collector_name?: string;
          diff_summary?: Json | null;
          review_status?: "pending" | "flagged" | "approved" | "rejected";
          promoted_at?: string | null;
          promoted_by?: string | null;
        };
        Relationships: [];
      };
      staging_university_program_prerequisites: {
        Row: {
          id: string;
          university_program_id: string | null;
          course_id: string | null;
          required: boolean | null;
          raw_snapshot_path: string | null;
          collected_at: string;
          collector_name: string;
          diff_summary: Json | null;
          review_status: "pending" | "flagged" | "approved" | "rejected";
          promoted_at: string | null;
          promoted_by: string | null;
        };
        Insert: {
          id?: string;
          university_program_id?: string | null;
          course_id?: string | null;
          required?: boolean | null;
          raw_snapshot_path?: string | null;
          collected_at?: string;
          collector_name: string;
          diff_summary?: Json | null;
          review_status?: "pending" | "flagged" | "approved" | "rejected";
          promoted_at?: string | null;
          promoted_by?: string | null;
        };
        Update: {
          id?: string;
          university_program_id?: string | null;
          course_id?: string | null;
          required?: boolean | null;
          raw_snapshot_path?: string | null;
          collected_at?: string;
          collector_name?: string;
          diff_summary?: Json | null;
          review_status?: "pending" | "flagged" | "approved" | "rejected";
          promoted_at?: string | null;
          promoted_by?: string | null;
        };
        Relationships: [];
      };
      staging_university_programs: {
        Row: {
          id: string;
          university_id: string | null;
          name: string;
          degree_type: string | null;
          admission_type: "r_score_only" | "r_score_plus_interview" | "r_score_plus_portfolio" | "r_score_plus_test" | "other";
          source_url: string;
          last_verified_at: string;
          created_at: string | null;
          raw_snapshot_path: string | null;
          collected_at: string;
          collector_name: string;
          diff_summary: Json | null;
          review_status: "pending" | "flagged" | "approved" | "rejected";
          promoted_at: string | null;
          promoted_by: string | null;
        };
        Insert: {
          id?: string;
          university_id?: string | null;
          name: string;
          degree_type?: string | null;
          admission_type: "r_score_only" | "r_score_plus_interview" | "r_score_plus_portfolio" | "r_score_plus_test" | "other";
          source_url: string;
          last_verified_at: string;
          created_at?: string | null;
          raw_snapshot_path?: string | null;
          collected_at?: string;
          collector_name: string;
          diff_summary?: Json | null;
          review_status?: "pending" | "flagged" | "approved" | "rejected";
          promoted_at?: string | null;
          promoted_by?: string | null;
        };
        Update: {
          id?: string;
          university_id?: string | null;
          name?: string;
          degree_type?: string | null;
          admission_type?: "r_score_only" | "r_score_plus_interview" | "r_score_plus_portfolio" | "r_score_plus_test" | "other";
          source_url?: string;
          last_verified_at?: string;
          created_at?: string | null;
          raw_snapshot_path?: string | null;
          collected_at?: string;
          collector_name?: string;
          diff_summary?: Json | null;
          review_status?: "pending" | "flagged" | "approved" | "rejected";
          promoted_at?: string | null;
          promoted_by?: string | null;
        };
        Relationships: [];
      };
      student_course_grades: {
        Row: {
          id: string;
          user_id: string;
          session: number;
          course_id: string | null;
          course_name_freetext: string | null;
          grade: number | null;
          cote_z: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          session: number;
          course_id?: string | null;
          course_name_freetext?: string | null;
          grade?: number | null;
          cote_z?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          session?: number;
          course_id?: string | null;
          course_name_freetext?: string | null;
          grade?: number | null;
          cote_z?: number | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      student_profiles: {
        Row: {
          user_id: string;
          cegep_id: string | null;
          cegep_program_id: string | null;
          current_session: number | null;
          self_tags: string[] | null;
          created_at: string | null;
          updated_at: string | null;
          cegep_short_code: string | null;
          cegep_program_code: string | null;
          r_score_status: "confirmed" | "estimated" | null;
          interest_ids: string[];
          dec_profile_id: string | null;
          goal_skipped: boolean;
          estimated_cote_r: number | null;
        };
        Insert: {
          user_id: string;
          cegep_id?: string | null;
          cegep_program_id?: string | null;
          current_session?: number | null;
          self_tags?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
          cegep_short_code?: string | null;
          cegep_program_code?: string | null;
          r_score_status?: "confirmed" | "estimated" | null;
          interest_ids?: string[];
          dec_profile_id?: string | null;
          goal_skipped?: boolean;
          estimated_cote_r?: number | null;
        };
        Update: {
          user_id?: string;
          cegep_id?: string | null;
          cegep_program_id?: string | null;
          current_session?: number | null;
          self_tags?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
          cegep_short_code?: string | null;
          cegep_program_code?: string | null;
          r_score_status?: "confirmed" | "estimated" | null;
          interest_ids?: string[];
          dec_profile_id?: string | null;
          goal_skipped?: boolean;
          estimated_cote_r?: number | null;
        };
        Relationships: [];
      };
      student_r_score_confirmations: {
        Row: {
          id: string;
          user_id: string;
          session: number;
          official_cote_r: number;
          confirmed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          session: number;
          official_cote_r: number;
          confirmed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          session?: number;
          official_cote_r?: number;
          confirmed_at?: string | null;
        };
        Relationships: [];
      };
      student_targets: {
        Row: {
          id: string;
          user_id: string;
          university_program_id: string | null;
          notes: string | null;
          created_at: string | null;
          catalog_slug: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          university_program_id?: string | null;
          notes?: string | null;
          created_at?: string | null;
          catalog_slug?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          university_program_id?: string | null;
          notes?: string | null;
          created_at?: string | null;
          catalog_slug?: string | null;
        };
        Relationships: [];
      };
      universities: {
        Row: {
          id: string;
          name: string;
          short_code: string;
          website_url: string | null;
          bci_member: boolean | null;
        };
        Insert: {
          id?: string;
          name: string;
          short_code: string;
          website_url?: string | null;
          bci_member?: boolean | null;
        };
        Update: {
          id?: string;
          name?: string;
          short_code?: string;
          website_url?: string | null;
          bci_member?: boolean | null;
        };
        Relationships: [];
      };
      university_program_grade_floors: {
        Row: {
          id: string;
          university_program_id: string;
          course_id: string;
          min_grade: number;
          floor_type: "course_cote_r_floor" | "course_percentage_floor";
          source_url: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          university_program_id: string;
          course_id: string;
          min_grade: number;
          floor_type: "course_cote_r_floor" | "course_percentage_floor";
          source_url: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          university_program_id?: string;
          course_id?: string;
          min_grade?: number;
          floor_type?: "course_cote_r_floor" | "course_percentage_floor";
          source_url?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      university_program_prerequisites: {
        Row: {
          id: string;
          university_program_id: string;
          course_id: string;
          required: boolean | null;
        };
        Insert: {
          id?: string;
          university_program_id: string;
          course_id: string;
          required?: boolean | null;
        };
        Update: {
          id?: string;
          university_program_id?: string;
          course_id?: string;
          required?: boolean | null;
        };
        Relationships: [];
      };
      university_programs: {
        Row: {
          id: string;
          university_id: string;
          name: string;
          degree_type: string | null;
          admission_type: "r_score_only" | "r_score_plus_interview" | "r_score_plus_portfolio" | "r_score_plus_test" | "other";
          source_url: string;
          last_verified_at: string;
          created_at: string | null;
          catalog_slug: string | null;
        };
        Insert: {
          id?: string;
          university_id: string;
          name: string;
          degree_type?: string | null;
          admission_type: "r_score_only" | "r_score_plus_interview" | "r_score_plus_portfolio" | "r_score_plus_test" | "other";
          source_url: string;
          last_verified_at: string;
          created_at?: string | null;
          catalog_slug?: string | null;
        };
        Update: {
          id?: string;
          university_id?: string;
          name?: string;
          degree_type?: string | null;
          admission_type?: "r_score_only" | "r_score_plus_interview" | "r_score_plus_portfolio" | "r_score_plus_test" | "other";
          source_url?: string;
          last_verified_at?: string;
          created_at?: string | null;
          catalog_slug?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
