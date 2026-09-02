"use client";

import { useEffect } from "react";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Error boundary for the funnel. Before it existed a thrown error anywhere in onboarding hit
 * the root boundary with no way back; now the step re-renders in place and the student keeps
 * what they had typed (it is in localStorage the moment they tapped a choice).
 */
export default function OnboardingError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const { t } = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ScreenShell
      backHref="/onboarding"
      footer={
        <button
          type="button"
          onClick={() => retry()}
          className="flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98]"
        >
          {t("common.retry")}
        </button>
      }
    >
      <ScreenHeading title={t("error.title")} body={t("error.body")} />
    </ScreenShell>
  );
}
