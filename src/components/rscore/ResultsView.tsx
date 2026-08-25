"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DistributionCurve } from "@/components/rscore/DistributionCurve";
import { AxisRow } from "@/components/rscore/AxisRow";
import { SourceStamp } from "@/components/SourceStamp";
import { Logo } from "@/components/ui/Logo";
import { LangToggle } from "@/components/ui/LangToggle";
import { UNIVERSITY_PROGRAMS } from "@/lib/sample-data";
import {
  getCutoffRange,
  compareToCutoffRange,
  formatRangeYears,
  CUTOFF_STATUS_ORDER,
  CUTOFF_STATUS_LABEL_KEY,
  CUTOFF_STATUS_COLOR_CLASS,
} from "@/lib/rscore/cutoff-range";
import { useFormat } from "@/lib/i18n/useFormat";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function ResultsView({
  score,
  status,
}: {
  score: number;
  status: "confirmed" | "estimated";
}) {
  const { t, locale } = useLocale();
  const f = useFormat();

  const ranked = UNIVERSITY_PROGRAMS.map((program) => {
    const range = getCutoffRange(program.cutoffHistory);
    return { program, range, cutoffStatus: compareToCutoffRange(score, range) };
  }).sort((a, b) => CUTOFF_STATUS_ORDER[a.cutoffStatus] - CUTOFF_STATUS_ORDER[b.cutoffStatus]);

  const cleared = ranked.filter((r) => r.cutoffStatus === "above").length;
  // Anchors the hero chart on the first program with a verified range, so the headline
  // visual never fabricates a cross-program "average cutoff" from mismatched figure types.
  const hero = ranked.find((r) => r.range) ?? ranked[0];
  const heroRangeLabel = hero?.range
    ? `${t("common.seuil")} ${formatRangeYears(hero.range)}`
    : t("cutoff.unverified");

  const headline =
    locale === "fr"
      ? `${status === "confirmed" ? "Ta cote" : "Ton estimation"} de ${f.score(score)} dépasse le seuil publié dans ${cleared} programme${cleared === 1 ? "" : "s"} de notre base.`
      : `Your ${status === "confirmed" ? "score" : "estimate"} of ${f.score(score)} clears the published cutoff in ${cleared} program${cleared === 1 ? "" : "s"} in our database.`;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-chalk">
      <header className="sticky top-0 z-50 bg-chalk/90 backdrop-blur-sm pt-safe">
        <div className="mx-auto flex h-14 w-full max-w-[430px] items-center justify-between px-5">
          <Logo size={22} />
          <LangToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 px-5 pb-10 pt-3">
        <h1 className="font-display text-[24px] font-bold leading-[1.18] tracking-tight text-ink">
          {headline}
        </h1>

        <section className="rounded border border-ink/12 bg-paper p-4 shadow-card">
          <div className="mb-1 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] text-ink/50">{t("entry.label")}</p>
              <p className="font-display text-[24px] font-bold leading-tight text-ultramarine tabular-nums">
                {status === "estimated" && "≈ "}
                {f.score(score)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-ink/50">{t("cutoff.publishedRange")}</p>
              <p className="font-display text-[18px] font-bold leading-tight text-ink tabular-nums">
                {hero?.range ? `${f.score(hero.range.low)}–${f.score(hero.range.high)}` : "—"}
              </p>
            </div>
          </div>
          <DistributionCurve
            score={score}
            range={hero?.range ?? null}
            youLabel={t("common.toi")}
            rangeLabel={heroRangeLabel}
            animate
          />
        </section>

        <div className="overflow-hidden rounded border border-ink/12 bg-paper shadow-card">
          {ranked.slice(0, 4).map(({ program, range, cutoffStatus }) => (
            // SourceStamp renders its own <a>, so it stays a sibling of the row link —
            // an anchor inside an anchor is invalid HTML and breaks hydration.
            <div key={program.id} className="border-b border-ink/10 last:border-b-0">
              <Link
                href={`/programs/${program.id}`}
                className="flex flex-col gap-2.5 px-4 pb-2 pt-4 active:bg-chalk/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h2 className="text-[13.5px] font-semibold leading-snug text-ink">
                      {program.name}
                    </h2>
                    <p className="mt-0.5 text-[11.5px] text-ink/50">
                      {program.institution} ·{" "}
                      {range ? `${t("common.seuil")} ${formatRangeYears(range)}` : t("cutoff.unverified")}
                    </p>
                  </div>
                  <span className={`text-[12px] font-bold uppercase tracking-wide ${CUTOFF_STATUS_COLOR_CLASS[cutoffStatus]}`}>
                    {t(CUTOFF_STATUS_LABEL_KEY[cutoffStatus])}
                  </span>
                </div>
                <AxisRow score={score} range={range} />
              </Link>
              <SourceStamp
                date={program.lastVerifiedAt}
                href={program.sourceUrl}
                className="px-4 pb-3"
              />
            </div>
          ))}
        </div>

        <Link
          href="/onboarding/cegep"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98]"
        >
          {locale === "fr" ? "Voir les bourses de mon cégep" : "See my cégep's bursaries"}
          <ArrowRight className="h-[18px] w-[18px]" />
        </Link>
      </main>
    </div>
  );
}
