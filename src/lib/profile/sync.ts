"use client";

import { createClient } from "@/lib/db/client";
import type { StudentProfile } from "./store";

/**
 * Pushes the local-first profile up to Supabase.
 *
 * Two things make this less trivial than an upsert:
 *
 *  1. Onboarding runs *before* sign-up, so there is frequently no session. That is not an
 *     error — it means "nothing to sync yet". The caller keeps the mutation queued rather
 *     than dropping it, and it flushes the moment the student signs in.
 *
 *  2. `student_profiles` references `cegeps(id)` and `cegep_programs(id)` by uuid, but the
 *     client only knows catalogue slugs. The 20260825120000 migration adds slug columns plus
 *     a trigger that resolves them to the FKs when a matching catalogue row exists, so this
 *     writes slugs and lets Postgres do the join. A project whose catalogue has not been
 *     seeded yet still accepts the write; the FK simply stays null until it is.
 */

export type SyncOutcome =
  | { status: "synced" }
  /** No session — keep the mutation queued, do not count it as a failure. */
  | { status: "skipped"; reason: "no-session" }
  | { status: "failed"; message: string };

export async function syncProfile(profile: StudentProfile): Promise<SyncOutcome> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "skipped", reason: "no-session" };

  const { error } = await supabase.from("student_profiles").upsert(
    {
      user_id: user.id,
      cegep_short_code: profile.cegepId,
      cegep_program_slug: profile.cegepProgramId,
      current_session: profile.currentSession,
      self_tags: profile.selfTags,
      r_score_status: profile.rScoreStatus,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) return { status: "failed", message: error.message };

  // A confirmed score is the student's own official number, so it belongs in the
  // confirmations table. An estimate deliberately does not: writing it there would let a
  // guess masquerade as an official figure later (guardrail #2).
  if (profile.rScoreStatus === "confirmed" && profile.rScore !== null && profile.currentSession !== null) {
    const { error: scoreError } = await supabase.from("student_r_score_confirmations").upsert(
      {
        user_id: user.id,
        session: profile.currentSession,
        official_cote_r: profile.rScore,
      },
      { onConflict: "user_id,session" },
    );
    if (scoreError) return { status: "failed", message: scoreError.message };
  }

  if (profile.targetUniversityProgramIds.length > 0) {
    const { error: targetError } = await supabase.from("student_targets").upsert(
      profile.targetUniversityProgramIds.map((slug) => ({ user_id: user.id, catalog_slug: slug })),
      { onConflict: "user_id,catalog_slug" },
    );
    if (targetError) return { status: "failed", message: targetError.message };
  }

  return { status: "synced" };
}

/**
 * Pulls the server's copy back down. Runs once after sign-in so a student returning on a new
 * device sees their real profile instead of an empty onboarding state.
 */
export async function fetchProfile(): Promise<Partial<StudentProfile> | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("student_profiles")
    .select("cegep_short_code, cegep_program_slug, current_session, self_tags, r_score_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  const [{ data: targets }, { data: confirmations }] = await Promise.all([
    supabase.from("student_targets").select("catalog_slug").eq("user_id", user.id),
    supabase
      .from("student_r_score_confirmations")
      .select("session, official_cote_r")
      .eq("user_id", user.id)
      .order("session", { ascending: false })
      .limit(1),
  ]);

  const latest = confirmations?.[0];

  return {
    cegepId: data.cegep_short_code ?? null,
    cegepProgramId: data.cegep_program_slug ?? null,
    currentSession: data.current_session ?? null,
    selfTags: (data.self_tags ?? []) as StudentProfile["selfTags"],
    rScoreStatus: (data.r_score_status ?? null) as StudentProfile["rScoreStatus"],
    ...(latest ? { rScore: Number(latest.official_cote_r) } : {}),
    targetUniversityProgramIds: (targets ?? [])
      .map((row) => row.catalog_slug)
      .filter((slug): slug is string => Boolean(slug)),
  };
}
