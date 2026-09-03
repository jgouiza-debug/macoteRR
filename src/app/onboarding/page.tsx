"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { firstIncompletePath } from "@/lib/profile/onboarding";
import { readFunnelParams, withFunnelParams } from "@/lib/profile/funnel-nav";
import { readProfile } from "@/lib/profile/store";

const WELCOME_STORAGE_KEY = "macote.has_seen_welcome";

/**
 * The funnel's entry point, and the target src/proxy.ts sends signed-out visitors to.
 *
 * It routes to the welcome screen on very first visit, or to the first incomplete step. The
 * intent parameters (`?edit=1`, `?next=/x`) ride along on either hop: the proxy sets `next`
 * when it bounces a deep link, and dropping it here used to land every deep link on
 * /dashboard. `?lang` is consumed globally by the LocaleProvider and is not forwarded.
 */
export default function OnboardingIndex() {
  const router = useRouter();

  useEffect(() => {
    const params = readFunnelParams();
    let hasSeen = false;
    try {
      hasSeen = localStorage.getItem(WELCOME_STORAGE_KEY) === "1";
    } catch {
      /* ignore storage failure */
    }
    const target = hasSeen ? firstIncompletePath(readProfile()) : "/onboarding/welcome";
    router.replace(withFunnelParams(target, params));
  }, [router]);

  return null;
}
