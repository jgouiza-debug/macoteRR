"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import { AxisRow } from "@/components/rscore/AxisRow";
import { ScoreValue } from "@/components/rscore/ScoreValue";
import { SourceStamp } from "@/components/SourceStamp";
import { EmptyState } from "@/components/ui/EmptyState";
import { useReferenceCatalog } from "@/lib/data/reference-store";
import { useTargets } from "@/lib/profile/useTargets";
import {
  getCutoffRange,
  compareToCutoffRange,
  formatRangeYears,
  CUTOFF_STATUS_LABEL_KEY,
  CUTOFF_STATUS_COLOR_CLASS,
  cutoffStatusLabelKey,
  cutoffRangeLabelKey,
  formatCutoffValues,
} from "@/lib/rscore/cutoff-range";
import { useFormat } from "@/lib/i18n/useFormat";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/** How long the "Retiré · Annuler" row stays before the removal is taken as final. */
const UNDO_WINDOW_MS = 6_000;

/**
 * The student's target programs, each against the published cutoff range, with a remove
 * button per row. Removal is undoable in place for six seconds: the row is swapped for a
 * "Retiré · Annuler" row rather than a toast, so the undo sits exactly where the programme was.
 *
 * All changes to the target list go through useTargets() so they reach the sync outbox.
 *
 * GUARDRAIL #5: status is the CUTOFF_STATUS_LABEL_KEY vocabulary only; a null range reads as
 * "not yet verified", never as open admission.
 */
export function TargetGoals({
  rScore,
  rScoreStatus,
}: {
  rScore: number | null;
  rScoreStatus: "confirmed" | "estimated" | null;
}) {
  const { t } = useLocale();
  const f = useFormat();
  const { ids, add, remove } = useTargets();
  const { universityPrograms } = useReferenceCatalog();
  const [removedId, setRemovedId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const undoRef = useRef<HTMLButtonElement>(null);

  const clearTimer = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  // Never let the timer fire into an unmounted component.
  useEffect(() => clearTimer, [clearTimer]);

  // The remove button the student just pressed is gone from the DOM; hand focus to the undo
  // so a keyboard user is not dropped on <body> and can reverse the removal with one key.
  useEffect(() => {
    if (removedId !== null) undoRef.current?.focus();
  }, [removedId]);

  const handleRemove = useCallback(
    (id: string) => {
      remove(id);
      clearTimer();
      setRemovedId(id);
      timer.current = setTimeout(() => {
        timer.current = null;
        setRemovedId(null);
      }, UNDO_WINDOW_MS);
    },
    [remove, clearTimer],
  );

  const handleUndo = useCallback(() => {
    if (removedId !== null) add(removedId);
    clearTimer();
    setRemovedId(null);
  }, [removedId, add, clearTimer]);

  // Catalogue order, so a programme restored by undo comes back to the same position.
  const rows = universityPrograms.filter((p) => ids.includes(p.id) || p.id === removedId);
  const isConfirmed = rScoreStatus === "confirmed";

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-ink/12 bg-paper p-4 shadow-card">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-[17px] font-bold text-ink">{t("dash.programGoal")}</h2>
          <Link
            href="/programs"
            className="-my-1 inline-flex min-h-[44px] items-center gap-1 rounded-full border border-ink/15 px-3 text-[12px] font-semibold text-ultramarine tap-spring hover:bg-chalk"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            {t("dash.addGoal")}
          </Link>
        </div>
        {rows.length > 0 && (
          <>
            <p className="text-[11px] text-ink/45">{t("dash.axisLegend")}</p>
            <p className="text-[11px] text-ink/45">{t("dash.removeHint")}</p>
          </>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          compact
          title={t("dash.noGoals")}
          action={{ href: "/programs", label: t("dash.addGoal") }}
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((program) => {
            const fullName = `${program.name} · ${program.institution}`;

            if (program.id === removedId && !ids.includes(program.id)) {
              return (
                <li
                  key={program.id}
                  role="status"
                  aria-live="polite"
                  className="flex min-h-[48px] items-center justify-between gap-3 border-t border-ink/10 pt-4 text-[13.5px] first:border-t-0 first:pt-0"
                >
                  <span className="text-ink/60">
                    {t("dash.removed")}
                    <span className="sr-only"> — {fullName}</span>
                    <span aria-hidden="true"> ·</span>
                  </span>
                  <button
                    ref={undoRef}
                    type="button"
                    onClick={handleUndo}
                    aria-label={t("dash.undoRemove").replace("{name}", fullName)}
                    className="-mr-3 flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full px-3 font-semibold text-ultramarine tap-spring hover:bg-chalk"
                  >
                    {t("common.undo")}
                  </button>
                </li>
              );
            }

            const range = getCutoffRange(program.cutoffHistory);
            const status = rScore !== null ? compareToCutoffRange(rScore, range) : null;

            return (
              <li
                key={program.id}
                className="flex flex-col gap-2 border-t border-ink/10 pt-4 first:border-t-0 first:pt-0"
              >
                <div className="flex items-start gap-1">
                  <Link
                    href={`/programs/${program.id}`}
                    className="-ml-2.5 flex min-w-0 flex-1 flex-col gap-2 rounded-lg p-2.5 transition-[transform,background-color] duration-150 hover:bg-chalk/40 active:bg-chalk/70 active:scale-[0.99]"
                  >
                    {/* Stacked, not side by side: on a phone the range label wrapped to three
                        lines beside the name and orphaned its colon. */}
                    <div className="flex flex-col gap-0.5 text-[13.5px]">
                      <span className="font-semibold text-ink">{fullName}</span>
                      <span className="text-[12.5px] text-ink/55 tabular-nums">
                        {range
                          ? `${t(cutoffRangeLabelKey(range))} ${formatRangeYears(range)} : ${formatCutoffValues(range, (v) => f.score(v))}`
                          : t("cutoff.unverified")}
                      </span>
                    </div>

                    <AxisRow score={rScore} range={range} />

                    {rScore !== null && status !== null && (
                      <div className="flex justify-between text-[11.5px] text-ink/55 tabular-nums">
                        <span>
                          {t(isConfirmed ? "dash.yourScore" : "dash.yourEst")} :{" "}
                          <ScoreValue value={rScore} status={rScoreStatus} size="inline" />
                        </span>
                        <span className={`font-semibold ${CUTOFF_STATUS_COLOR_CLASS[status]}`}>
                          {t(cutoffStatusLabelKey(status, range))}
                        </span>
                      </div>
                    )}
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(program.id)}
                    aria-label={t("dash.removeTarget").replace("{name}", fullName)}
                    className="inline-flex min-h-[48px] shrink-0 items-center gap-1 rounded-full border border-ink/15 px-3 text-[12px] font-semibold text-ink/60 tap-spring hover:bg-chalk hover:text-ink"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                    {t("common.remove")}
                  </button>
                </div>
                <SourceStamp date={program.lastVerifiedAt} href={program.sourceUrl} />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
