"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Info, Plus, X } from "lucide-react";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { StepProgress } from "@/components/onboarding/StepProgress";
import { useStudentProfile } from "@/lib/profile/store";
import { currentSessionId } from "@/lib/sample-data";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFormat } from "@/lib/i18n/useFormat";

type Row = { name: string; grade: string };

const INITIAL_ROWS: Row[] = [
  { name: "", grade: "" },
  { name: "", grade: "" },
  { name: "", grade: "" },
];

// Deliberately crude: a session average scaled into cote R range. The real calibration
// engine (src/lib/rscore, Phase 2) replaces this once confirmed history exists to solve
// against. Labelled as an estimate everywhere it surfaces (guardrail #2).
function estimateFromGrades(grades: number[]): number {
  if (grades.length === 0) return 0;
  const average = grades.reduce((sum, g) => sum + g, 0) / grades.length;
  return Math.min(Math.max(average * 0.334, 15), 36);
}

export default function EstimateScorePage() {
  const router = useRouter();
  const { t } = useLocale();
  const f = useFormat();
  const { profile, update: saveProfile } = useStudentProfile();
  const [rows, setRows] = useState<Row[]>(INITIAL_ROWS);

  const grades = rows
    .map((r) => Number(r.grade))
    .filter((g) => Number.isFinite(g) && g > 0 && g <= 100);
  const estimate = estimateFromGrades(grades);

  const update = (index: number, field: keyof Row, value: string) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));

  return (
    <ScreenShell
      backHref="/onboarding/score"
      footer={
        <div className="flex flex-col items-center gap-2.5">
          {grades.length > 0 && (
            <p className="text-[12.5px] text-ink/60">
              {t("est.current")} :{" "}
              <span className="font-display font-bold text-ink tabular-nums">
                ≈ {f.score(estimate)}
              </span>
            </p>
          )}
          <button
            type="button"
            disabled={grades.length === 0}
            onClick={() => {
              saveProfile({
                rScore: Number(estimate.toFixed(2)),
                rScoreStatus: "estimated",
                currentSession: profile.currentSession ?? currentSessionId(),
              });
              router.push(`/onboarding/results?score=${estimate.toFixed(2)}&status=estimated`);
            }}
            className="flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            {t("est.cta")}
          </button>
        </div>
      }
    >
      <StepProgress step="score" />
      <ScreenHeading title={t("est.title")} body={t("est.body")} />

      <div className="flex flex-col gap-2.5">
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              value={row.name}
              onChange={(e) => update(index, "name", e.target.value)}
              placeholder={t("est.coursePlaceholder")}
              aria-label={t("est.course")}
              className="h-12 min-w-0 flex-1 rounded border border-ink/15 bg-paper px-3 text-[15px] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-[1.5px] focus:border-ultramarine"
            />
            <input
              value={row.grade}
              onChange={(e) => update(index, "grade", e.target.value)}
              placeholder="%"
              type="number"
              inputMode="numeric"
              aria-label={t("est.grade")}
              className="h-12 w-20 rounded border border-ink/15 bg-paper px-3 text-right text-[15px] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-[1.5px] focus:border-ultramarine tabular-nums"
            />
            <button
              type="button"
              aria-label={t("est.remove")}
              onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
              disabled={rows.length <= 1}
              className="flex h-10 w-8 flex-shrink-0 items-center justify-center text-ink/35 transition-colors active:text-ember disabled:opacity-30"
            >
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, { name: "", grade: "" }])}
        className="mt-3 flex w-fit items-center gap-1.5 text-[14px] font-semibold text-ultramarine"
      >
        <Plus className="h-[18px] w-[18px]" />
        {t("est.addCourse")}
      </button>

      <div className="mb-4 mt-6 flex items-start gap-3 rounded bg-ink/[0.04] p-3.5">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink/45" />
        <p className="text-[12px] leading-relaxed text-ink/60">{t("est.caveat")}</p>
      </div>
    </ScreenShell>
  );
}
