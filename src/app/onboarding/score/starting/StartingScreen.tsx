"use client";

import { useState, useTransition } from "react";
import { ArrowRight, BookOpen, GraduationCap, Award } from "lucide-react";
import { ScreenShell } from "@/components/onboarding/ScreenShell";
import { Sheet } from "@/components/ui/Sheet";
import { useReferenceCatalog } from "@/lib/data/reference-store";
import { useStudentProfile } from "@/lib/profile/store";
import { useOnboardingGuard } from "@/lib/profile/onboarding";
import { useFunnelNav } from "@/lib/profile/funnel-nav";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFormat } from "@/lib/i18n/useFormat";

/** The latest verification date in a list of stamped records, or null when the list is empty. */
function latestVerifiedAt(items: { lastVerifiedAt: string }[]): string | null {
  return items.reduce<string | null>((max, i) => (max === null || i.lastVerifiedAt > max ? i.lastVerifiedAt : max), null);
}

/**
 * Step 3c: no cote R yet. Continuing records "1st session, no score", which is a wipe when a
 * score already exists — so that case asks first. A student who lands here from the profile
 * to change one thing should not lose a confirmed score to a mis-tap.
 *
 * The three promises are counted and dated from the catalogue itself (guardrail #1): the
 * screen says how many programmes, DEC cores and bursaries it actually holds, and when the
 * figures were last verified, instead of three bare labels.
 */
export function StartingScreen() {
  const { t } = useLocale();
  const f = useFormat();
  const { profile, update, sync } = useStudentProfile();
  const { hrefFor, finishStep } = useFunnelNav();
  const hydrated = useHydrated();
  const { universityPrograms, bursaries } = useReferenceCatalog();
  const [wipeOpen, setWipeOpen] = useState(false);
  // The CTA's busy state is the navigation's own pending state: it clears itself when the
  // route lands. The previous `loading` flag was set on tap and never cleared, so a student
  // who came back to this screen found a dead button.
  const [isPending, startTransition] = useTransition();

  useOnboardingGuard("score");

  // The store's hydration snapshot is the empty profile (rScore null), and a signed-in
  // student's first reconcile may still be pulling the server copy. Deciding "is there a
  // score to protect" on either would skip the confirmation and wipe silently, so the CTA
  // waits. Hooks all sit above this.
  const ready = hydrated && sync !== "syncing";

  function proceed() {
    setWipeOpen(false);
    update({ currentSession: 1, rScore: null, rScoreStatus: null });
    startTransition(() => {
      finishStep("/onboarding/goal");
    });
  }

  function handleContinue() {
    if (!ready || isPending) return;
    if (profile.rScore !== null) {
      setWipeOpen(true);
      return;
    }
    proceed();
  }

  const universities = new Set(universityPrograms.map((p) => p.institution)).size;
  const withPrerequisites = universityPrograms.filter((p) => p.prerequisites.length > 0).length;
  const programsVerifiedAt = latestVerifiedAt(universityPrograms);
  const bursariesVerifiedAt = latestVerifiedAt(bursaries);
  const stamp = (iso: string | null) =>
    iso ? t("starting.cardVerified").replace("{date}", f.date(iso)) : null;

  const cards = [
    {
      icon: GraduationCap,
      color: "text-ultramarine",
      label: t("starting.card1"),
      count: t("starting.card1Count")
        .replace("{n}", String(universityPrograms.length))
        .replace("{u}", String(universities)),
      stamp: stamp(programsVerifiedAt),
    },
    {
      icon: BookOpen,
      color: "text-moss",
      label: t("starting.card2"),
      count: t("starting.card2Count").replace("{n}", String(withPrerequisites)),
      stamp: stamp(programsVerifiedAt),
    },
    {
      icon: Award,
      color: "text-ember",
      label: t("starting.card3"),
      count: t("starting.card3Count").replace("{n}", String(bursaries.length)),
      stamp: stamp(bursariesVerifiedAt),
    },
  ];

  return (
    <ScreenShell
      backHref={hrefFor("/onboarding/score")}
      footer={
        <div className="flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!ready || isPending}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            <span>{t("starting.cta")}</span>
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 pt-2">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight text-ink">
            {t("starting.title")}
          </h1>
          <p className="text-[14px] font-medium text-ultramarine">{t("starting.subtitle")}</p>
        </div>

        {/* The three promises come first, counted and dated from the catalogue, so the part of
            the screen that earns trust is above the fold; the explanation follows. */}
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {cards.map(({ icon: Icon, color, label, count, stamp: verified }) => (
            <li
              key={label}
              className="flex items-start gap-3 rounded-lg border border-ink/8 bg-paper/60 p-3"
            >
              <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${color}`} aria-hidden />
              <span className="flex flex-col gap-0.5">
                <span className="text-[12.5px] font-semibold text-ink">{label}</span>
                <span className="text-[12px] text-ink/60 tabular-nums">{count}</span>
                {verified && <span className="text-[11px] text-ink/45">{verified}</span>}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 text-[13.5px] leading-relaxed text-ink/75">
          <p>{t("starting.bursaryHighlightSub")}</p>
          <p className="text-[12px] text-ink/50">{t("starting.wipeNote")}</p>
        </div>
      </div>

      <Sheet
        open={wipeOpen}
        onClose={() => setWipeOpen(false)}
        title={t("starting.wipeTitle")}
        footer={
          <>
            <button
              type="button"
              onClick={proceed}
              disabled={isPending}
              className="flex h-14 w-full items-center justify-center rounded-full bg-ember text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98] disabled:opacity-40"
            >
              {t("starting.wipeConfirm")}
            </button>
            <button
              type="button"
              onClick={() => setWipeOpen(false)}
              className="flex h-12 w-full items-center justify-center rounded-full text-[14px] font-semibold text-ink/60"
            >
              {t("common.cancel")}
            </button>
          </>
        }
      >
        <p className="text-[13.5px] leading-relaxed text-ink/80">{t("starting.wipeBody")}</p>
      </Sheet>
    </ScreenShell>
  );
}
