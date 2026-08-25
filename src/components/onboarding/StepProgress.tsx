"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * The funnel is mandatory end-to-end now, so it owes the student a visible sense of how much
 * is left. Five steps, named once here so no screen can drift out of sync with the count.
 */
export const ONBOARDING_STEPS = ["cegep", "program", "score", "quiz", "account"] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

export function StepProgress({ step }: { step: OnboardingStep }) {
  const { t } = useLocale();
  const index = ONBOARDING_STEPS.indexOf(step);
  const total = ONBOARDING_STEPS.length;

  return (
    <div className="mb-1 flex items-center gap-3 pt-1">
      <div className="flex flex-1 gap-1.5" aria-hidden="true">
        {ONBOARDING_STEPS.map((name, i) => (
          <span
            key={name}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= index ? "bg-ultramarine" : "bg-ink/12"
            }`}
          />
        ))}
      </div>
      <span className="text-[11px] font-semibold tabular-nums text-ink/45">
        {t("common.step").replace("{n}", String(index + 1)).replace("{total}", String(total))}
      </span>
    </div>
  );
}
