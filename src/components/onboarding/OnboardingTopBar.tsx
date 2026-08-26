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
  onBack?: () => void;
  brand?: boolean;
}) {
  const { t } = useLocale();

  return (
    <header className="sticky top-0 z-50 bg-chalk/90 backdrop-blur-sm pt-safe">
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
            className="-ml-2 flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-ink transition-colors active:bg-ink/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        ) : backHref ? (
          <Link
            href={backHref}
            aria-label={t("common.back")}
            className="-ml-2 flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-ink transition-colors active:bg-ink/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
        ) : (
          <span className="h-10 w-10" aria-hidden="true" />
        )}
        <LangToggle />
      </div>
    </header>
  );
}
