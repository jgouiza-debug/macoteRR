"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LangToggle } from "@/components/ui/LangToggle";
import { DistributionCurve } from "@/components/rscore/DistributionCurve";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function MarketingHome() {
  const { t } = useLocale();

  const features = [
    { title: t("landing.f1t"), detail: t("landing.f1d") },
    { title: t("landing.f2t"), detail: t("landing.f2d") },
    { title: t("landing.f3t"), detail: t("landing.f3d") },
  ];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-chalk">
      <header className="sticky top-0 z-50 bg-chalk/90 backdrop-blur-sm pt-safe">
        <div className="mx-auto flex h-14 w-full max-w-[430px] items-center justify-between px-5">
          <span className="font-display text-[19px] font-bold tracking-tight text-ink">
            MaCote
          </span>
          <LangToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col px-5 pb-10 pt-3">
        <h1 className="font-display text-[29px] font-bold leading-[1.12] tracking-tight text-ink">
          {t("landing.title")}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink/60">{t("landing.body")}</p>

        <div className="mt-6 rounded border border-ink/12 bg-paper px-3 py-4">
          <DistributionCurve
            score={28.4}
            cutoff={27.5}
            youLabel={t("common.toi")}
            cutoffLabel={t("common.seuil")}
          />
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-ink/50">
          {t("landing.chartCaption")}
        </p>

        <Link
          href="/onboarding/score"
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98]"
        >
          {t("landing.cta")}
          <ArrowRight className="h-[18px] w-[18px]" />
        </Link>

        <div className="mt-7 overflow-hidden rounded border border-ink/12 bg-paper">
          {features.map((feature) => (
            <div key={feature.title} className="border-b border-ink/10 px-4 py-3.5 last:border-b-0">
              <h2 className="text-[14px] font-semibold leading-snug text-ink">{feature.title}</h2>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink/50">{feature.detail}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-[12.5px] text-ink/50">{t("landing.credit")}</p>
      </main>
    </div>
  );
}
