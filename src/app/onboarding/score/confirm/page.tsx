"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenShell } from "@/components/onboarding/ScreenShell";
import { StepProgress } from "@/components/onboarding/StepProgress";
import { useStudentProfile } from "@/lib/profile/store";
import { currentSessionId } from "@/lib/sample-data";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function ConfirmScorePage() {
  const router = useRouter();
  const { t } = useLocale();
  const { profile, update } = useStudentProfile();
  const [value, setValue] = useState(
    profile.rScore !== null ? String(profile.rScore).replace(".", ",") : "",
  );
  const [touched, setTouched] = useState(false);

  const numeric = Number(value.replace(",", "."));
  const isValid = value.trim().length > 0 && Number.isFinite(numeric) && numeric >= 15 && numeric <= 50;
  const showError = touched && value.length > 0 && !isValid;

  function submit() {
    if (!isValid) {
      setTouched(true);
      return;
    }

    update({
      rScore: numeric,
      rScoreStatus: "confirmed",
      currentSession: profile.currentSession ?? currentSessionId(),
    });

    router.push(`/onboarding/results?score=${numeric}&status=confirmed`);
  }

  return (
    <ScreenShell
      backHref="/onboarding/score"
      footer={
        <div className="flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={submit}
            disabled={!isValid}
            className="flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            {t("entry.cta")}
          </button>
        </div>
      }
    >
      <StepProgress step="score" />

      <h1 className="mb-6 pt-3 font-display text-[27px] font-bold leading-[1.15] tracking-tight text-ink">
        {t("entry.title")}
      </h1>

      {/*
        One field, one box. The label and the number share a single bordered container and
        the input's own focus ring is suppressed — the container's border colour already
        carries focus, and letting both render drew a second rectangle inside the first.
      */}
      <label
        htmlFor="cote-r-input"
        className={`field-shell flex cursor-text flex-col gap-1 rounded border-[1.5px] bg-paper px-4 py-3.5 transition-colors focus-within:border-ultramarine ${
          showError ? "border-ember" : "border-ink/20"
        }`}
      >
        <span className="text-[11px] font-medium text-ink/50">{t("entry.label")}</span>
        <input
          id="cote-r-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setTouched(true)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          inputMode="decimal"
          autoComplete="off"
          autoFocus
          placeholder="28,4"
          aria-invalid={showError}
          aria-describedby="cote-r-help"
          className="w-full bg-transparent font-display text-[40px] font-bold leading-tight tracking-tight text-ink outline-none placeholder:text-ink/25 tabular-nums focus:outline-none focus-visible:outline-none"
        />
      </label>

      <p id="cote-r-help" className="mt-3 text-[13px] leading-relaxed text-ink/55">
        {showError ? (
          <span className="font-medium text-ember">{t("entry.invalid")}</span>
        ) : (
          t("entry.help")
        )}
      </p>
    </ScreenShell>
  );
}
