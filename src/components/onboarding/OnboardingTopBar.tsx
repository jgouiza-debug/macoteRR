"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { LangToggle } from "@/components/ui/LangToggle";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function OnboardingTopBar({
  backHref,
  onBack,
  brand = false,
}: {
  backHref?: string;
  /**
   * For screens whose "back" is a step within the screen rather than a route — the quiz
   * walks three stages behind one URL. Takes precedence over `backHref` when both are set.
   */
  onBack?: () => void;
  brand?: boolean;
}) {
  const { t } = useLocale();

  const chevron = <ChevronLeft className="h-6 w-6" />;
  const backClass =
    "-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors active:bg-ink/10";

  return (
    <header className="sticky top-0 z-50 bg-chalk/90 backdrop-blur-sm pt-safe">
      <div className="mx-auto flex h-14 w-full max-w-[430px] items-center justify-between px-5">
        {brand ? (
          <span className="font-display text-[19px] font-bold tracking-tight text-ink">
            MaCote
          </span>
        ) : onBack ? (
          <button type="button" onClick={onBack} aria-label={t("common.back")} className={backClass}>
            {chevron}
          </button>
        ) : backHref ? (
          <Link href={backHref} aria-label={t("common.back")} className={backClass}>
            {chevron}
          </Link>
        ) : (
          <span className="h-10 w-10" aria-hidden="true" />
        )}
        <LangToggle />
      </div>
    </header>
  );
}
