"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { InAppBrowserBanner } from "@/components/InAppBrowserBanner";
import { LangToggle } from "@/components/ui/LangToggle";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { ONBOARDING_STEPS, type OnboardingStep } from "@/lib/profile/onboarding";

/**
 * The funnel's only sticky element, and the only one that pads for the notch. The
 * in-app-browser banner renders inside it, above the bar row: as a sibling it was a second
 * `sticky top-0` with its own pt-safe, so the inset was applied twice and, once scrolled, the
 * banner covered the back button.
 */
export function OnboardingTopBar({
  backHref,
  onBack,
  brand = false,
  step,
}: {
  backHref?: string;
  onBack?: () => void;
  brand?: boolean;
  step?: OnboardingStep;
}) {
  const { t } = useLocale();
  const stepIndex = step ? ONBOARDING_STEPS.indexOf(step) : -1;

  return (
    <header className="sticky top-0 z-50 bg-chalk/90 backdrop-blur-sm pt-safe">
      <InAppBrowserBanner inline />
      <div className="mx-auto flex h-14 w-full max-w-[430px] items-center justify-between px-5">
        {brand ? (
          <span className="font-display text-[19px] font-bold tracking-tight text-ink">
            MaCote
          </span>
        ) : onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label={t("common.back")}
            className="-ml-1 flex min-h-[48px] min-w-[48px] items-center justify-center text-ink"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 bg-paper transition-colors active:bg-ink/10">
              <ChevronLeft className="h-6 w-6" />
            </span>
          </button>
        ) : backHref ? (
          <Link
            href={backHref}
            aria-label={t("common.back")}
            className="-ml-1 flex min-h-[48px] min-w-[48px] items-center justify-center text-ink"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 bg-paper transition-colors active:bg-ink/10">
              <ChevronLeft className="h-6 w-6" />
            </span>
          </Link>
        ) : (
          // Same footprint as the 48px back button, so the toggle does not shift between steps.
          <span className="h-12 w-12" aria-hidden="true" />
        )}
        {/* Where the student is in a five-step funnel. Nothing said so before; the only
            progress signal was the quiz's "question n of 4". */}
        {stepIndex >= 0 && (
          <p className="text-[12px] font-semibold uppercase tracking-wider text-ink/55 tabular-nums">
            {t("onb.stepOf")
              .replace("{n}", String(stepIndex + 1))
              .replace("{total}", String(ONBOARDING_STEPS.length))}
          </p>
        )}
        <LangToggle />
      </div>
    </header>
  );
}
