"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/db/client";
import { fetchProfile } from "@/lib/profile/sync";
import { flushProfileQueue, hydrateProfile, readProfile } from "@/lib/profile/store";

/**
 * Reconciles the local-first profile with the server once a session exists.
 *
 * The funnel runs signed out, so everything a student picked sits in localStorage with a
 * queue of unsent mutations behind it. The moment they come back from the magic link, this
 * decides which copy wins:
 *
 *   - local has onboarding answers  → push them up (the funnel they just finished is newest)
 *   - local is empty                → pull the server's copy down (returning on a new device)
 *
 * It renders nothing and runs once per mount; the queue itself is idempotent, so a double
 * run costs one redundant upsert rather than duplicate rows.
 */
export function ProfileSyncGate() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    let cancelled = false;

    async function reconcile() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const local = readProfile();
      const hasLocalAnswers = Boolean(local.cegepId || local.rScore !== null);

      if (hasLocalAnswers) {
        await flushProfileQueue();
        if (!cancelled && !local.onboardingCompletedAt) {
          hydrateProfile({ onboardingCompletedAt: new Date().toISOString() });
        }
      } else {
        const remote = await fetchProfile();
        if (remote && !cancelled) hydrateProfile(remote);
      }

      if (!cancelled) setDone(true);
    }

    reconcile().catch(() => {
      // A failed reconcile is not fatal: the queue survives in localStorage and retries on
      // the next mount or the next `online` event.
    });

    return () => {
      cancelled = true;
    };
  }, [done]);

  return null;
}
