"use client";

import { memo, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { AppShell } from "@/components/app-shell/AppShell";
import { AxisRow } from "@/components/rscore/AxisRow";
import { SourceStamp } from "@/components/SourceStamp";
import { EmptyState } from "@/components/ui/EmptyState";
import { VirtualList } from "@/components/ui/VirtualList";
import type { UniversityProgram } from "@/lib/sample-data";
import { UNIVERSITIES, universityLabel } from "@/lib/data/universities";
import { useReferenceCatalog } from "@/lib/data/reference-store";
import {
  compareToCutoffRange,
  getCutoffRange,
  formatRangeYears,
  CUTOFF_STATUS_COLOR_CLASS,
  CUTOFF_STATUS_LABEL_KEY,
  CUTOFF_STATUS_ORDER,
  type CutoffRange,
  type CutoffStatus,
} from "@/lib/rscore/cutoff-range";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useStudentProfile } from "@/lib/profile/store";
import { withFunnelParams } from "@/lib/profile/funnel-nav";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFormat } from "@/lib/i18n/useFormat";
import { ScoreValue } from "@/components/rscore/ScoreValue";

const TIERS: CutoffStatus[] = ["above", "inside", "below", "unknown"];

/**
 * Every row is exactly this tall so the virtual list can place rows by index alone. Text
 * truncates instead of wrapping: a name cut short is still readable in full on its detail
 * page, whereas a row taller than its slot paints over the one below it.
 *   py-3 (24) + name (20) + institution line (18) + axis with margins (28) + status line (16)
 *   + source stamp with margin (22) = 128.
 */
const ROW_HEIGHT = 128;
const SKELETON_ROWS = 5;

type Row = { program: UniversityProgram; range: CutoffRange | null; tier: CutoffStatus };

const ProgramRow = memo(function ProgramRow({
  program,
  range,
  cutoffStatus,
  score,
  rScoreStatus,
  first,
}: {
  program: UniversityProgram;
  range: CutoffRange | null;
  cutoffStatus: CutoffStatus;
  score: number | null;
  rScoreStatus: "confirmed" | "estimated" | null;
  first: boolean;
}) {
  const { t } = useLocale();
  const f = useFormat();

  return (
    <div
      className={`flex h-full flex-col overflow-hidden px-4 py-3 transition-colors hover:bg-chalk/30 ${
        first ? "" : "border-t border-ink/10"
      }`}
    >
      <Link
        href={`/programs/${program.id}`}
        className="flex flex-col rounded tap-spring active:scale-[0.99]"
      >
        <span className="truncate text-[14px] font-semibold leading-5 text-ink">{program.name}</span>
        <div className="mt-0.5 flex items-baseline justify-between gap-3 text-[12px] leading-4 text-ink/55">
          <span className="shrink-0 font-medium">{universityLabel(program.institution)}</span>
          {/* GUARDRAIL #5: a null range is "not yet verified", never "open admission". */}
          <span className="min-w-0 truncate tabular-nums">
            {range
              ? `${t("cutoff.publishedRange")} ${formatRangeYears(range)} : ${f.score(range.low)}–${f.score(range.high)}`
              : t("cutoff.unverified")}
          </span>
        </div>

        <div className="my-2">
          <AxisRow score={score} range={range} />
        </div>

        <div className="flex justify-between gap-3 text-[11.5px] leading-4 text-ink/55 tabular-nums">
          {score !== null ? (
            <>
              {/* GUARDRAIL #2: ScoreValue marks an estimate; it never reads as the cégep's figure. */}
              <span className="truncate">
                {t(rScoreStatus === "confirmed" ? "dash.yourScore" : "dash.yourEst")} :{" "}
                <ScoreValue value={score} status={rScoreStatus} size="inline" />
              </span>
              <span className={`shrink-0 font-semibold ${CUTOFF_STATUS_COLOR_CLASS[cutoffStatus]}`}>
                {t(CUTOFF_STATUS_LABEL_KEY[cutoffStatus])}
              </span>
            </>
          ) : (
            <span className="truncate">{program.cohortLabel}</span>
          )}
        </div>
      </Link>

      {/* GUARDRAIL #1: the range figures above sit next to their source and verification date. */}
      <SourceStamp date={program.lastVerifiedAt} href={program.sourceUrl} className="mt-1 truncate" />
    </div>
  );
});

function SkeletonRows() {
  return (
    <div aria-busy="true">
      {Array.from({ length: SKELETON_ROWS }, (_, i) => (
        <div
          key={i}
          style={{ height: `${ROW_HEIGHT}px` }}
          className={`flex flex-col gap-2 px-4 py-3 ${i === 0 ? "" : "border-t border-ink/10"}`}
        >
          <div className="h-5 w-3/4 animate-pulse rounded bg-ink/8" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-ink/8" />
          <div className="my-2 h-3 w-full animate-pulse rounded bg-ink/5" />
          <div className="h-4 w-2/5 animate-pulse rounded bg-ink/8" />
        </div>
      ))}
    </div>
  );
}

export default function ProgramsPage() {
  const { t } = useLocale();
  const { profile, sync } = useStudentProfile();
  // The live catalogue, not the shipped constant: a cutoff re-verified and promoted after
  // this deploy reaches the list on the next boot.
  const { universityPrograms } = useReferenceCatalog();
  const hydrated = useHydrated();
  const [tier, setTier] = useState<CutoffStatus | "all">("all");
  const [selectedUniversity, setSelectedUniversity] = useState("all");
  const [query, setQuery] = useState("");

  // Public page: a visitor with no profile browses the whole catalogue and is never sent to
  // onboarding. What waits is the score-dependent content — the header figure, the tier
  // counts, the sort and each row's status line — until the store has left its hydration
  // snapshot and a signed-in student's first reconcile is done. Rendering rows against the
  // transient empty profile would label and order them for a student with no score, then
  // reshuffle them a frame later. Every hook sits above this point, on purpose.
  const settled = hydrated && sync !== "syncing";
  const score = settled ? profile.rScore : null;
  const isConfirmed = profile.rScoreStatus === "confirmed";
  const isVisitor = settled && profile.cegepId === null;

  const allRows = useMemo<Row[]>(() => {
    return universityPrograms.map((program) => {
      const range = getCutoffRange(program.cutoffHistory);
      const rowTier: CutoffStatus = score !== null ? compareToCutoffRange(score, range) : "unknown";
      return { program, range, tier: rowTier };
    }).sort((a, b) => CUTOFF_STATUS_ORDER[a.tier] - CUTOFF_STATUS_ORDER[b.tier]);
  }, [universityPrograms, score]);

  // Narrowed by the university chips and the search box, but NOT by the tier buttons — the
  // tier counts have to describe the same set the list below them shows. Counting all 237
  // programs while the list held 9 made the four numbers openly contradict "programmes
  // trouvés", so a student filtering to UQAR read "181 au-dessus" over a list of nine.
  const scopedRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows.filter((row) => {
      if (selectedUniversity !== "all" && row.program.institution !== selectedUniversity) {
        return false;
      }
      if (q) {
        return (
          row.program.name.toLowerCase().includes(q) ||
          row.program.institution.toLowerCase().includes(q) ||
          universityLabel(row.program.institution).toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allRows, selectedUniversity, query]);

  const counts: Record<CutoffStatus, number> = useMemo(() => {
    const res: Record<CutoffStatus, number> = { above: 0, inside: 0, below: 0, unknown: 0 };
    for (const row of scopedRows) res[row.tier] += 1;
    return res;
  }, [scopedRows]);

  // The tier buttons only exist with a score; a tier picked earlier must not keep filtering
  // an unlabelled list once the score is gone.
  const activeTier = score === null ? "all" : tier;

  const filtered = useMemo(
    () => (activeTier === "all" ? scopedRows : scopedRows.filter((row) => row.tier === activeTier)),
    [scopedRows, activeTier],
  );

  const keyExtractor = useCallback((row: Row) => row.program.id, []);
  const renderRow = useCallback(
    (row: Row, index: number) => (
      <ProgramRow
        program={row.program}
        range={row.range}
        cutoffStatus={row.tier}
        score={score}
        rScoreStatus={profile.rScoreStatus}
        first={index === 0}
      />
    ),
    [score, profile.rScoreStatus],
  );

  const clearFilters = () => {
    setQuery("");
    setSelectedUniversity("all");
    setTier("all");
  };

  const universityChips = [{ id: "all", label: t("goal.allUniversities") }, ...UNIVERSITIES];

  return (
    <AppShell
      rScore={score}
      rScoreStatus={profile.rScoreStatus}
      currentSession={settled ? profile.currentSession : null}
    >
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-5 px-4 py-6">
        {/* Score or exploration header */}
        <div className="rounded-xl border border-ink/12 bg-paper px-5 py-4 shadow-card">
          {!settled ? (
            <div aria-busy="true" className="flex flex-col gap-2">
              <div className="h-3.5 w-44 animate-pulse rounded bg-ink/8" />
              <div className="h-7 w-28 animate-pulse rounded bg-ink/8" />
            </div>
          ) : score !== null ? (
            <div>
              <p className="text-[12px] font-medium text-ink/55">{t("plist.calcWith")}</p>
              {/* GUARDRAIL #2 lives in ScoreValue: framed = dashed border + badge for an estimate. */}
              <div className="mt-1">
                <ScoreValue value={score} status={profile.rScoreStatus} size="lg" framed={!isConfirmed} className="text-ink" />
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[12px] font-medium text-ink/55">{t("plist.exploreTitle")}</p>
              <p className="mt-0.5 font-display text-[22px] font-bold text-ink">
                {t("plist.programCount").replace("{n}", String(universityPrograms.length))}
              </p>
              {isVisitor && (
                // ?next= brings the visitor back to the list they were browsing once the
                // funnel completes, instead of the default landing.
                <Link
                  href={withFunnelParams("/onboarding", { next: "/programs" })}
                  className="mt-1 inline-flex min-h-[48px] items-center text-[13px] font-semibold text-ultramarine underline-offset-2 hover:underline"
                >
                  {t("prog.noScoreYet")}
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t("goal.searchProgram")}
            placeholder={t("goal.searchProgram")}
            autoComplete="off"
            className="h-[48px] w-full rounded-xl border border-ink/20 bg-paper pl-11 pr-4 text-[16px] text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-[1.5px] focus:border-ultramarine"
          />
        </div>

        {/* Tier buttons, only once there is a score to compare against */}
        {score !== null && (
          <div className="grid grid-cols-4 gap-2">
            {TIERS.map((option) => {
              const active = activeTier === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTier(tier === option ? "all" : option)}
                  aria-pressed={active}
                  className={`flex h-[76px] flex-col items-center justify-between rounded-xl px-1.5 py-2.5 text-center tap-spring transition-transform ${
                    active
                      ? "bg-ultramarine text-paper shadow-card scale-[1.02]"
                      : "border border-ink/15 bg-paper text-ink/60 hover:border-ink/30"
                  }`}
                >
                  <span className="font-display text-[20px] font-bold tabular-nums leading-none">
                    {counts[option]}
                  </span>
                  <span className="text-[10px] font-semibold leading-tight line-clamp-2">
                    {t(CUTOFF_STATUS_LABEL_KEY[option])}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* University filter chips: one scrolling row, so 17 chips at a 48px hit height do not
            push the list below the fold. */}
        <div className="-mx-4 flex gap-2 overflow-x-auto overflow-y-hidden px-4 pb-1 [scrollbar-width:none]">
          {universityChips.map((uni) => {
            const isSelected = selectedUniversity === uni.id;
            return (
              <button
                key={uni.id}
                type="button"
                onClick={() => setSelectedUniversity(uni.id)}
                aria-pressed={isSelected}
                className={`min-h-[48px] shrink-0 whitespace-nowrap rounded-full px-4 text-[12px] font-semibold tap-spring ${
                  isSelected
                    ? "bg-ultramarine text-paper shadow-sm"
                    : "border border-ink/15 bg-paper text-ink/70 hover:bg-chalk"
                }`}
              >
                {uni.label}
              </button>
            );
          })}
        </div>

        {/* Results list */}
        <div className="overflow-hidden rounded-xl border border-ink/12 bg-paper shadow-card">
          <div className="flex items-center justify-between border-b border-ink/8 bg-chalk/30 px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider text-ink/55">
            <span>{t("plist.found")}</span>
            <span className="tabular-nums font-semibold" aria-live="polite">
              {settled ? filtered.length : ""}
            </span>
          </div>

          {!settled ? (
            <SkeletonRows />
          ) : filtered.length === 0 ? (
            <EmptyState
              title={t("plist.empty")}
              action={{ onClick: clearFilters, label: t("plist.clearFilters") }}
              compact
            />
          ) : (
            <VirtualList
              items={filtered}
              itemHeight={ROW_HEIGHT}
              keyExtractor={keyExtractor}
              renderItem={renderRow}
              scrollParent="window"
              overscan={4}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
