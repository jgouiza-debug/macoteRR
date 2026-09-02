import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import type { SelfTagId } from "@/lib/tags/taxonomy";
import type { InterestId } from "@/lib/tags/interests";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/notifications/types";
import type { StudentProfile } from "./store";

/**
 * The server side of the local-first profile: push what changed, pull what the server holds.
 *
 * `cegep_id` / `cegep_program_id` / `student_targets.university_program_id` are real foreign
 * keys into tables the app cannot assume are populated — the catalogue seed
 * (supabase/seed/catalog.sql) is applied by hand, and onboarding has to work before it is.
 * Rather than guess at a foreign key, this writes the natural keys the client actually knows:
 * the cégep short code, the ministerial DEC code, and the university program slug. The
 * 20260825120000 migration adds those columns plus triggers that resolve them to the uuid FKs
 * the moment matching catalogue rows exist, so a profile saved against an empty catalogue
 * back-fills itself later instead of being lost.
 */

type Client = SupabaseClient<Database>;
type ProfilesInsert = Database["public"]["Tables"]["student_profiles"]["Insert"];

/**
 * Columns added by supabase/migrations/20260902120000_*.sql. A project that has not run it
 * answers PGRST204 ("column … not found in schema cache") to any write naming them. The write
 * is retried without them so the rest of the profile still lands; the missing columns are
 * the only thing lost, and only until the migration runs.
 */
const NEW_PROFILE_COLUMNS = ["interest_ids", "dec_profile_id", "goal_skipped", "estimated_cote_r"] as const;

function isMissingColumnError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "PGRST204" || /column .* (does not exist|not found)/i.test(error.message ?? "");
}

function touches(patch: Partial<StudentProfile> | undefined, ...keys: (keyof StudentProfile)[]): boolean {
  if (!patch) return true;
  return keys.some((key) => key in patch);
}

/**
 * Pushes the local profile to the authenticated user's rows.
 *
 * `patch` limits the work to what actually changed (the outbox passes the merged patches it
 * is flushing); without it everything is written, which is what a first sign-in needs.
 * Throws on any failure so the outbox can count the attempt.
 */
export async function syncProfileToServer(
  supabase: Client,
  userId: string,
  profile: StudentProfile,
  patch?: Partial<StudentProfile>,
): Promise<void> {
  const row: ProfilesInsert = {
    user_id: userId,
    self_tags: profile.selfTags,
    current_session: profile.currentSession,
    cegep_short_code: profile.cegepId,
    cegep_program_code: profile.cegepProgramId,
    r_score_status: profile.rScoreStatus,
    interest_ids: profile.interestIds,
    dec_profile_id: profile.decProfileId,
    goal_skipped: profile.goalSkipped,
    // An estimate is the student's own guess and is stored in a column that says so. It never
    // enters student_r_score_confirmations, where a number reads as official (guardrail #2).
    estimated_cote_r: profile.rScoreStatus === "estimated" ? profile.rScore : null,
  };

  let { error } = await supabase.from("student_profiles").upsert(row, { onConflict: "user_id" });
  if (isMissingColumnError(error)) {
    const legacy = { ...row };
    for (const column of NEW_PROFILE_COLUMNS) delete legacy[column];
    ({ error } = await supabase.from("student_profiles").upsert(legacy, { onConflict: "user_id" }));
  }
  if (error) throw new Error(`student_profiles: ${error.message}`);

  // A confirmed score is the student's own official number, so it belongs in the
  // confirmations table, keyed by session. The session is always set by the time a score is
  // (every score path persists it), but a legacy profile may predate that: session 1 is the
  // honest default for a single confirmed number with no session attached.
  if (
    touches(patch, "rScore", "rScoreStatus", "currentSession") &&
    profile.rScoreStatus === "confirmed" &&
    profile.rScore !== null
  ) {
    const { error: confirmError } = await supabase.from("student_r_score_confirmations").upsert(
      {
        user_id: userId,
        session: profile.currentSession ?? 1,
        official_cote_r: profile.rScore,
      },
      { onConflict: "user_id,session" },
    );
    if (confirmError) throw new Error(`student_r_score_confirmations: ${confirmError.message}`);
  }

  if (touches(patch, "targetUniversityProgramIds")) {
    await syncTargets(supabase, userId, profile.targetUniversityProgramIds);
  }

  if (touches(patch, "notificationPrefs")) {
    const prefs = profile.notificationPrefs;
    const { error: prefsError } = await supabase.from("notification_preferences").upsert(
      {
        user_id: userId,
        deadline_reminders: prefs.deadlineReminders,
        cutoff_updates: prefs.cutoffUpdates,
        new_bursary_matches: prefs.newBursaryMatches,
        grade_window_reminders: prefs.gradeWindowReminders,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (prefsError) throw new Error(`notification_preferences: ${prefsError.message}`);
  }
}

/**
 * Targets are a set, so the server copy is diffed against the local one: removed slugs are
 * deleted, new ones inserted. The previous upsert-only version could add but never remove, so
 * a target dropped on the phone came straight back on the next page load.
 */
async function syncTargets(supabase: Client, userId: string, localSlugs: string[]): Promise<void> {
  const { data: rows, error } = await supabase
    .from("student_targets")
    .select("catalog_slug")
    .eq("user_id", userId);
  if (error) throw new Error(`student_targets: ${error.message}`);

  const server = new Set(
    (rows ?? []).map((r) => r.catalog_slug).filter((slug): slug is string => Boolean(slug)),
  );
  const local = new Set(localSlugs);
  const removed = [...server].filter((slug) => !local.has(slug));
  const added = [...local].filter((slug) => !server.has(slug));

  if (removed.length > 0) {
    const { error: deleteError } = await supabase
      .from("student_targets")
      .delete()
      .eq("user_id", userId)
      .in("catalog_slug", removed);
    if (deleteError) throw new Error(`student_targets: ${deleteError.message}`);
  }
  if (added.length > 0) {
    const { error: insertError } = await supabase
      .from("student_targets")
      .upsert(
        added.map((slug) => ({ user_id: userId, catalog_slug: slug })),
        { onConflict: "user_id,catalog_slug" },
      );
    if (insertError) throw new Error(`student_targets: ${insertError.message}`);
  }
}

export type ServerProfile = {
  profile: StudentProfile;
  /** `student_profiles.updated_at`, the server's own clock for last-write-wins. */
  updatedAt: string | null;
};

/**
 * The server's copy of the profile, or null when the user has no row yet (first sign-in).
 *
 * The score is restored from the column its status names: a confirmed status reads the
 * confirmations table, an estimated one reads `estimated_cote_r`. A status with no number
 * behind it becomes no status at all, so a second device never shows "estimated" over a blank.
 */
export async function pullProfileFromServer(
  supabase: Client,
  userId: string,
  fallback: StudentProfile,
): Promise<ServerProfile | null> {
  const [profileRes, confirmRes, targetsRes, prefsRes] = await Promise.all([
    supabase.from("student_profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase
      .from("student_r_score_confirmations")
      .select("session, official_cote_r")
      .eq("user_id", userId)
      .order("session", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("student_targets").select("catalog_slug").eq("user_id", userId),
    supabase
      .from("notification_preferences")
      .select("deadline_reminders, cutoff_updates, new_bursary_matches, grade_window_reminders")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (profileRes.error) throw new Error(`student_profiles: ${profileRes.error.message}`);
  if (!profileRes.data) return null;

  // `select("*")` on an un-migrated project simply omits the newer columns; read them
  // defensively so the pull works against either schema.
  const p = profileRes.data as Partial<Database["public"]["Tables"]["student_profiles"]["Row"]>;
  const status = (p.r_score_status as StudentProfile["rScoreStatus"]) ?? null;
  const confirmed = confirmRes.data?.official_cote_r ?? null;
  const estimated = p.estimated_cote_r ?? null;
  const rScore = status === "confirmed" ? confirmed : status === "estimated" ? estimated : null;

  const targets = targetsRes.data
    ? targetsRes.data.map((t) => t.catalog_slug).filter((slug): slug is string => Boolean(slug))
    : fallback.targetUniversityProgramIds;

  const prefs = prefsRes.data
    ? {
        deadlineReminders: prefsRes.data.deadline_reminders,
        cutoffUpdates: prefsRes.data.cutoff_updates,
        newBursaryMatches: prefsRes.data.new_bursary_matches,
        gradeWindowReminders: prefsRes.data.grade_window_reminders,
      }
    : fallback.notificationPrefs ?? DEFAULT_NOTIFICATION_PREFERENCES;

  return {
    profile: {
      cegepId: p.cegep_short_code ?? null,
      cegepProgramId: p.cegep_program_code ?? null,
      currentSession: p.current_session ?? confirmRes.data?.session ?? null,
      rScore,
      rScoreStatus: rScore === null ? null : status,
      selfTags: (p.self_tags as SelfTagId[] | null) ?? [],
      targetUniversityProgramIds: targets,
      interestIds: (p.interest_ids as InterestId[] | null | undefined) ?? fallback.interestIds,
      decProfileId: p.dec_profile_id ?? fallback.decProfileId,
      goalSkipped: p.goal_skipped ?? fallback.goalSkipped,
      notificationPrefs: prefs,
    },
    updatedAt: p.updated_at ?? null,
  };
}
