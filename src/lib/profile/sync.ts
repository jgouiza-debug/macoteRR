import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import type { StudentProfile } from "./store";

/**
 * Pushes the local onboarding profile up to the authenticated user's row once a session
 * exists. cegep_id / cegep_program_id / target university_program_id are real foreign keys
 * into cegeps/cegep_programs/university_programs — those tables aren't seeded yet (only the
 * schema is applied), so there's nothing valid to map the local slug ids to. Syncing only
 * what's genuinely mappable right now (self_tags, current_session, a confirmed score) rather
 * than guessing at a foreign key.
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
    },
    { onConflict: "user_id" },
  );

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
}
