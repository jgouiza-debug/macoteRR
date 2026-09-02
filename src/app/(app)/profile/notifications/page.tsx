"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Bell } from "lucide-react";
import { AppShell } from "@/components/app-shell/AppShell";
import { useStudentProfile } from "@/lib/profile/store";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { createClient } from "@/lib/db/client";
import {
  type NotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "@/lib/notifications/types";
import {
  getNotificationPreferences,
  saveNotificationPreferences,
} from "@/lib/notifications/service";

const NOTIF_STORAGE_KEY = "macote.notifications";

function readLocalNotifPrefs(): NotificationPreferences {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(NOTIF_STORAGE_KEY);
    return raw ? { ...DEFAULT_NOTIFICATION_PREFERENCES, ...(JSON.parse(raw) as Partial<NotificationPreferences>) } : DEFAULT_NOTIFICATION_PREFERENCES;
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

export default function NotificationSettingsPage() {
  const { t } = useLocale();
  const { profile } = useStudentProfile();
  const [prefs, setPrefs] = useState<NotificationPreferences>(readLocalNotifPrefs);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const loaded = await getNotificationPreferences(supabase, user.id);
        setPrefs(loaded);
        try {
          window.localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(loaded));
        } catch {
          /* ignore */
        }
      }
    }

    load().catch(() => {});
  }, []);

  async function handleToggle(key: "deadlineReminders" | "cutoffUpdates" | "newBursaryMatches" | "gradeWindowReminders") {
    const updated: NotificationPreferences = {
      ...prefs,
      [key]: !prefs[key],
    };
    setPrefs(updated);
    try {
      window.localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      /* ignore */
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await saveNotificationPreferences(supabase, user.id, updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  const toggles: {
    key: "deadlineReminders" | "cutoffUpdates" | "newBursaryMatches" | "gradeWindowReminders";
    title: string;
    description: string;
  }[] = [
    {
      key: "deadlineReminders",
      title: t("notif.deadlinesTitle"),
      description: t("notif.deadlinesDesc"),
    },
    {
      key: "cutoffUpdates",
      title: t("notif.cutoffsTitle"),
      description: t("notif.cutoffsDesc"),
    },
    {
      key: "newBursaryMatches",
      title: t("notif.bursariesTitle"),
      description: t("notif.bursariesDesc"),
    },
    {
      key: "gradeWindowReminders",
      title: t("notif.gradesTitle"),
      description: t("notif.gradesDesc"),
    },
  ];

  return (
    <AppShell rScore={profile.rScore ?? undefined}>
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-6 px-4 py-6">
        <div className="flex items-center justify-between">
          <Link
            href="/profile"
            className="inline-flex min-h-[48px] items-center gap-1.5 text-[13.5px] font-semibold text-ink/70 hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("prof.title")}
          </Link>
          {saved && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-moss/10 px-2.5 py-1 text-[12px] font-semibold text-moss animate-pop-in border border-moss/20">
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              {t("notif.saveSuccess")}
            </span>
          )}
        </div>

        <div>
          <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight text-ink">
            {t("notif.title")}
          </h1>
          <p className="mt-1 font-display text-[15px] font-semibold text-ultramarine">
            {t("notif.subtitle")}
          </p>
        </div>

        <div className="rounded border border-ink/12 bg-paper p-4 shadow-card">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-ultramarine/10 text-ultramarine">
              <Bell className="h-4 w-4" />
            </div>
            <p className="text-[13px] leading-relaxed text-ink/75">{t("notif.framing")}</p>
          </div>
        </div>

        <section className="flex flex-col overflow-hidden rounded border border-ink/12 bg-paper shadow-card">
          {toggles.map((item, idx) => {
            const checked = prefs[item.key];
            return (
              <div
                key={item.key}
                className={`flex items-start justify-between gap-4 p-4 ${
                  idx > 0 ? "border-t border-ink/10" : ""
                }`}
              >
                <div className="flex-1 pr-2">
                  <h2 className="text-[14.5px] font-semibold text-ink">{item.title}</h2>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink/60">{item.description}</p>
                </div>
                <div className="-mr-2 flex min-h-[48px] min-w-[48px] items-center justify-center">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    aria-label={item.title}
                    onClick={() => handleToggle(item.key)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine ${
                      checked ? "bg-ultramarine" : "bg-ink/20"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-paper shadow-card ring-0 transition duration-200 ease-in-out ${
                        checked ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
