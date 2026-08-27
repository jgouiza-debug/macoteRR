"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { firstIncompletePath } from "@/lib/profile/onboarding";
import { readProfile } from "@/lib/profile/store";

const WELCOME_STORAGE_KEY = "macote.has_seen_welcome";

/**
 * The funnel's entry point, and the target src/proxy.ts sends signed-out visitors to.
 *
 * It routes to the welcome screen on very first visit, or to the first incomplete step.
 */
export default function OnboardingIndex() {
  const router = useRouter();

  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem(WELCOME_STORAGE_KEY) === "1";
      if (!hasSeen) {
        router.replace("/onboarding/welcome");
        return;
      }
    } catch {
      /* ignore storage failure */
    }
    router.replace(firstIncompletePath(readProfile()));
  }, [router]);

  return null;
}
