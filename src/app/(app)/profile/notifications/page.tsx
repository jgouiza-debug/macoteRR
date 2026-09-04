"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, Bell } from "lucide-react";
import { withFunnelParams } from "@/lib/profile/funnel-nav";
import { AppShell } from "@/components/app-shell/AppShell";
import { readProfile, useStudentProfile } from "@/lib/profile/store";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import type { NotificationPreferences } from "@/lib/notifications/types";

type ToggleKey = "deadlineReminders" | "cutoffUpdates" | "newBursaryMatches" | "gradeWindowReminders";

const TOGGLES: { key: ToggleKey; titleKey: TranslationKey; descKey: TranslationKey }[] = [
  { key: "deadlineReminders", titleKey: "notif.deadlinesTitle", descKey: "notif.deadlinesDesc" },
  { key: "cutoffUpdates", titleKey: "notif.cutoffsTitle", descKey: "notif.cutoffsDesc" },
  { key: "newBursaryMatches", titleKey: "notif.bursariesTitle", descKey: "notif.bursariesDesc" },
  { key: "gradeWindowReminders", titleKey: "notif.gradesTitle", descKey: "notif.gradesDesc" },
];

/** How long the "saved" chip stays up after a toggle. */
const SAVED_CHIP_MS = 2000;

/**
 * The four notification toggles. They live in `profile.notificationPrefs`: flipping one is a
 * normal profile update, written locally at once and carried to the server by the store's
 * outbox. There is no separate round-trip to wait for, so the local write IS the save and the
 * chip confirms every toggle, guest or signed in.
 */
export default function NotificationSettingsPage() {
  const { t } = useLocale();
  const { profile, update, sync } = useStudentProfile();
  const hydrated = useHydrated();
  const [saved, setSaved] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The hydration render sees the server snapshot (every toggle off) and a signed-in student's
  // first reconcile may still be about to replace the local copy. Neither is a state to show as
  // "off", and a toggle made mid-reconcile could be overwritten by the pull, so the switches are
  // skeletons until both have settled. Every hook stays above this point (see useHydrated).
  const ready = hydrated && sync !== "syncing";

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    [],
  );

  function handleToggle(key: ToggleKey) {
    // Read at click time, not from the render closure: update() replaces the whole
    // notificationPrefs object, so a value refreshed between render and click (cross-tab storage
    // event, reconcile write) must not be overwritten by a stale snapshot.
    const current = readProfile().notificationPrefs;
    const next: NotificationPreferences = { ...current };
    next[key] = !current[key];
    update({ notificationPrefs: next });

    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), SAVED_CHIP_MS);
  }

  return (
    <AppShell
      rScore={profile.rScore}
      rScoreStatus={profile.rScoreStatus}
      currentSession={profile.currentSession}
      backHref="/profile"
    >
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-6 px-4 py-6">
        {/* The back affordance is TopNav's chevron (AppShell backHref); the "saved" chip sits
            beside the title so no empty band waits above it. */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight text-ink">
              {t("notif.title")}
            </h1>
            <p className="mt-1 font-display text-[15px] font-semibold text-ultramarine">
              {t("notif.subtitle")}
            </p>
          </div>
          <div aria-live="polite" className="shrink-0 pt-1">
            {saved && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-moss/20 bg-moss/10 px-2.5 py-1 text-[12px] font-semibold text-moss animate-pop-in">
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                {t("notif.saveSuccess")}
              </span>
            )}
          </div>
        </div>

        <div className="rounded border border-ink/12 bg-paper p-4 shadow-card">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-ultramarine/10 text-ultramarine">
              <Bell className="h-4 w-4" />
            </div>
            <p className="text-[13px] leading-relaxed text-ink/75">{t("notif.framing")}</p>
          </div>
        </div>

        {sync === "guest" && (
          <div className="flex flex-col gap-3 rounded border border-ink/12 bg-paper p-4 shadow-card">
            <p className="text-[12.5px] leading-relaxed text-ink/60">{t("sync.guestNotice")}</p>
            <Link
              href={withFunnelParams("/onboarding/account", { next: "/profile/notifications" })}
              className="inline-flex min-h-[44px] w-fit items-center rounded-full border border-ink/15 px-4 text-[12.5px] font-semibold text-ultramarine tap-spring hover:bg-chalk"
            >
              {t("account.signInCta")}
            </Link>
          </div>
        )}

        <section
          className="flex flex-col overflow-hidden rounded border border-ink/12 bg-paper shadow-card"
          aria-busy={!ready}
        >
          {TOGGLES.map((item, idx) => {
            const title = t(item.titleKey);
            const checked = profile.notificationPrefs[item.key];
            return (
              <div
                key={item.key}
                className={`flex min-h-[48px] items-start justify-between gap-4 p-4 ${
                  idx > 0 ? "border-t border-ink/10" : ""
                }`}
              >
                <div className="flex-1 pr-2">
                  <h2 className="text-[14.5px] font-semibold text-ink">{title}</h2>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink/60">{t(item.descKey)}</p>
                </div>
                {ready ? (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    aria-label={title}
                    onClick={() => handleToggle(item.key)}
                    className="-mr-2 inline-flex min-h-[48px] min-w-[48px] flex-shrink-0 cursor-pointer items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine"
                  >
                    <span
                      aria-hidden="true"
                      className={`relative inline-flex h-6 w-11 rounded-full border-2 border-transparent transition-colors duration-200 ${
                        checked ? "bg-ultramarine" : "bg-ink/20"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-paper shadow-card transition duration-200 ease-in-out ${
                          checked ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </span>
                  </button>
                ) : (
                  // Same geometry as the switch, so nothing moves when the real state lands.
                  <div
                    className="-mr-2 flex min-h-[48px] min-w-[48px] flex-shrink-0 items-center justify-center"
                    aria-hidden="true"
                  >
                    <span className="h-6 w-11 animate-pulse rounded-full bg-ink/12" />
                  </div>
                )}
              </div>
            );
          })}
        </section>

      </div>
    </AppShell>
  );
}
