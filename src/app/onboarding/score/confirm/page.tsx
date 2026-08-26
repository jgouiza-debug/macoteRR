"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenShell } from "@/components/onboarding/ScreenShell";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useStudentProfile } from "@/lib/profile/store";
import { useOnboardingGuard } from "@/lib/profile/onboarding";

export default function ConfirmScorePage() {
  const router = useRouter();
  const { t } = useLocale();
  const { update } = useStudentProfile();
  // Starts EMPTY. It used to default to "28,4", which meant a student could tap straight
  // through and get results for a number that was never theirs — in a product whose whole
  // premise is not showing people figures they can't trust.
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  useOnboardingGuard("score");

  const numeric = Number(value.replace(",", "."));
  const isValid = Number.isFinite(numeric) && numeric >= 15 && numeric <= 50;
  const showError = touched && value.length > 0 && !isValid;

  function submit() {
    if (!isValid) {
      setTouched(true);
      return;
    }
    update({ rScore: numeric, rScoreStatus: "confirmed" });
    // The DEC was chosen in step 2, so results already know which prerequisites this student
    // covers and can go straight up.
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
          <span className="text-[12px] text-ink/50">{t("entry.noAccount")}</span>
        </div>
      }
    >
      <h1 className="mb-6 pt-3 font-display text-[27px] font-bold leading-[1.15] tracking-tight text-ink">
        {t("entry.title")}
      </h1>

      <label
        htmlFor="cote-r-input"
        // field-shell: the global :focus-visible rule is unlayered, so it outranks Tailwind's
        // outline utilities and drew a second rectangle inside this one. The class moves the
        // focus ring onto the wrapper instead of removing it. See globals.css.
        className={`field-shell flex cursor-text flex-col gap-1 rounded border-[1.5px] bg-paper px-4 py-3.5 transition-colors ${
          showError ? "border-ember" : "border-ultramarine"
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
          className="w-full bg-transparent font-display text-[40px] font-bold leading-tight tracking-tight text-ink outline-none tabular-nums placeholder:text-ink/20"
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
