"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Minus, Plus, RotateCcw } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { ScoreValue } from "@/components/rscore/ScoreValue";
import { deriveCalibration, projectEstimate, GRADE_MIN, GRADE_MAX } from "@/lib/rscore/calibration";
import type { CourseGradeEntry, ScoreConfirmation } from "@/lib/profile/store";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFormat } from "@/lib/i18n/useFormat";

/**
 * "Et si… ?" — move one grade a point at a time and watch the projected estimate move.
 *
 * GUARDRAIL #2: every number here is an estimate — framed, badged, prefixed by ScoreValue —
 * and the disclaimer says it is unofficial. GUARDRAIL #5: no wording ranks, recommends, or
 * implies a chance; it only reports what the number would become. Nothing is ever persisted:
 * the sheet holds its own overrides and forgets them on close.
 */
export function WhatIfSheet({
  open,
  onClose,
  grades,
  confirmations,
}: {
  open: boolean;
  onClose: () => void;
  grades: CourseGradeEntry[];
  confirmations: ScoreConfirmation[];
}) {
  const { t } = useLocale();
  const f = useFormat();
  const [overrides, setOverrides] = useState<Record<number, number>>({});

  const calibration = useMemo(() => deriveCalibration(confirmations, grades), [confirmations, grades]);
  const adjusted = useMemo(
    () => grades.map((g, i) => (i in overrides ? { ...g, grade: overrides[i] } : g)),
    [grades, overrides],
  );

  const before = projectEstimate(calibration, grades).value;
  const after = projectEstimate(calibration, adjusted).value;
  const delta = before === null || after === null ? null : after - before;

  const basisKey =
    calibration.basis === "uncalibrated"
      ? "estimate.uncalibrated"
      : calibration.sessionsUsed.length === 1
        ? "estimate.calibratedOne"
        : "estimate.calibratedMany";

  function bump(index: number, direction: 1 | -1) {
    setOverrides((prev) => {
      const current = index in prev ? prev[index] : grades[index].grade;
      const next = Math.min(GRADE_MAX, Math.max(GRADE_MIN, current + direction));
      return { ...prev, [index]: next };
    });
  }

  /** Typed entry beside the steppers: 62 to 88 was 26 taps. Clamped to the same bounds. */
  function setDirect(index: number, raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (digits === "") return;
    const next = Math.min(GRADE_MAX, Math.max(GRADE_MIN, Number(digits)));
    setOverrides((prev) => ({ ...prev, [index]: next }));
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t("dash.whatIf")}
      // One footer action. The sheet already closes from its X, the backdrop and Escape; a blue
      // "Fermer" beside it dressed a dismissal as the call to action.
      footer={
        <button
          type="button"
          onClick={() => setOverrides({})}
          className="flex h-12 w-full items-center justify-center gap-1.5 rounded-full border border-ink/20 text-[14px] font-semibold text-ink tap-spring"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {t("common.reset")}
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-[13px] leading-relaxed text-ink/60">{t("dash.whatIfBody")}</p>

        <ul className="flex flex-col gap-2.5">
          {grades.map((g, index) => {
            const value = index in overrides ? overrides[index] : g.grade;
            const label = g.course || `${t("est.course")} ${index + 1}`;
            return (
              <li
                key={index}
                className="flex items-center justify-between gap-3 rounded-lg border border-ink/10 bg-paper px-3 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-ink">{label}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label={t("dash.whatIfDecrease").replace("{course}", label)}
                    onClick={() => bump(index, -1)}
                    disabled={value <= GRADE_MIN}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/15 text-ink tap-spring disabled:opacity-30"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    aria-label={label}
                    value={value}
                    onChange={(e) => setDirect(index, e.target.value)}
                    className="h-12 w-14 rounded border border-ink/15 bg-paper text-center text-[15px] font-bold text-ink tabular-nums outline-none focus:border-[1.5px] focus:border-ultramarine"
                  />
                  <button
                    type="button"
                    aria-label={t("dash.whatIfIncrease").replace("{course}", label)}
                    onClick={() => bump(index, 1)}
                    disabled={value >= GRADE_MAX}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/15 text-ink tap-spring disabled:opacity-30"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-center gap-3 rounded-xl border border-ink/12 bg-chalk/30 px-4 py-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10.5px] font-semibold uppercase tracking-wider text-ink/45">
              {t("dash.whatIfBefore")}
            </span>
            {before === null ? (
              <span className="text-[20px] font-bold text-ink/40">—</span>
            ) : (
              <ScoreValue value={before} status="estimated" size="lg" framed badge="always" decimals={2} />
            )}
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-ink/35" aria-hidden="true" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10.5px] font-semibold uppercase tracking-wider text-ink/45">
              {t("dash.whatIfAfter")}
            </span>
            {after === null ? (
              <span className="text-[20px] font-bold text-ink/40">—</span>
            ) : (
              <ScoreValue value={after} status="estimated" size="lg" framed badge="always" decimals={2} />
            )}
          </div>
        </div>

        <p aria-live="polite" className="text-center text-[12.5px] text-ink/60">
          {delta !== null && (
            <>
              {t("dash.whatIfChange")} : <span className="font-semibold tabular-nums">{f.signedScore(delta, 2)}</span>
            </>
          )}
        </p>

        <p className="text-center text-[11px] text-ink/45">
          {t(basisKey).replace("{n}", String(calibration.sessionsUsed.length))}
        </p>
        <p className="rounded-lg bg-ember/[0.06] px-3 py-2 text-center text-[11.5px] leading-relaxed text-ink/60">
          {t("estimate.disclaimer")}
        </p>
      </div>
    </Sheet>
  );
}
