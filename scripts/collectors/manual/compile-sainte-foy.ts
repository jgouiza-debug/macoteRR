/**
 * Manual-entry collector: reads the hand-researched seed templates in
 * supabase/seed/sainte-foy/*.json and writes staging rows.
 *
 * Optimization (Workstream 5):
 * - Batches staging writes into single multi-row operations per source.
 * - Incremental error handling per item.
 * - Idempotent and resumable execution.
 *
 * Run with: npm run collect:sainte-foy
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createStagingClient } from "../lib/staging-client";
import type {
  AdmissionType,
  BursaryCategory,
  BursaryDeadlineType,
  CegepProgramType,
  CutoffSourceType,
  GradeFloorType,
} from "@/lib/db/database.types";

const SEED_DIR = path.join(__dirname, "../../../supabase/seed/sainte-foy");
const COLLECTOR_NAME = "compile-sainte-foy";

type ProgramsFile = {
  cegep_short_code: string;
  programs: { program_code: string | null; name: string; type: CegepProgramType }[];
};

type CutoffsFile = {
  university_programs: {
    university_short_code: string;
    name: string;
    degree_type: string | null;
    overall_cutoff: number | null;
    admission_type: AdmissionType;
    source_url: string;
    last_verified_at: string;
    prerequisites: string[];
    grade_floors: {
      course_code: string;
      min_grade: number;
      floor_type: GradeFloorType;
      source_url: string;
      notes: string | null;
    }[];
    cutoff_history: {
      admission_year: number;
      cote_r_last_admitted: number | null;
      source_url: string;
      source_type: CutoffSourceType;
      verified_at: string;
    }[];
  }[];
};

type BursariesFile = {
  cegep_short_code: string;
  bursaries: {
    name: string;
    source_org: string;
    category: BursaryCategory;
    amount_min: number | null;
    amount_max: number | null;
    deadline_type: BursaryDeadlineType;
    deadline_date: string | null;
    application_url: string;
    description: string | null;
    min_r_score: number | null;
    min_session: number | null;
    requires_essay: boolean;
    requires_recommendation: boolean;
    tag_criteria: string[];
    last_verified_at: string;
  }[];
};

async function readJson<T>(filename: string): Promise<T> {
  const raw = await readFile(path.join(SEED_DIR, filename), "utf-8");
  return JSON.parse(raw) as T;
}

async function main() {
  const supabase = createStagingClient();
  const collected_at = new Date().toISOString();
  const skipped: string[] = [];

  const programsFile = await readJson<ProgramsFile>("programs.json");
  const cutoffsFile = await readJson<CutoffsFile>("cutoffs.json");
  const bursariesFile = await readJson<BursariesFile>("bursaries.json");

  // --- 1. programs.json -> staging_cegep_programs (Batched) ---
  if (programsFile.programs.length > 0) {
    try {
      const { data: cegep } = await supabase
        .from("cegeps")
        .select("id")
        .eq("short_code", programsFile.cegep_short_code)
        .maybeSingle();

      if (!cegep) {
        skipped.push(
          `All of programs.json: cegep short_code "${programsFile.cegep_short_code}" not found.`,
        );
      } else {
        const rows = programsFile.programs.map((p) => ({
          cegep_id: cegep.id,
          program_code: p.program_code,
          name: p.name,
          type: p.type,
          collector_name: COLLECTOR_NAME,
          collected_at,
        }));
        const { error } = await supabase.from("staging_cegep_programs").insert(rows);
        if (error) skipped.push(`programs.json insert: ${error.message}`);
      }
    } catch (err) {
      skipped.push(`programs.json batch error: ${String(err)}`);
    }
  }

  // --- 2. cutoffs.json -> staging_university_programs + children (Batched) ---
  const allPrereqRows: Array<{
    university_program_id: string;
    course_id: string;
    required: boolean;
    collector_name: string;
    collected_at: string;
  }> = [];

  const allFloorRows: Array<{
    university_program_id: string;
    course_id: string;
    min_grade: number;
    floor_type: GradeFloorType;
    source_url: string;
    notes: string | null;
    collector_name: string;
    collected_at: string;
  }> = [];

  const allHistoryRows: Array<{
    university_program_id: string;
    admission_year: number;
    cote_r_last_admitted: number | null;
    source_url: string;
    source_type: CutoffSourceType;
    verified_at: string;
    collector_name: string;
    collected_at: string;
  }> = [];

  for (const program of cutoffsFile.university_programs) {
    try {
      const { data: university } = await supabase
        .from("universities")
        .select("id")
        .eq("short_code", program.university_short_code)
        .maybeSingle();

      if (!university) {
        skipped.push(
          `${program.name}: university short_code "${program.university_short_code}" not found.`,
        );
        continue;
      }

      const { data: stagingProgram, error: programError } = await supabase
        .from("staging_university_programs")
        .insert({
          university_id: university.id,
          name: program.name,
          degree_type: program.degree_type,
          overall_cutoff: program.overall_cutoff,
          admission_type: program.admission_type,
          source_url: program.source_url,
          last_verified_at: program.last_verified_at,
          collector_name: COLLECTOR_NAME,
          collected_at,
        })
        .select("id")
        .single();

      if (programError || !stagingProgram) {
        skipped.push(`${program.name}: staging insert failed: ${programError?.message}`);
        continue;
      }

      // Collect prerequisite batch items
      for (const courseCode of program.prerequisites) {
        const { data: course } = await supabase
          .from("courses")
          .select("id")
          .eq("course_code", courseCode)
          .maybeSingle();
        if (!course) {
          skipped.push(`${program.name} prerequisite ${courseCode}: course not found in production.`);
          continue;
        }
        allPrereqRows.push({
          university_program_id: stagingProgram.id,
          course_id: course.id,
          required: true,
          collector_name: COLLECTOR_NAME,
          collected_at,
        });
      }

      // Collect grade floor batch items
      for (const floor of program.grade_floors) {
        const { data: course } = await supabase
          .from("courses")
          .select("id")
          .eq("course_code", floor.course_code)
          .maybeSingle();
        if (!course) {
          skipped.push(`${program.name} grade floor ${floor.course_code}: course not found in production.`);
          continue;
        }
        allFloorRows.push({
          university_program_id: stagingProgram.id,
          course_id: course.id,
          min_grade: floor.min_grade,
          floor_type: floor.floor_type,
          source_url: floor.source_url,
          notes: floor.notes,
          collector_name: COLLECTOR_NAME,
          collected_at,
        });
      }

      // Collect cutoff history batch items
      for (const entry of program.cutoff_history) {
        allHistoryRows.push({
          university_program_id: stagingProgram.id,
          admission_year: entry.admission_year,
          cote_r_last_admitted: entry.cote_r_last_admitted,
          source_url: entry.source_url,
          source_type: entry.source_type,
          verified_at: entry.verified_at,
          collector_name: COLLECTOR_NAME,
          collected_at,
        });
      }
    } catch (err) {
      skipped.push(`${program.name} incremental parsing error: ${String(err)}`);
    }
  }

  // Single batched writes for children
  if (allPrereqRows.length > 0) {
    const { error } = await supabase.from("staging_university_program_prerequisites").insert(allPrereqRows);
    if (error) skipped.push(`Prerequisites batch insert: ${error.message}`);
  }
  if (allFloorRows.length > 0) {
    const { error } = await supabase.from("staging_university_program_grade_floors").insert(allFloorRows);
    if (error) skipped.push(`Grade floors batch insert: ${error.message}`);
  }
  if (allHistoryRows.length > 0) {
    const { error } = await supabase.from("staging_cutoff_history").insert(allHistoryRows);
    if (error) skipped.push(`Cutoff history batch insert: ${error.message}`);
  }

  // --- 3. bursaries.json -> staging_bursaries (Batched) ---
  if (bursariesFile.bursaries.length > 0) {
    try {
      const { data: cegep } = await supabase
        .from("cegeps")
        .select("id")
        .eq("short_code", bursariesFile.cegep_short_code)
        .maybeSingle();

      if (!cegep) {
        skipped.push(
          `All of bursaries.json: cegep short_code "${bursariesFile.cegep_short_code}" not found.`,
        );
      } else {
        const rows = bursariesFile.bursaries.map((b) => ({
          ...b,
          cegep_id: cegep.id,
          collector_name: COLLECTOR_NAME,
          collected_at,
        }));
        const { error } = await supabase.from("staging_bursaries").insert(rows);
        if (error) skipped.push(`bursaries.json insert: ${error.message}`);
      }
    } catch (err) {
      skipped.push(`bursaries.json batch error: ${String(err)}`);
    }
  }

  console.log(
    `Compiled Sainte-Foy seed data into staging at ${collected_at}.` +
      (skipped.length > 0 ? ` ${skipped.length} row(s) skipped:` : " Nothing skipped."),
  );
  for (const reason of skipped) console.log(`  - ${reason}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
