"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/db/client";
import { ensureReconciled, readProfile, type StudentProfile } from "./store";
import { readFunnelParams, withFunnelParams, DEFAULT_FUNNEL_RETURN } from "./funnel-nav";

/**
 * One definition of "how far through onboarding is this student", used by both the entry
 * point and every step's guard.
 *
 * It has to live on the client because progress lives in localStorage: src/proxy.ts can only
 * see cookies, so it knows whether someone is signed in but not whether they have picked a
 * cégep. That split is why the gate used to drop a brand-new user straight onto the sign-up
 * screen — /app -> /dashboard -> (no session) -> /onboarding/account, the last step of a
 * funnel they had not started.
 */

export const ONBOARDING_STEPS = ["cegep", "program", "score", "goal", "account"] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export const STEP_PATH: Record<OnboardingStep, string> = {
  cegep: "/onboarding/cegep",
  program: "/onboarding/program",
  score: "/onboarding/score",
  goal: "/onboarding/goal",
  account: "/onboarding/account",
};

/**
 * What each step needs from the steps before it. `account` requires the whole funnel: it is
 * the point where the local profile is attached to a real user, so attaching a half-built one
 * would persist gaps that are awkward to notice later.
 *
 * `score` counts as done once a score path was completed — a status, or a session with no
 * score yet ("je commence le cégep"). `goal` used to share `score`'s predicate word for word,
 * which meant the funnel could never send anyone to the goal step on a refresh: targets and
 * interests silently went uncollected for every student who reloaded.
 */
export function isSatisfied(step: OnboardingStep, profile: StudentProfile): boolean {
  switch (step) {
    case "cegep":
      return profile.cegepId !== null;
    case "program":
      return profile.cegepProgramId !== null;
    case "score":
      return profile.rScoreStatus !== null || profile.currentSession !== null;
    case "goal":
      return (
        profile.targetUniversityProgramIds.length > 0 ||
        profile.interestIds.length > 0 ||
        profile.goalSkipped
      );
    case "account":
      return false; // Never "done" client-side — completion is having a session.
  }
}

/** The first step whose prerequisites are not met — where a student belongs right now. */
export function firstIncompleteStep(profile: StudentProfile): OnboardingStep {
  for (const step of ONBOARDING_STEPS) {
    if (!isSatisfied(step, profile)) return step;
  }
  return "account";
}

export function firstIncompletePath(profile: StudentProfile): string {
  return STEP_PATH[firstIncompleteStep(profile)];
}

/** True when every step before `account` is satisfied: the funnel has been run to the end. */
export function funnelComplete(profile: StudentProfile): boolean {
  return firstIncompleteStep(profile) === "account";
}

async function currentUserId(): Promise<string | null> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    // Offline, or Supabase unreachable: treat as a guest rather than trapping someone on a
    // screen because a network call failed.
    return null;
  }
}

/**
 * Keeps a step honest: if the student has not finished what comes before it, send them to the
 * step they actually owe. Deep links, the back button, and a half-remembered URL all route
 * through this, so no screen can render against a profile that cannot support it.
 *
 * Signed-in students are not locked out. The old guard bounced every authenticated user to
 * the dashboard, which made "Modifier" on the profile and "Entrer ma cote R" on the dashboard
 * — both of which link into the funnel — impossible to use, and turned a magic link opened in
 * a second browser into an infinite loop between an empty dashboard and the funnel. Now:
 *
 *   - A signed-in student arriving with `?edit=1` is here on purpose and stays.
 *   - A signed-in student whose local profile is complete, arriving without edit intent, has
 *     nothing to do here and goes to `?next` (default /dashboard).
 *   - A signed-in student whose local profile is incomplete first pulls the server copy
 *     (the second-device case), then is judged on the result.
 *
 * Runs in an effect rather than during render because it reads localStorage, which is not
 * available during the server pass and would desync hydration if read any earlier.
 */
export function useOnboardingGuard(step: OnboardingStep) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    const { edit, next } = readFunnelParams();

    async function check() {
      const userId = await currentUserId();
      if (cancelled) return;

      if (userId) {
        await ensureReconciled().catch(() => {});
        if (cancelled) return;

        const leave = step === "account" || (!edit && funnelComplete(readProfile()));
        if (leave) {
          router.replace(next ?? DEFAULT_FUNNEL_RETURN);
          return;
        }
      }

      const profile = readProfile();
      const required = ONBOARDING_STEPS.slice(0, ONBOARDING_STEPS.indexOf(step));
      for (const earlier of required) {
        if (!isSatisfied(earlier, profile)) {
          // Intent survives the bounce: an edit that lands on an earlier step is still an edit.
          router.replace(withFunnelParams(STEP_PATH[earlier], { edit, next }));
          return;
        }
      }
    }

    check().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [step, router]);
}
