"use client";

import { useSyncExternalStore, type FormEvent } from "react";
import { Info, Plus, X } from "lucide-react";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFormat } from "@/lib/i18n/useFormat";
import { useStudentProfile } from "@/lib/profile/store";
import { useOnboardingGuard } from "@/lib/profile/onboarding";
import { useFunnelNav } from "@/lib/profile/funnel-nav";

type Row = { name: string; grade: string };

const FORM_ID = "estimate-form";
/** Per-tab draft of the rows, so a refresh or a detour to the warning sheet does not wipe them. */
const ROWS_STORAGE_KEY = "macote.estimate.rows";
const MAX_ROWS = 30;

const INITIAL_ROWS: Row[] = [
  { name: "", grade: "" },
  { name: "", grade: "" },
  { name: "", grade: "" },
];

// Deliberately crude: a session average scaled into cote R range. The real calibration
// engine (src/lib/rscore, Phase 4) replaces this once confirmed history exists to solve
// against. Labelled as an estimate everywhere it surfaces (guardrail #2).
function estimateFromGrades(grades: number[]): number {
  if (grades.length === 0) return 0;
  const average = grades.reduce((sum, g) => sum + g, 0) / grades.length;
  return Math.min(Math.max(average * 0.334, 15), 36);
}

/* ------------------------------------------------------------------ *
 * Draft rows: a sessionStorage-backed external store.
 *
 * Same shape as the profile store and the locale: `useSyncExternalStore` with a server
 * snapshot of the empty rows, so the hydration pass matches the server and the very next
 * render shows the draft. Reading storage in an effect and copying it into useState was the
 * alternative; that is a setState-in-effect cascade, and it also meant a render with the
 * wrong rows before the copy landed.
 * ------------------------------------------------------------------ */

function isRow(value: unknown): value is Row {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Row).name === "string" &&
    typeof (value as Row).grade === "string"
  );
}

/** The stored draft, or null when there is none or it does not look like rows. */
function readStoredRows(): Row[] | null {
  try {
    const raw = window.sessionStorage.getItem(ROWS_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    const rows = parsed.filter(isRow).slice(0, MAX_ROWS);
    return rows.length > 0 ? rows : null;
  } catch {
    return null;
  }
}

const draftListeners = new Set<() => void>();
/** In-memory truth for this tab once first read; storage is the mirror that survives a reload. */
let draftRows: Row[] | null = null;

function getDraftRows(): Row[] {
  draftRows ??= readStoredRows() ?? INITIAL_ROWS;
  return draftRows;
}

function getServerDraftRows(): Row[] {
  return INITIAL_ROWS;
}

function subscribeDraft(listener: () => void) {
  draftListeners.add(listener);
  return () => {
    draftListeners.delete(listener);
  };
}

function setDraftRows(next: Row[] | ((prev: Row[]) => Row[])) {
  draftRows = typeof next === "function" ? next(getDraftRows()) : next;
  try {
    window.sessionStorage.setItem(ROWS_STORAGE_KEY, JSON.stringify(draftRows));
  } catch {
    /* storage blocked or full: the draft is a convenience, not the record */
  }
  for (const listener of draftListeners) listener();
}

function useDraftRows() {
  const rows = useSyncExternalStore(subscribeDraft, getDraftRows, getServerDraftRows);
  return [rows, setDraftRows] as const;
}

/**
 * Step 3b: the estimate. A form so Enter in any grade field submits; the caveat sits in the
 * sticky footer, above the CTA, and cannot be dismissed — it is the one screen where the
 * product shows a number it cannot source.
 */
export function EstimateScoreScreen() {
  const { t } = useLocale();
  const f = useFormat();
  const { profile, update: updateProfile } = useStudentProfile();
  const { hrefFor, finishStep } = useFunnelNav();
  const [rows, setRows] = useDraftRows();
  useOnboardingGuard("score");

  const grades = rows
    .map((r) => Number(r.grade))
    .filter((g) => Number.isFinite(g) && g > 0 && g <= 100);
  const estimate = estimateFromGrades(grades);
  const canSubmit = grades.length > 0;

  const update = (index: number, field: keyof Row, value: string) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    const scoreVal = parseFloat(estimate.toFixed(2));
    updateProfile({
      rScore: scoreVal,
      rScoreStatus: "estimated",
      currentSession: profile.currentSession ?? 1,
    });
    // Edit mode returns to where the student came from. In the funnel, the DEC was chosen in
    // step 2, so results already know which prerequisites this student covers and can go
    // straight up, score in the URL.
    finishStep(`/onboarding/results?score=${scoreVal}&status=estimated`);
  }

  return (
    <ScreenShell
      backHref={hrefFor("/onboarding/score")}
      footer={
        <div className="flex flex-col items-stretch gap-2.5">
          {/* Non-dismissible, and always on screen with the CTA: an estimate never leaves this
              screen without the reason it cannot be trusted next to it (guardrail #2). */}
          <div role="note" className="flex items-start gap-2.5 rounded bg-ink/[0.04] p-3">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink/45" aria-hidden />
            <p className="text-[12px] leading-relaxed text-ink/60">{t("est.caveat")}</p>
          </div>

          {/* The CTA is disabled until at least one grade exists. Saying so beats leaving a
              student tapping a dimmed button with no idea what it wants from them. */}
          <p
            aria-live="polite"
            className="flex min-h-[24px] flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-center text-[12.5px] text-ink/60"
          >
            {canSubmit ? (
              <>
                <span>{t("est.current")} :</span>
                {/* "≈ " + dashed border + ESTIMATION badge, matching results and the
                    dashboard, so this number never looks like a confirmed one. */}
                <span className="inline-flex items-center gap-1.5 rounded border border-dashed border-moss/60 px-2 py-0.5">
                  <span className="font-display font-bold text-ink tabular-nums">
                    {`≈ ${f.score(estimate)}`}
                  </span>
                  <span className="rounded-full bg-moss/[0.08] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-moss">
                    {t("dash.estimated")}
                  </span>
                </span>
              </>
            ) : (
              <span className="text-ink/50">{t("est.needsGrade")}</span>
            )}
          </p>

          <button
            type="submit"
            form={FORM_ID}
            disabled={!canSubmit}
            className="flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            {t("est.cta")}
          </button>
        </div>
      }
    >
      <ScreenHeading title={t("est.title")} body={t("est.body")} />

      <form id={FORM_ID} onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-2.5">
          {rows.map((row, index) => {
            const n = index + 1;
            const courseName = row.name.trim();
            return (
              <div key={index} className="flex items-center gap-2">
                <input
                  value={row.name}
                  onChange={(e) => update(index, "name", e.target.value)}
                  placeholder={t("est.coursePlaceholder")}
                  aria-label={`${t("est.course")} ${n}`}
                  autoComplete="off"
                  className="h-12 min-w-0 flex-1 rounded border border-ink/15 bg-paper px-3 text-[16px] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-[1.5px] focus:border-ultramarine"
                />
                <input
                  value={row.grade}
                  onChange={(e) => update(index, "grade", e.target.value)}
                  placeholder="%"
                  type="number"
                  inputMode="numeric"
                  enterKeyHint="go"
                  aria-label={`${t("est.grade")} ${n}`}
                  className="h-12 w-20 rounded border border-ink/15 bg-paper px-3 text-right text-[16px] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-[1.5px] focus:border-ultramarine tabular-nums"
                />
                <button
                  type="button"
                  aria-label={`${t("est.remove")} ${courseName || n}`}
                  onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                  disabled={rows.length <= 1}
                  className="flex min-h-[48px] min-w-[48px] flex-shrink-0 items-center justify-center text-ink/35 transition-colors active:text-ember disabled:opacity-30"
                >
                  <X className="h-[18px] w-[18px]" aria-hidden />
                </button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, { name: "", grade: "" }])}
          disabled={rows.length >= MAX_ROWS}
          className="mt-3 flex min-h-[48px] w-fit items-center gap-1.5 text-[14px] font-semibold text-ultramarine active:scale-[0.98] disabled:opacity-40"
        >
          <Plus className="h-[18px] w-[18px]" aria-hidden />
          {t("est.addCourse")}
        </button>
      </form>
    </ScreenShell>
  );
}
