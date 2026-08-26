"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, memo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/app-shell/AppShell";
import { AxisRow } from "@/components/rscore/AxisRow";
import { SourceStamp } from "@/components/SourceStamp";
import { UNIVERSITY_PROGRAMS, type UniversityProgram } from "@/lib/sample-data";
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
import { useStudentProfile } from "@/lib/profile/store";
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
        className="flex flex-col gap-2.5 px-4 pb-2 pt-4 transition-all duration-150 hover:bg-chalk/30 active:bg-chalk/60 active:scale-[0.99]"
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
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-ink/30 transition-transform group-hover:translate-x-0.5" />
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
  const router = useRouter();
  const { t } = useLocale();
  const f = useFormat();
  // The student's OWN score, not STUDENT_SAMPLE — this screen was showing a hardcoded
  // "≈ 32,4" to every visitor while /dashboard showed their real confirmed number.
  const { profile } = useStudentProfile();
  const [tier, setTier] = useState<CutoffStatus>("above");

  // Same hydration-safe pattern as /dashboard: the first client render matches the server
  // snapshot (rScore: null) before correcting to the real localStorage value.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (hydrated && profile.rScore === null) router.replace("/onboarding");
  }, [hydrated, profile.rScore, router]);

  const score = profile.rScore;

  const rows = useMemo(
    () =>
      score === null
        ? []
        : UNIVERSITY_PROGRAMS.map((program) => {
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

  if (!hydrated || score === null) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-4 px-4 py-16 text-center">
          <p className="text-[14px] text-ink/60">{t("dash.noEstimate")}</p>
          <Link
            href="/onboarding"
            className="flex h-12 items-center justify-center rounded-full bg-ultramarine px-6 text-[14px] font-semibold text-paper shadow-card"
          >
            {t("dash.startOnboarding")}
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell rScore={score}>
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-5 px-4 py-6">
        <div className="rounded border border-ink/12 bg-paper px-4 py-3.5 shadow-card">
          <p className="text-[12px] text-ink/55">{t("plist.calcWith")}</p>
          <p className="mt-0.5 font-display text-[24px] font-bold text-ink tabular-nums">
            {profile.rScoreStatus !== "confirmed" && "≈ "}
            {f.score(score)}
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
                className={`flex flex-col items-center justify-center gap-0.5 rounded px-1.5 py-3 text-center tap-spring ${
                  active
                    ? "bg-ultramarine text-paper shadow-card scale-[1.02]"
                    : "border border-ink/15 bg-paper text-ink/60 hover:border-ink/30"
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
