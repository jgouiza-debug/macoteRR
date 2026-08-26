"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, TriangleAlert } from "lucide-react";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { Sheet } from "@/components/ui/Sheet";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useOnboardingGuard } from "@/lib/profile/onboarding";

export default function KnowYourScorePage() {
  const { t } = useLocale();
  const router = useRouter();
  // "Help me estimate it" does not go straight to the estimator: an estimate is the one
  // number in this product that cannot be sourced, so the student reads why before they see
  // a figure they might otherwise take as fact.
  const [warningOpen, setWarningOpen] = useState(false);
  // Needs a cégep and a DEC before a score means anything.
  useOnboardingGuard("score");

  return (
    <ScreenShell backHref="/onboarding/program">
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

        <button
          type="button"
          onClick={() => setWarningOpen(true)}
          className="flex min-h-[64px] items-center justify-between gap-3 rounded border border-ink/15 bg-paper px-4 py-3.5 text-left text-[15px] font-semibold text-ink transition-transform active:scale-[0.99]"
        >
          {t("bif.no")}
          <ChevronRight className="h-5 w-5 flex-shrink-0 text-ink/40" />
        </button>
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
