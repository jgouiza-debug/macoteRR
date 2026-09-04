"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ScreenShell } from "@/components/onboarding/ScreenShell";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { recordConfirmedScore, useStudentProfile } from "@/lib/profile/store";
import { useOnboardingGuard } from "@/lib/profile/onboarding";
import { useFunnelNav } from "@/lib/profile/funnel-nav";
import { useHydrated } from "@/lib/hooks/useHydrated";

const FORM_ID = "cote-r-form";

/**
 * Step 3a: the confirmed cote R. One input, one submit; Enter submits because it is a form,
 * not because a key handler imitates one.
 */
export function ConfirmScoreScreen() {
  const { t } = useLocale();
  const { profile, sync } = useStudentProfile();
  const { hrefFor, finishStep } = useFunnelNav();
  const hydrated = useHydrated();
  const inputRef = useRef<HTMLInputElement>(null);
  // Starts EMPTY. It used to default to "28,4", which meant a student could tap straight
  // through and get results for a number that was never theirs — in a product whose whole
  // premise is not showing people figures they can't trust.
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  useOnboardingGuard("score");

  // Focus the field only where a keyboard is already on the desk. On a phone, autofocus
  // raises the on-screen keyboard over the heading before the student has read it.
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
  }, []);

  // The store's hydration snapshot is the empty profile, and a signed-in student's first
  // reconcile may still be pulling the server copy. Submitting on either writes
  // `currentSession: 1` over the session the server already has (and races the pull), so the
  // submit waits. Typing is fine meanwhile. Hooks all sit above this.
  const ready = hydrated && sync !== "syncing";

  const numeric = Number(value.replace(",", "."));
  const isValid = Number.isFinite(numeric) && numeric >= 15 && numeric <= 50;
  const showError = touched && value.length > 0 && !isValid;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready) return;
    if (!isValid) {
      setTouched(true);
      return;
    }
    // Records the confirmed number AND appends it to the session history the calibration engine
    // reads (recordConfirmedScore does both through the same outbox path update() uses).
    recordConfirmedScore(profile.currentSession ?? 1, numeric);
    // Edit mode returns to where the student came from. In the funnel, the DEC was chosen in
    // step 2, so results already know which prerequisites this student covers and can go
    // straight up, score in the URL.
    finishStep(`/onboarding/results?score=${numeric}&status=confirmed`);
  }

  return (
    <ScreenShell
      backHref={hrefFor("/onboarding/score")}
      footer={
        <div className="flex flex-col items-center gap-2.5">
          <button
            type="submit"
            form={FORM_ID}
            disabled={!isValid || !ready}
            className="flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98] disabled:bg-ink/10 disabled:text-ink/45 disabled:shadow-none"
          >
            {t("entry.cta")}
          </button>
          <span className="text-center text-[12px] text-ink/50">{t("entry.noAccount")}</span>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} noValidate>
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
            ref={inputRef}
            id="cote-r-input"
            name="rScore"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => setTouched(true)}
            inputMode="decimal"
            autoComplete="off"
            enterKeyHint="go"
            placeholder={t("entry.placeholder")}
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
      </form>
    </ScreenShell>
  );
}
