"use client";

import { useEffect, useState } from "react";
import { initReferenceCatalog, useReferenceCatalog } from "@/lib/data/reference-store";
import { useStudentProfile } from "@/lib/profile/store";
import { refreshInbox } from "@/lib/notifications/inbox";

/**
 * Boots the reference catalogue (src/lib/data/reference-store.ts) once per page load, then
 * derives the notification inbox from the profile + catalogue + toggles. Renders nothing.
 * Mounted from the (app) and onboarding layouts.
 *
 * The profile store exposes no plain subscribe, so the inbox is refreshed on an effect keyed
 * by a cheap signature of the inputs deriveNotificationEvents actually reads, plus the catalog
 * version. The guest/user dedupe-key choice must be settled first (sync out of unknown /
 * syncing), or the inbox would derive twice with two different user ids.
 */
export function ReferenceCatalogBoot() {
  const { profile, sync } = useStudentProfile();
  const { version } = useReferenceCatalog();
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    initReferenceCatalog().finally(() => {
      if (!cancelled) setBooted(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const signature = JSON.stringify([
    profile.targetUniversityProgramIds,
    profile.notificationPrefs,
    profile.cegepId,
    profile.cegepProgramId,
    profile.currentSession,
    profile.rScore,
    profile.selfTags,
  ]);

  useEffect(() => {
    if (!booted || sync === "unknown" || sync === "syncing") return;
    refreshInbox().catch(() => {});
  }, [booted, sync, signature, version]);

  return null;
}
