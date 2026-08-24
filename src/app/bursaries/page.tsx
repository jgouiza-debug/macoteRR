"use client";

import { CheckCircle2, TrendingUp, Compass, CalendarDays, School, ExternalLink } from "lucide-react";
import { AppShell } from "@/components/app-shell/AppShell";
import { SourceStamp } from "@/components/SourceStamp";
import { BURSARIES, STUDENT_SAMPLE } from "@/lib/sample-data";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFormat } from "@/lib/i18n/useFormat";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const TIER_META: Record<
  "matched" | "close" | "explore",
  { title: TranslationKey; cta: TranslationKey; icon: typeof CheckCircle2; className: string }
> = {
  matched: {
    title: "burs.matched",
    cta: "burs.apply",
    icon: CheckCircle2,
    className: "text-moss",
  },
  close: { title: "burs.close", cta: "burs.details", icon: TrendingUp, className: "text-ember" },
  explore: {
    title: "burs.explore",
    cta: "burs.exploreCta",
    icon: Compass,
    className: "text-ink/55",
  },
};

const TIERS = ["matched", "close", "explore"] as const;

export default function BursariesPage() {
  const { t } = useLocale();
  const f = useFormat();

  return (
    <AppShell rScore={STUDENT_SAMPLE.rScoreEstimated}>
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-7 px-4 py-6">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[24px] font-bold text-ink">{t("burs.title")}</h1>
          <p className="text-[13px] text-ink/55">{STUDENT_SAMPLE.cegep.name}</p>
        </div>

        {TIERS.map((tier) => {
          const meta = TIER_META[tier];
          const items = BURSARIES.filter((b) => b.tier === tier);
          if (items.length === 0) return null;

          return (
            <section key={tier} className="flex flex-col gap-3">
              <h2
                className={`flex items-center gap-2 font-display text-[17px] font-bold ${meta.className}`}
              >
                <meta.icon className="h-[18px] w-[18px]" />
                {t(meta.title)}
              </h2>

              {items.map((bursary) => (
                <article
                  key={bursary.id}
                  className="flex flex-col gap-3 rounded border border-ink/12 bg-paper p-4 shadow-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="flex-1 text-[14px] font-semibold leading-snug text-ink">
                      {bursary.name}
                    </h3>
                    <span className="font-display text-[18px] font-bold text-ultramarine tabular-nums">
                      {f.amount(bursary.amount)}
                    </span>
                  </div>

                  <p className="text-[12px] text-ink/55">{bursary.sourceOrg}</p>

                  <div className="flex flex-wrap gap-2">
                    {bursary.tags.map((tag, i) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-chalk px-2.5 py-1 text-[11px] font-semibold text-ink/75"
                      >
                        {i === 0 && <School className="h-3 w-3" />}
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-ink/10 pt-3">
                    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-ink/55">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {f.date(bursary.deadlineIso, bursary.deadlinePrecision ?? "day")}
                    </span>
                    <a
                      href={bursary.applicationUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-[13px] font-semibold text-ultramarine"
                    >
                      {t(meta.cta)}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  <SourceStamp date={bursary.lastVerifiedAt} href={bursary.sourceUrl} />
                </article>
              ))}
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
