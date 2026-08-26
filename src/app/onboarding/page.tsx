"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { firstIncompletePath } from "@/lib/profile/onboarding";
import { readProfile } from "@/lib/profile/store";

/**
 * The funnel's entry point, and the target src/proxy.ts sends signed-out visitors to.
 *
 * It routes to the first step the student has not finished rather than a fixed screen. A
 * brand-new user gets the cégep picker; someone who dropped out at the score step resumes
 * there instead of re-answering. Both matter because /app (the PWA start_url and the
 * Capacitor entry) lands here via /dashboard, so this is what a cold boot actually hits.
 *
 * Client-side by necessity: progress lives in localStorage, which the proxy cannot read.
 */
export default function OnboardingIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace(firstIncompletePath(readProfile()));
  }, [router]);

  return null;
}
