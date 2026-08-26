"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/db/client";
import { readProfile, type StudentProfile } from "./store";

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
 */
function isSatisfied(step: OnboardingStep, profile: StudentProfile): boolean {
  switch (step) {
    case "cegep":
      return profile.cegepId !== null;
    case "program":
      return profile.cegepProgramId !== null;
    case "score":
      return profile.rScore !== null;
    case "goal":
      // Deliberately not gated on a target or an interest: "I don't know yet" is a legitimate
      // answer the quiz exists to serve, and blocking on it would trap that student.
      return profile.rScore !== null;
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

/**
 * Keeps a step honest: if the student has not finished what comes before it, send them to the
 * step they actually owe. Deep links, the back button, and a half-remembered URL all route
 * through this, so no screen can render against a profile that cannot support it.
 *
 * Runs in an effect rather than during render because it reads localStorage, which is not
 * available during the server pass and would desync hydration if read any earlier.
 */
export function useOnboardingGuard(step: OnboardingStep) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function check() {
      // A student who already has a session has finished this funnel, whatever the local
      // storage of THIS browser happens to know. Without this, signing in on a second device
      // — or in the system browser after tapping a link sent from the app — landed on an empty
      // profile and the guard marched them back through onboarding they had already done.
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;

      if (user) {
        router.replace("/dashboard");
        return;
      }

      const profile = readProfile();
      const required = ONBOARDING_STEPS.slice(0, ONBOARDING_STEPS.indexOf(step));

      for (const earlier of required) {
        if (!isSatisfied(earlier, profile)) {
          router.replace(STEP_PATH[earlier]);
          return;
        }
      }
    }

    check().catch(() => {
      // Offline or Supabase unreachable: fall back to the local-only check rather than
      // trapping someone on a screen because a network call failed.
      const profile = readProfile();
      const required = ONBOARDING_STEPS.slice(0, ONBOARDING_STEPS.indexOf(step));
      for (const earlier of required) {
        if (!isSatisfied(earlier, profile)) {
          router.replace(STEP_PATH[earlier]);
          return;
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [step, router]);
}
