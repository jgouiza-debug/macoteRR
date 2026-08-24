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
export type CegepProgramType = "pre_university" | "technical";
export type AdmissionType =
  | "r_score_only"
  | "r_score_plus_interview"
  | "r_score_plus_portfolio"
  | "r_score_plus_test"
  | "other";
export type GradeFloorType = "course_cote_r_floor" | "course_percentage_floor";
export type CutoffSourceType = "official_pdf" | "cegep_published" | "bci" | "other";
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
export type DeadlineType =
  | "sracq_round"
  | "sram_round"
  | "afe_deadline"
  | "withdrawal_no_penalty"
  | "other";
export type ReviewStatus = "pending" | "flagged" | "approved" | "rejected";

export type Database = {
  public: {
    Tables: {
      cegeps: {
        Row: {
          id: string;
          name: string;
          short_code: string;
          sector: CegepSector;
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
          sector: CegepSector;
          region?: string;
          website_url?: string | null;
          admission_service?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["cegeps"]["Insert"]>;
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
        Update: Partial<Database["public"]["Tables"]["universities"]["Insert"]>;
        Relationships: [];
      };
      cegep_programs: {
        Row: {
          id: string;
          cegep_id: string;
          program_code: string | null;
          name: string;
          type: CegepProgramType;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          cegep_id: string;
          program_code?: string | null;
          name: string;
          type: CegepProgramType;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["cegep_programs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "cegep_programs_cegep_id_fkey";
            columns: ["cegep_id"];
            referencedRelation: "cegeps";
            referencedColumns: ["id"];
          },
        ];
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
        Update: Partial<Database["public"]["Tables"]["courses"]["Insert"]>;
        Relationships: [];
      };
      university_programs: {
        Row: {
          id: string;
          university_id: string;
          name: string;
          degree_type: string | null;
          overall_cutoff: number | null;
          admission_type: AdmissionType;
          source_url: string;
          last_verified_at: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          university_id: string;
          name: string;
          degree_type?: string | null;
          overall_cutoff?: number | null;
          admission_type: AdmissionType;
          source_url: string;
          last_verified_at: string;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["university_programs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "university_programs_university_id_fkey";
            columns: ["university_id"];
            referencedRelation: "universities";
            referencedColumns: ["id"];
          },
        ];
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
        Update: Partial<
          Database["public"]["Tables"]["university_program_prerequisites"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "university_program_prerequisites_university_program_id_fkey";
            columns: ["university_program_id"];
            referencedRelation: "university_programs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "university_program_prerequisites_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      university_program_grade_floors: {
        Row: {
          id: string;
          university_program_id: string;
          course_id: string;
          min_grade: number;
          floor_type: GradeFloorType;
          source_url: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          university_program_id: string;
          course_id: string;
          min_grade: number;
          floor_type: GradeFloorType;
          source_url: string;
          notes?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["university_program_grade_floors"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "university_program_grade_floors_university_program_id_fkey";
            columns: ["university_program_id"];
            referencedRelation: "university_programs";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "university_program_grade_floors_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
      };
      cutoff_history: {
        Row: {
          id: string;
          university_program_id: string;
          admission_year: number;
          cote_r_last_admitted: number | null;
          source_url: string;
          source_type: CutoffSourceType;
          verified_at: string;
        };
        Insert: {
          id?: string;
          university_program_id: string;
          admission_year: number;
          cote_r_last_admitted?: number | null;
          source_url: string;
          source_type: CutoffSourceType;
          verified_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["cutoff_history"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "cutoff_history_university_program_id_fkey";
            columns: ["university_program_id"];
            referencedRelation: "university_programs";
            referencedColumns: ["id"];
          },
        ];
      };
      bursaries: {
        Row: {
          id: string;
          name: string;
          source_org: string;
          cegep_id: string | null;
          category: BursaryCategory;
          amount_min: number | null;
          amount_max: number | null;
          deadline_type: BursaryDeadlineType;
          deadline_date: string | null;
          application_url: string;
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
        };
        Insert: {
          id?: string;
          name: string;
          source_org: string;
          cegep_id?: string | null;
          category: BursaryCategory;
          amount_min?: number | null;
          amount_max?: number | null;
          deadline_type: BursaryDeadlineType;
          deadline_date?: string | null;
          application_url: string;
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
        };
        Update: Partial<Database["public"]["Tables"]["bursaries"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "bursaries_cegep_id_fkey";
            columns: ["cegep_id"];
            referencedRelation: "cegeps";
            referencedColumns: ["id"];
          },
        ];
      };
      deadlines: {
        Row: {
          id: string;
          type: DeadlineType;
          title: string;
          date: string;
          applies_to_cegep_id: string | null;
          source_url: string;
          last_verified_at: string;
        };
        Insert: {
          id?: string;
          type: DeadlineType;
          title: string;
          date: string;
          applies_to_cegep_id?: string | null;
          source_url: string;
          last_verified_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["deadlines"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "deadlines_applies_to_cegep_id_fkey";
            columns: ["applies_to_cegep_id"];
            referencedRelation: "cegeps";
            referencedColumns: ["id"];
          },
        ];
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
        };
        Insert: {
          user_id: string;
          cegep_id?: string | null;
          cegep_program_id?: string | null;
          current_session?: number | null;
          self_tags?: string[] | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["student_profiles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "student_profiles_cegep_id_fkey";
            columns: ["cegep_id"];
            referencedRelation: "cegeps";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "student_profiles_cegep_program_id_fkey";
            columns: ["cegep_program_id"];
            referencedRelation: "cegep_programs";
            referencedColumns: ["id"];
          },
        ];
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
        Update: Partial<Database["public"]["Tables"]["student_course_grades"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "student_course_grades_course_id_fkey";
            columns: ["course_id"];
            referencedRelation: "courses";
            referencedColumns: ["id"];
          },
        ];
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
        Update: Partial<
          Database["public"]["Tables"]["student_r_score_confirmations"]["Insert"]
        >;
        Relationships: [];
      };
      student_targets: {
        Row: {
          id: string;
          user_id: string;
          university_program_id: string;
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          university_program_id: string;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["student_targets"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "student_targets_university_program_id_fkey";
            columns: ["university_program_id"];
            referencedRelation: "university_programs";
            referencedColumns: ["id"];
          },
        ];
      };
      // Staging mirrors (see docs/02-scraping-collection-plan.md's pipeline architecture).
      // One per scraped/compiled production table in clusters 2-5; not defined by name in
      // docs/01-data-architecture.md but named this way in docs/02-scraping-collection-plan.md
      // itself ("staging_university_programs", "staging_bursaries"). Same business columns as
      // the production counterpart, relaxed (nullable FKs, no unique constraints), plus shared
      // pipeline metadata columns.
      staging_cegep_programs: StagingTable<{
        cegep_id: string | null;
        program_code: string | null;
        name: string;
        type: CegepProgramType;
        created_at: string | null;
      }>;
      staging_courses: StagingTable<{
        course_code: string;
        discipline_code: string | null;
        name: string;
        name_en: string | null;
        weighting: number | null;
        created_at: string | null;
      }>;
      staging_university_programs: StagingTable<{
        university_id: string | null;
        name: string;
        degree_type: string | null;
        overall_cutoff: number | null;
        admission_type: AdmissionType;
        source_url: string;
        last_verified_at: string;
        created_at: string | null;
      }>;
      staging_university_program_prerequisites: StagingTable<{
        university_program_id: string | null;
        course_id: string | null;
        required: boolean | null;
      }>;
      staging_university_program_grade_floors: StagingTable<{
        university_program_id: string | null;
        course_id: string | null;
        min_grade: number;
        floor_type: GradeFloorType;
        source_url: string;
        notes: string | null;
      }>;
      staging_cutoff_history: StagingTable<{
        university_program_id: string | null;
        admission_year: number;
        cote_r_last_admitted: number | null;
        source_url: string;
        source_type: CutoffSourceType;
        verified_at: string;
      }>;
      staging_bursaries: StagingTable<{
        name: string;
        source_org: string;
        cegep_id: string | null;
        category: BursaryCategory;
        amount_min: number | null;
        amount_max: number | null;
        deadline_type: BursaryDeadlineType;
        deadline_date: string | null;
        application_url: string;
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
      }>;
      staging_deadlines: StagingTable<{
        type: DeadlineType;
        title: string;
        date: string;
        applies_to_cegep_id: string | null;
        source_url: string;
        last_verified_at: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

/** Pipeline metadata shared by every staging_* table (see docs/02-scraping-collection-plan.md). */
type StagingPipelineColumns = {
  id: string;
  raw_snapshot_path: string | null;
  collected_at: string;
  collector_name: string;
  diff_summary: Json | null;
  review_status: ReviewStatus;
  promoted_at: string | null;
  promoted_by: string | null;
};

// Keeps a Business column required in Insert unless its Row type is nullable — mirrors the
// SQL, where every staging business column is either `not null` (no default) or nullable, never
// defaulted. Without this split, a staging Insert would accept a missing required column (e.g.
// staging_bursaries.name) and only fail at runtime against Postgres's NOT NULL constraint.
type NullableKeys<T> = { [K in keyof T]: null extends T[K] ? K : never }[keyof T];
type RequiredKeys<T> = { [K in keyof T]: null extends T[K] ? never : K }[keyof T];
type BusinessInsert<T> = Partial<Pick<T, NullableKeys<T>>> & Required<Pick<T, RequiredKeys<T>>>;

/** Builds a staging table's {Row, Insert, Update, Relationships} from its relaxed business columns. */
type StagingTable<Business extends Record<string, unknown>> = {
  Row: StagingPipelineColumns & Business;
  Insert: Partial<StagingPipelineColumns> & BusinessInsert<Business>;
  Update: Partial<StagingPipelineColumns & Business>;
  Relationships: [];
};
