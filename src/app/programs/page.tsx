"use client";

import { useMemo, useState, memo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell/AppShell";
import { AxisRow } from "@/components/rscore/AxisRow";
import { SourceStamp } from "@/components/SourceStamp";
import { UNIVERSITY_PROGRAMS, STUDENT_SAMPLE, type UniversityProgram } from "@/lib/sample-data";
import { useFormat } from "@/lib/i18n/useFormat";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n/dictionary";

type Tier = "clears" | "close" | "far";

const TIER_LABEL: Record<Tier, TranslationKey> = {
  clears: "plist.clears",
  close: "plist.close",
  far: "plist.far",
};

const TIERS: Tier[] = ["clears", "close", "far"];

function tierOf(diff: number): Tier {
  if (diff >= 0) return "clears";
  if (diff >= -1.5) return "close";
  return "far";
}

const ProgramRow = memo(function ProgramRow({
  program,
  diff,
  rowTier,
  score,
}: {
  program: UniversityProgram;
  diff: number;
  rowTier: Tier;
  score: number;
}) {
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
            <p className="mt-0.5 text-[11.5px] text-ink/50">{program.institution}</p>
          </div>
          <div className="flex items-center gap-1.5 text-right">
            <div>
              <div className="text-[13px] font-semibold text-ink tabular-nums">
                {f.score(program.overallCutoff)}
              </div>
              <div
                className={`text-[11.5px] font-semibold tabular-nums ${
                  rowTier === "far" ? "text-ember" : "text-moss"
                }`}
              >
                {f.signedScore(diff)}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-ink/30" />
          </div>
        </div>
        <AxisRow score={score} cutoff={program.overallCutoff} />
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
  const [tier, setTier] = useState<Tier>("clears");

  const rows = useMemo(
    () =>
      UNIVERSITY_PROGRAMS.map((program) => {
        const diff = score - program.overallCutoff;
        return { program, diff, tier: tierOf(diff) };
      }).sort((a, b) => b.diff - a.diff),
    [score],
  );

  const counts: Record<Tier, number> = useMemo(() => {
    const res: Record<Tier, number> = { clears: 0, close: 0, far: 0 };
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

        <div className="grid grid-cols-3 gap-2.5">
          {TIERS.map((option) => {
            const active = tier === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setTier(option)}
                aria-pressed={active}
                className={`flex flex-col items-center justify-center gap-0.5 rounded px-2 py-3 text-center transition-transform active:scale-[0.97] ${
                  active
                    ? "bg-ultramarine text-paper shadow-card"
                    : "border border-ink/15 bg-paper text-ink/60"
                }`}
              >
                <span className="font-display text-[22px] font-bold tabular-nums">
                  {counts[option]}
                </span>
                <span className="text-[11px] font-semibold leading-tight">
                  {t(TIER_LABEL[option])}
                </span>
              </button>
            );
          })}
        </div>

        <div className="overflow-hidden rounded border border-ink/12 bg-paper shadow-card">
          {filtered.length === 0 && (
            <p className="p-6 text-center text-[13px] text-ink/50">{t("plist.empty")}</p>
          )}
          {filtered.map(({ program, diff, tier: rowTier }) => (
            <ProgramRow
              key={program.id}
              program={program}
              diff={diff}
              rowTier={rowTier}
              score={score}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
