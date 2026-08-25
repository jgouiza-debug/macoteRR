import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import type { StudentProfile } from "./store";

/**
 * Pushes the local onboarding profile up to the authenticated user's row once a session
 * exists.
 *
 * `cegep_id` / `cegep_program_id` / `student_targets.university_program_id` are real foreign
 * keys into tables the app cannot assume are populated — the catalogue seed
 * (supabase/seed/catalog.sql) is applied by hand, and onboarding has to work before it is.
 * Rather than guess at a foreign key, this writes the natural keys the client actually knows:
 * the cégep short code, the ministerial DEC code, and the university program id. The
 * 20260825120000 migration adds those columns plus triggers that resolve them to the uuid FKs
 * the moment matching catalogue rows exist, so a profile saved against an empty catalogue
 * back-fills itself later instead of being lost.
 */
export async function syncProfileToServer(
  supabase: SupabaseClient<Database>,
  userId: string,
  profile: StudentProfile,
) {
  await supabase.from("student_profiles").upsert(
    {
      user_id: userId,
      self_tags: profile.selfTags,
      current_session: profile.currentSession,
      cegep_short_code: profile.cegepId,
      cegep_program_code: profile.cegepProgramId,
      r_score_status: profile.rScoreStatus,
    },
    { onConflict: "user_id" },
  );

  // A confirmed score is the student's own official number, so it belongs in the
  // confirmations table. An estimate deliberately does not: writing it there would let a
  // guess masquerade as an official figure later (guardrail #2).
  if (profile.rScoreStatus === "confirmed" && profile.rScore !== null && profile.currentSession !== null) {
    await supabase.from("student_r_score_confirmations").upsert(
      {
        user_id: userId,
        session: profile.currentSession,
        official_cote_r: profile.rScore,
      },
      { onConflict: "user_id,session" },
    );
  }

  if (profile.targetUniversityProgramIds.length > 0) {
    await supabase.from("student_targets").upsert(
      profile.targetUniversityProgramIds.map((slug) => ({ user_id: userId, catalog_slug: slug })),
      { onConflict: "user_id,catalog_slug" },
    );
  }
}
