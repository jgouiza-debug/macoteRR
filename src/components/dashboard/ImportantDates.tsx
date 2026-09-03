"use client";

import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { SourceStamp } from "@/components/SourceStamp";
import { EmptyState } from "@/components/ui/EmptyState";
import { daysUntil } from "@/lib/dates";
import { getDeadlinesForStudent } from "@/lib/data/important-dates";
import { useReferenceCatalog } from "@/lib/data/reference-store";
import { useFormat } from "@/lib/i18n/useFormat";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/** Highlight a deadline in ember only when it's genuinely imminent. */
const URGENT_WITHIN_DAYS = 14;

const DATE_FILTERS = [
  { id: "all", labelKey: "dash.filterAll", maxDays: null },
  { id: "week", labelKey: "dash.filterWeek", maxDays: 7 },
  { id: "month", labelKey: "dash.filterMonth", maxDays: 30 },
  { id: "3months", labelKey: "dash.filter3Months", maxDays: 90 },
  { id: "year", labelKey: "dash.filterYear", maxDays: 365 },
] as const;

type DateFilter = (typeof DATE_FILTERS)[number]["id"];

/**
 * The deadlines that apply to this student, filtered by horizon. Urgency is DERIVED from
 * today's date, never read from a flag: a hardcoded `urgent` once rendered
 * "13 novembre — DEMAIN" in August, and telling a student a deadline is tomorrow when it is
 * months away is worse than silence.
 *
 * GUARDRAIL #1: every date carries its SourceStamp.
 */
export function ImportantDates({ targetProgramIds }: { targetProgramIds: string[] }) {
  const { t, locale } = useLocale();
  const f = useFormat();
  const { deadlines } = useReferenceCatalog();
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  const allDeadlines = useMemo(
    () => getDeadlinesForStudent(targetProgramIds, deadlines),
    [targetProgramIds, deadlines],
  );

  const filteredDeadlines = useMemo(() => {
    const filterDef = DATE_FILTERS.find((d) => d.id === dateFilter);
    if (!filterDef || filterDef.maxDays === null) return allDeadlines;
    const max = filterDef.maxDays;
    return allDeadlines.filter((d) => {
      const days = daysUntil(d.dateIso);
      return days !== null && days >= 0 && days <= max;
    });
  }, [allDeadlines, dateFilter]);

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-ink/12 bg-paper p-4 shadow-card">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-[17px] font-bold text-ink">
            <CalendarDays className="h-[18px] w-[18px]" aria-hidden="true" />
            {t("dash.importantDates")}
          </h2>
          <span aria-live="polite" className="text-[12px] font-semibold text-ink/50 tabular-nums">
            {t("dash.datesCount").replace("{n}", String(filteredDeadlines.length))}
          </span>
        </div>

        {/* Each chip keeps its compact look inside a 48px-tall button, so the hit area is
            honest without the row of filters growing into a row of pills. */}
        <div className="flex flex-wrap gap-x-1.5" role="group" aria-label={t("dash.importantDates")}>
          {DATE_FILTERS.map((fItem) => {
            const active = dateFilter === fItem.id;
            return (
              <button
                key={fItem.id}
                type="button"
                aria-pressed={active}
                onClick={() => setDateFilter(fItem.id)}
                className="group flex min-h-[48px] min-w-[48px] items-center justify-center tap-spring"
              >
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    active
                      ? "bg-ultramarine text-paper shadow-sm"
                      : "border border-ink/15 bg-paper text-ink/65 group-hover:bg-chalk"
                  }`}
                >
                  {t(fItem.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredDeadlines.length === 0 ? (
        <EmptyState
          compact
          title={t("dash.noDatesInRange")}
          action={
            dateFilter === "all"
              ? undefined
              : { onClick: () => setDateFilter("all"), label: t("dash.showAllDates") }
          }
        />
      ) : (
        <ul className="relative flex flex-col gap-5 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-ink/12">
          {filteredDeadlines.map((d) => {
            const days = daysUntil(d.dateIso);
            const isSoon = days !== null && days >= 0 && days <= URGENT_WITHIN_DAYS;
            const relative =
              days === null || !isSoon
                ? null
                : days === 0
                  ? t("dash.today")
                  : days === 1
                    ? t("dash.tomorrow")
                    : t("dash.inDays").replace("{n}", String(days));
            return (
              <li key={d.id} className="relative pl-6">
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-1 h-2.5 w-2.5 rounded-full ring-4 ring-paper ${
                    isSoon ? "bg-ember" : "bg-ultramarine"
                  }`}
                />
                <div className={`text-[11.5px] font-semibold ${isSoon ? "text-ember" : "text-ink/50"}`}>
                  {f.date(d.dateIso)}
                  {relative && ` — ${relative}`}
                </div>
                {/* titleFr/titleEn are the record's own bilingual data labels, not UI copy. */}
                <div className="mt-0.5 text-[14px] font-semibold text-ink">
                  {locale === "fr" ? d.titleFr : d.titleEn}
                </div>
                <div className="text-[12.5px] leading-relaxed text-ink/55">
                  {locale === "fr" ? d.detailFr : d.detailEn}
                </div>
                <SourceStamp date={d.lastVerifiedAt} href={d.sourceUrl} className="mt-1" />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
