"use client";

import { useMemo } from "react";
import {
  CalendarDays,
  BadgeCheck,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import { AppShell } from "@/components/app-shell/AppShell";
import { AxisRow } from "@/components/rscore/AxisRow";
import { SourceStamp } from "@/components/SourceStamp";
import { DASHBOARD_SAMPLE, DEADLINES } from "@/lib/sample-data";
import { classifySession, type ImpactBand } from "@/lib/rscore/impact";
import {
  getCutoffRange,
  compareToCutoffRange,
  formatRangeYears,
  CUTOFF_STATUS_LABEL_KEY,
  CUTOFF_STATUS_COLOR_CLASS,
} from "@/lib/rscore/cutoff-range";
import { useFormat } from "@/lib/i18n/useFormat";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const IMPACT: Record<
  ImpactBand,
  { key: TranslationKey; icon: typeof ArrowUp; className: string }
> = {
  strong: { key: "dash.high", icon: ArrowUp, className: "bg-moss/10 text-moss" },
  neutral: {
    key: "dash.neutral",
    icon: Minus,
    className: "border border-dashed border-ink/30 text-ink/55",
  },
  weak: { key: "dash.low", icon: ArrowDown, className: "bg-ember/10 text-ember" },
};

export default function DashboardPage() {
  const { t, locale } = useLocale();
  const f = useFormat();
  const {
    currentEstimate,
    currentSessionLabelFr,
    currentSessionLabelEn,
    confirmedSessions,
    currentCourses,
    goalProgram,
  } = DASHBOARD_SAMPLE;

  const sessionLabel = locale === "fr" ? currentSessionLabelFr : currentSessionLabelEn;
  const goalName = locale === "fr" ? goalProgram.nameFr : goalProgram.nameEn;
  const goalRange = getCutoffRange(goalProgram.cutoffHistory);
  const goalStatus = compareToCutoffRange(currentEstimate, goalRange);

  // Local arithmetic over three rows with memoization — never a network round-trip.
  const impacts = useMemo(
    () =>
      classifySession(
        currentCourses.map((c) => ({ grade: c.grade, groupAverage: c.groupAverage })),
      ),
    [currentCourses],
  );

  return (
    <AppShell rScore={currentEstimate}>
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-7 px-4 py-6">
        {/* Estimated score. The dashed frame is the confirmed-vs-estimated tell (guardrail #2). */}
        <section className="flex flex-col items-center gap-1 rounded border border-ink/12 bg-paper px-5 py-6 text-center shadow-card">
          <h1 className="font-display text-[17px] font-bold text-ink">
            {t("dash.estimateTitle")}
          </h1>
          <p className="text-[12.5px] text-ink/50">
            {t("dash.estimateBasis")} {sessionLabel}.
          </p>
          <div className="mt-4 flex min-w-[180px] flex-col items-center gap-1 rounded border border-dashed border-moss/60 px-5 py-3">
            <span className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-moss">
              <TrendingUp className="h-3.5 w-3.5" />
              {t("dash.estimated")}
            </span>
            <span className="font-display text-[40px] font-extrabold leading-none tracking-tight text-ultramarine tabular-nums">
              ≈ {f.score(currentEstimate, 2)}
            </span>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[17px] font-bold text-ink">
            {t("dash.officialSessions")}
          </h2>
          {confirmedSessions.map((s) => (
            <div
              key={s.sessionEn}
              className="flex items-center justify-between rounded border border-ink/12 border-l-4 border-l-ultramarine bg-paper px-4 py-3.5 shadow-card"
            >
              <div>
                <span className="block text-[10.5px] font-semibold uppercase tracking-wider text-ink/50">
                  {locale === "fr" ? s.sessionFr : s.sessionEn} · {t("dash.confirmed")}
                </span>
                <span className="font-display text-[26px] font-bold leading-tight text-ultramarine tabular-nums">
                  {f.score(s.score, 2)}
                </span>
              </div>
              <BadgeCheck className="h-7 w-7 text-ultramarine" />
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display text-[17px] font-bold text-ink">
              {t("dash.currentGrades")}
            </h2>
            <span className="text-[10.5px] font-semibold uppercase tracking-wider text-ink/50">
              {sessionLabel}
            </span>
          </div>
          <p className="-mt-1.5 text-[11.5px] leading-relaxed text-ink/50">{t("dash.impactBasis")}</p>
          <div className="overflow-hidden rounded border border-ink/12 bg-paper shadow-card">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-ink/10 bg-chalk/60 text-[10px] font-semibold uppercase tracking-wider text-ink/50">
                  <th className="px-3 py-2.5">{t("dash.course")}</th>
                  <th className="px-2 py-2.5 text-right">{t("dash.grade")}</th>
                  <th className="px-3 py-2.5 text-right">{t("dash.impact")}</th>
                </tr>
              </thead>
              <tbody>
                {currentCourses.map((course, i) => {
                  const impact = IMPACT[impacts[i].band];
                  return (
                    <tr key={course.code} className="border-b border-ink/10 last:border-b-0">
                      <td className="px-3 py-3">
                        <div className="text-[13.5px] font-semibold leading-snug text-ink">
                          {locale === "fr" ? course.nameFr : course.nameEn}
                        </div>
                        <div className="mt-0.5 text-[11px] text-ink/45 tabular-nums">
                          {course.code}
                        </div>
                      </td>
                      <td className="px-2 py-3 text-right text-[13.5px] font-semibold text-ink tabular-nums">
                        {course.grade}%
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${impact.className}`}
                        >
                          <impact.icon className="h-3 w-3" />
                          {t(impact.key)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded border border-ink/12 bg-paper p-4 shadow-card">
          <h2 className="flex items-center gap-2 font-display text-[17px] font-bold text-ink">
            <CalendarDays className="h-[18px] w-[18px]" />
            {t("dash.importantDates")}
          </h2>
          <ul className="relative flex flex-col gap-5 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-ink/12">
            {DEADLINES.map((d) => (
              <li key={d.id} className="relative pl-6">
                <span
                  className={`absolute left-0 top-1 h-2.5 w-2.5 rounded-full ring-4 ring-paper ${
                    d.urgent ? "bg-ember" : "bg-ultramarine"
                  }`}
                />
                <div
                  className={`text-[11.5px] font-semibold ${
                    d.urgent ? "text-ember" : "text-ink/50"
                  }`}
                >
                  {f.date(d.dateIso)}
                  {d.urgent && ` — ${t("dash.tomorrow")}`}
                </div>
                <div className="mt-0.5 text-[14px] font-semibold text-ink">
                  {locale === "fr" ? d.titleFr : d.titleEn}
                </div>
                <div className="text-[12.5px] leading-relaxed text-ink/55">
                  {locale === "fr" ? d.detailFr : d.detailEn}
                </div>
                <SourceStamp
                  date={d.lastVerifiedAt}
                  href={d.sourceUrl}
                  className="mt-1"
                />
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3 rounded border border-ink/12 bg-paper p-4 shadow-card">
          <h2 className="font-display text-[17px] font-bold text-ink">
            {t("dash.programGoal")}
          </h2>
          <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
            <span className="font-semibold text-ink">{goalName}</span>
            <span className="text-ink/55 tabular-nums">
              {goalRange
                ? `${t("cutoff.publishedRange")} ${formatRangeYears(goalRange)} : ${f.score(goalRange.low)}–${f.score(goalRange.high)}`
                : t("cutoff.unverified")}
            </span>
          </div>

          {/* Position on the distribution, never a progress bar: a cote R is a rank in a
              cohort, and a bar would read the gap as a failure to fill. */}
          <AxisRow score={currentEstimate} range={goalRange} />

          <div className="flex justify-between text-[11.5px] text-ink/55 tabular-nums">
            <span>
              {t("dash.yourEst")} : ≈ {f.score(currentEstimate)}
            </span>
            <span className={`font-semibold ${CUTOFF_STATUS_COLOR_CLASS[goalStatus]}`}>
              {t(CUTOFF_STATUS_LABEL_KEY[goalStatus])}
            </span>
          </div>
          <SourceStamp date={goalProgram.lastVerifiedAt} href={goalProgram.sourceUrl} />
        </section>
      </div>
    </AppShell>
  );
}
