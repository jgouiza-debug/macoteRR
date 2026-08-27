"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, TriangleAlert, Sparkles } from "lucide-react";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { Sheet } from "@/components/ui/Sheet";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useStudentProfile } from "@/lib/profile/store";
import { useOnboardingGuard } from "@/lib/profile/onboarding";
import { SESSIONS } from "@/lib/sample-data";

export default function KnowYourScorePage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const { profile, update } = useStudentProfile();
  // "Help me estimate it" does not go straight to the estimator: an estimate is the one
  // number in this product that cannot be sourced, so the student reads why before they see
  // a figure they might otherwise take as fact.
  const [warningOpen, setWarningOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState<number>(profile.currentSession ?? 1);

  // Needs a cégep and a DEC before a score means anything.
  useOnboardingGuard("score");

  function handleSelectSession(sessionId: number) {
    setCurrentSession(sessionId);
    update({ currentSession: sessionId });
  }

  return (
    <ScreenShell backHref="/onboarding/program">
      <ScreenHeading title={t("bif.title")} body={t("bif.body")} />

      {/* Session selector */}
      <div className="mb-5 flex flex-col gap-2 rounded-xl border border-ink/10 bg-paper p-3.5 shadow-sm">
        <label className="text-[12px] font-semibold text-ink/70">
          {t("bif.sessionPrompt")}
        </label>
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          {SESSIONS.map((s) => {
            const isSelected = currentSession === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectSession(s.id)}
                className={`flex h-10 items-center justify-center rounded-lg border text-[12px] font-semibold transition-all active:scale-[0.97] ${
                  isSelected
                    ? "border-ultramarine bg-ultramarine text-paper shadow-sm"
                    : "border-ink/15 bg-chalk/40 text-ink/70 hover:border-ink/30"
                }`}
              >
                {locale === "fr" ? `Session ${s.id}` : `Term ${s.id}`}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <Link
          href="/onboarding/score/confirm"
          className="flex min-h-[58px] items-center justify-between gap-3 rounded-xl border-[1.5px] border-ultramarine bg-paper px-4 py-3 text-[14.5px] font-semibold text-ultramarine shadow-sm transition-transform active:scale-[0.99]"
        >
          {t("bif.yes")}
          <ChevronRight className="h-5 w-5 flex-shrink-0" />
        </Link>

        <button
          type="button"
          onClick={() => setWarningOpen(true)}
          className="flex min-h-[58px] items-center justify-between gap-3 rounded-xl border border-ink/15 bg-paper px-4 py-3 text-left text-[14.5px] font-semibold text-ink transition-transform active:scale-[0.99]"
        >
          {t("bif.no")}
          <ChevronRight className="h-5 w-5 flex-shrink-0 text-ink/40" />
        </button>

        <Link
          href="/onboarding/score/starting"
          className="flex min-h-[64px] items-center justify-between gap-3 rounded-xl border border-moss/40 bg-moss/[0.04] px-4 py-3 text-left text-moss transition-transform active:scale-[0.99]"
        >
          <div className="flex items-start gap-2.5">
            <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-moss" />
            <div>
              <span className="block text-[14.5px] font-semibold text-moss">
                {t("bif.startingCegep")}
              </span>
              <span className="block text-[12px] font-normal text-moss/80">
                {t("bif.startingCegepSub")}
              </span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 flex-shrink-0 text-moss/70" />
        </Link>
      </div>

      <Sheet
        open={warningOpen}
        onClose={() => setWarningOpen(false)}
        title={t("warn.estTitle")}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setWarningOpen(false);
                router.push("/onboarding/score/estimate");
              }}
              className="flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98]"
            >
              {t("warn.estCta")}
            </button>
            <button
              type="button"
              onClick={() => {
                setWarningOpen(false);
                router.push("/onboarding/score/confirm");
              }}
              className="flex h-12 w-full items-center justify-center rounded-full text-[14px] font-semibold text-ink/60"
            >
              {t("warn.estBack")}
            </button>
          </>
        }
      >
        <div className="flex items-start gap-3 rounded bg-ember/[0.08] p-3.5">
          <TriangleAlert className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-ember" />
          <p className="text-[13.5px] leading-relaxed text-ink/80">{t("warn.estBody")}</p>
        </div>
        <p className="mt-3.5 text-[13.5px] leading-relaxed text-ink/65">{t("warn.estBody2")}</p>
      </Sheet>

      <div className="flex justify-center pt-6">
        <Link
          href="/programs"
          className="max-w-[240px] text-center text-[13.5px] font-semibold leading-snug text-ultramarine"
        >
          {t("bif.justSeuils")}
        </Link>
      </div>
    </ScreenShell>
  );
}

