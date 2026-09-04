"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppLoading from "@/app/(app)/loading";
import { AppShell } from "@/components/app-shell/AppShell";
import { ImportantDates } from "@/components/dashboard/ImportantDates";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { WhatIfSheet } from "@/components/dashboard/WhatIfSheet";
import { TargetGoals } from "@/components/dashboard/TargetGoals";
import { RScoreBandSheet } from "@/components/rscore/RScoreBandSheet";
import { useReferenceCatalog } from "@/lib/data/reference-store";
import { resolveCegepName, resolveDecName } from "@/lib/data/resolve-names";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useStudentProfile } from "@/lib/profile/store";

export default function DashboardPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const { profile, sync } = useStudentProfile();
  const hydrated = useHydrated();
  const { sessions } = useReferenceCatalog();
  const [bandOpen, setBandOpen] = useState(false);
  const [whatIfOpen, setWhatIfOpen] = useState(false);

  // Two transient states must never drive a redirect: the hydration render (the store still
  // shows the server's empty profile) and a signed-in student's first reconcile (the local
  // copy may be about to be replaced by the server's). Until both have settled, show the same
  // skeleton the route's loading.tsx shows, so nothing moves when the real page lands.
  const settled = hydrated && sync !== "syncing";

  // No cégep once settled means onboarding was never started on this device — nothing real to
  // show. Every hook sits above this guard's early return, on purpose (see useHydrated).
  useEffect(() => {
    if (settled && profile.cegepId === null) router.replace("/onboarding");
  }, [settled, profile.cegepId, router]);

  if (!settled || profile.cegepId === null) return <AppLoading />;

  const cegepName = resolveCegepName(profile.cegepId);
  // Falls back to the raw code rather than nothing: a student who picked a DEC we cannot name
  // should still see that their pick is on file.
  const cegepProgramName = resolveDecName(profile.cegepProgramId, locale) ?? profile.cegepProgramId;

  // The session the what-if sheet works on: the current one if it has grades, else the most
  // recent session that does. null when no grades exist anywhere (the button is hidden).
  const sessionsWithGrades = profile.courseGrades.map((g) => g.session);
  const whatIfSession =
    profile.currentSession !== null && sessionsWithGrades.includes(profile.currentSession)
      ? profile.currentSession
      : sessionsWithGrades.length > 0
        ? Math.max(...sessionsWithGrades)
        : null;
  const whatIfGrades =
    whatIfSession === null ? [] : profile.courseGrades.filter((g) => g.session === whatIfSession);
  const session = sessions.find((s) => s.id === profile.currentSession);
  const sessionLabel = session ? (locale === "fr" ? session.labelFr : session.labelEn) : null;

  return (
    <AppShell
      rScore={profile.rScore}
      rScoreStatus={profile.rScoreStatus}
      currentSession={profile.currentSession}
    >
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-7 px-4 py-6">
        <ScoreCard
          rScore={profile.rScore}
          rScoreStatus={profile.rScoreStatus}
          cegepName={cegepName}
          cegepProgramName={cegepProgramName}
          sessionLabel={sessionLabel}
          enteredOn={profile.rScoreUpdatedAt}
          onOpenBands={() => setBandOpen(true)}
          canWhatIf={whatIfSession !== null}
          onOpenWhatIf={() => setWhatIfOpen(true)}
        />

        <TargetGoals rScore={profile.rScore} rScoreStatus={profile.rScoreStatus} />

        <ImportantDates targetProgramIds={profile.targetUniversityProgramIds} />
      </div>

      {profile.rScore !== null && (
        <RScoreBandSheet
          score={profile.rScore}
          open={bandOpen}
          onClose={() => setBandOpen(false)}
        />
      )}

      {whatIfOpen && whatIfSession !== null && (
        <WhatIfSheet
          open={whatIfOpen}
          onClose={() => setWhatIfOpen(false)}
          grades={whatIfGrades}
          confirmations={profile.confirmations}
        />
      )}
    </AppShell>
  );
}
