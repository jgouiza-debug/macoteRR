"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function KnowYourScorePage() {
  const { t } = useLocale();

  return (
    <ScreenShell backHref="/">
      <ScreenHeading title={t("bif.title")} body={t("bif.body")} />

      <div className="flex flex-col gap-3">
        <Link
          href="/onboarding/score/confirm"
          // No ultramarine tint fill here: `border-ultramarine bg-ultramarine/[0.07]` is what
          // "selected" looks like in the DEC picker, so reusing it for merely "recommended"
          // made this read as a choice already made. Border + text carry the emphasis instead.
          className="flex min-h-[64px] items-center justify-between gap-3 rounded border-[1.5px] border-ultramarine bg-paper px-4 py-3.5 text-[15px] font-semibold text-ultramarine transition-transform active:scale-[0.99]"
        >
          {t("bif.yes")}
          <ChevronRight className="h-5 w-5 flex-shrink-0" />
        </Link>

        <Link
          href="/onboarding/score/estimate"
          className="flex min-h-[64px] items-center justify-between gap-3 rounded border border-ink/15 bg-paper px-4 py-3.5 text-[15px] font-semibold text-ink transition-transform active:scale-[0.99]"
        >
          {t("bif.no")}
          <ChevronRight className="h-5 w-5 flex-shrink-0 text-ink/40" />
        </Link>
      </div>

      {/* Not mt-auto: that consumed all the free space and stranded the two choices at the
          top of the screen, defeating ScreenShell's vertical centring. */}
      <div className="flex justify-center pt-8">
        <Link
          href="/programs"
          className="max-w-[220px] text-center text-[14px] font-semibold leading-snug text-ultramarine"
        >
          {t("bif.justSeuils")}
        </Link>
      </div>
    </ScreenShell>
  );
}
