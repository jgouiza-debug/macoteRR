"use client";

import { useMemo, useState, memo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell/AppShell";
import { AxisRow } from "@/components/rscore/AxisRow";
import { SourceStamp } from "@/components/SourceStamp";
import { UNIVERSITY_PROGRAMS, STUDENT_SAMPLE, type UniversityProgram } from "@/lib/sample-data";
import {
  getCutoffRange,
  compareToCutoffRange,
  formatRangeYears,
  CUTOFF_STATUS_ORDER,
  CUTOFF_STATUS_LABEL_KEY,
  CUTOFF_STATUS_COLOR_CLASS,
  type CutoffRange,
  type CutoffStatus,
} from "@/lib/rscore/cutoff-range";
import { useFormat } from "@/lib/i18n/useFormat";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const TIERS: CutoffStatus[] = ["above", "inside", "below", "unknown"];

const ProgramRow = memo(function ProgramRow({
  program,
  range,
  cutoffStatus,
  score,
}: {
  program: UniversityProgram;
  range: CutoffRange | null;
  cutoffStatus: CutoffStatus;
  score: number;
}) {
  const { t } = useLocale();
  const f = useFormat();

  return (
    <div className="border-b border-ink/10 last:border-b-0">
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
          <div className="flex items-center gap-1.5 text-right">
            <div>
              <div className="text-[13px] font-semibold text-ink tabular-nums">
                {range ? `${f.score(range.low)}–${f.score(range.high)}` : "—"}
              </div>
              <div
                className={`text-[10.5px] font-bold uppercase tracking-wide ${CUTOFF_STATUS_COLOR_CLASS[cutoffStatus]}`}
              >
                {t(CUTOFF_STATUS_LABEL_KEY[cutoffStatus])}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-ink/30" />
          </div>
        </div>
        <AxisRow score={score} range={range} />
      </Link>
      <SourceStamp
        date={program.lastVerifiedAt}
        href={program.sourceUrl}
        className="px-4 pb-3"
      />
    </div>
  );
});

export default function ProgramsPage() {
  const { t } = useLocale();
  const f = useFormat();
  const score = STUDENT_SAMPLE.rScoreEstimated;
  const [tier, setTier] = useState<CutoffStatus>("above");

  const rows = useMemo(
    () =>
      UNIVERSITY_PROGRAMS.map((program) => {
        const range = getCutoffRange(program.cutoffHistory);
        return { program, range, tier: compareToCutoffRange(score, range) };
      }).sort((a, b) => CUTOFF_STATUS_ORDER[a.tier] - CUTOFF_STATUS_ORDER[b.tier]),
    [score],
  );

  const counts: Record<CutoffStatus, number> = useMemo(() => {
    const res: Record<CutoffStatus, number> = { above: 0, inside: 0, below: 0, unknown: 0 };
    for (const row of rows) res[row.tier] += 1;
    return res;
  }, [rows]);

  const filtered = useMemo(
    () => rows.filter((row) => row.tier === tier),
    [rows, tier],
  );

  return (
    <AppShell rScore={score}>
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-5 px-4 py-6">
        <div className="rounded border border-ink/12 bg-paper px-4 py-3.5 shadow-card">
          <p className="text-[12px] text-ink/55">{t("plist.calcWith")}</p>
          <p className="mt-0.5 font-display text-[24px] font-bold text-ink tabular-nums">
            ≈ {f.score(score)}
          </p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {TIERS.map((option) => {
            const active = tier === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setTier(option)}
                aria-pressed={active}
                className={`flex flex-col items-center justify-center gap-0.5 rounded px-1.5 py-3 text-center transition-transform active:scale-[0.97] ${
                  active
                    ? "bg-ultramarine text-paper shadow-card"
                    : "border border-ink/15 bg-paper text-ink/60"
                }`}
              >
                <span className="font-display text-[20px] font-bold tabular-nums">
                  {counts[option]}
                </span>
                <span className="text-[10px] font-semibold leading-tight">
                  {t(CUTOFF_STATUS_LABEL_KEY[option])}
                </span>
              </button>
            );
          })}
        </div>

        <div className="overflow-hidden rounded border border-ink/12 bg-paper shadow-card">
          {filtered.length === 0 && (
            <p className="p-6 text-center text-[13px] text-ink/50">{t("plist.empty")}</p>
          )}
          {filtered.map(({ program, range, tier: rowTier }) => (
            <ProgramRow
              key={program.id}
              program={program}
              range={range}
              cutoffStatus={rowTier}
              score={score}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
