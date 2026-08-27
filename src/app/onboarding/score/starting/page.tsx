"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, BookOpen, GraduationCap, Award } from "lucide-react";
import { ScreenShell } from "@/components/onboarding/ScreenShell";
import { useStudentProfile } from "@/lib/profile/store";
import { useOnboardingGuard } from "@/lib/profile/onboarding";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function StartingCegepPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { update } = useStudentProfile();
  const [loading, setLoading] = useState(false);

  useOnboardingGuard("score");

  function handleContinue() {
    setLoading(true);
    update({
      currentSession: 1,
      rScore: null,
      rScoreStatus: null,
    });
    router.push("/onboarding/goal");
  }

  return (
    <ScreenShell
      backHref="/onboarding/score"
      footer={
        <div className="flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={handleContinue}
            disabled={loading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            <span>{t("starting.cta")}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-5 pt-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ultramarine/[0.08] text-ultramarine">
          <Sparkles className="h-6 w-6" />
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight text-ink">
            {t("starting.title")}
          </h1>
          <p className="text-[14px] font-medium text-ultramarine">
            {t("starting.subtitle")}
          </p>
        </div>

        {/* Highlight card for bursaries for program & future */}
        <div className="flex items-start gap-3.5 rounded-xl border border-ember/30 bg-ember/[0.06] p-4 shadow-sm">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-ember/15 text-ember">
            <Award className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-[14px] font-bold text-ink">
              {t("starting.bursaryHighlight")}
            </h2>
            <p className="text-[12.5px] leading-relaxed text-ink/75">
              {t("starting.bursaryHighlightSub")}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-ink/10 bg-paper p-4 text-[13.5px] leading-relaxed text-ink/75 shadow-card">
          <p>{t("starting.body1")}</p>
          <p>{t("starting.body2")}</p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border border-ink/8 bg-paper/60 p-3">
            <GraduationCap className="h-5 w-5 text-ultramarine flex-shrink-0" />
            <span className="text-[12.5px] font-semibold text-ink">Seuils universitaires</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-ink/8 bg-paper/60 p-3">
            <BookOpen className="h-5 w-5 text-moss flex-shrink-0" />
            <span className="text-[12.5px] font-semibold text-ink">Préalables DEC</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-ink/8 bg-paper/60 p-3">
            <Award className="h-5 w-5 text-ember flex-shrink-0" />
            <span className="text-[12.5px] font-semibold text-ink">Bourses de ton cégep</span>
          </div>
        </div>
      </div>
    </ScreenShell>
  );
}
