"use client";

import { useEffect, useSyncExternalStore, type FormEvent } from "react";
import { Info, Plus, X } from "lucide-react";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { setSessionGrades, useStudentProfile, type CourseGradeEntry } from "@/lib/profile/store";
import { deriveCalibration, projectEstimate } from "@/lib/rscore/calibration";
import { ScoreValue } from "@/components/rscore/ScoreValue";
import { useOnboardingGuard } from "@/lib/profile/onboarding";
import { useFunnelNav } from "@/lib/profile/funnel-nav";
import { useHydrated } from "@/lib/hooks/useHydrated";

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
// Set by a successful submit: the next mount must start empty even when sessionStorage is
// blocked. Any other unmount (back-navigation, refresh) keeps the in-memory draft alive.
let draftSubmitted = false;

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

/**
 * Called once the estimate is on the profile. Only storage is cleared here, and nobody is
 * notified: the profile write already re-renders this screen before the route changes, and
 * dropping the in-memory rows now would flash three empty rows under the student's eyes on the
 * way out. The in-memory copy goes on unmount instead (see useDraftRows). Without any of this,
 * the next person on the same tab — after a sign-out or a deleted account — found someone
 * else's courses and grades pre-filled, and a student coming back later saw an old draft
 * presented as their current estimate.
 */
function clearDraftRows() {
  draftSubmitted = true;
  try {
    window.sessionStorage.removeItem(ROWS_STORAGE_KEY);
  } catch {
    /* storage blocked: nothing was mirrored there, and the memory copy is dropped on unmount */
  }
}

function useDraftRows() {
  const rows = useSyncExternalStore(subscribeDraft, getDraftRows, getServerDraftRows);
  // The in-memory rows survive an unmount unless a submit cleared the draft: then the next visit
  // starts empty (storage blocked or not), while a render still in flight is never yanked to
  // empty rows. An abandoned draft (back-navigation, refresh) is still restored.
  useEffect(
    () => () => {
      if (draftSubmitted) {
        draftRows = null;
        draftSubmitted = false;
      }
    },
    [],
  );
  return [rows, setDraftRows] as const;
}

/**
 * Step 3b: the estimate. A form so Enter in any grade field submits; the caveat sits in the
 * sticky footer, above the CTA, and cannot be dismissed — it is the one screen where the
 * product shows a number it cannot source.
 */
export function EstimateScoreScreen() {
  const { t } = useLocale();
  const { profile, update: updateProfile, sync } = useStudentProfile();
  const { hrefFor, finishStep } = useFunnelNav();
  const hydrated = useHydrated();
  const [rows, setRows] = useDraftRows();
  useOnboardingGuard("score");

  // The store's hydration snapshot is the empty profile, and a signed-in student's first
  // reconcile may still be pulling the server copy. Submitting on either writes
  // `currentSession: 1` over the session the server already has (and races the pull), so the
  // submit waits. Typing is fine meanwhile. Hooks all sit above this.
  const ready = hydrated && sync !== "syncing";

  // The session these grades belong to, and the entries the calibration engine reads.
  const session = profile.currentSession ?? 1;
  const entries: CourseGradeEntry[] = rows
    .map((r) => ({ session, course: r.name.trim(), grade: Number(r.grade) }))
    .filter((e) => Number.isFinite(e.grade) && e.grade > 0 && e.grade <= 100);

  // Calibrate against every confirmed session the student has, plus these grades for the
  // current one; with no confirmed history the calibration falls back to the crude ratio and
  // labels itself "uncalibrated". projectEstimate is the single source of the number and of
  // the "≈"/dashed/badge rule (through ScoreValue).
  const merged = profile.courseGrades.filter((g) => g.session !== session).concat(entries);
  const calibration = deriveCalibration(profile.confirmations, merged);
  const projection = projectEstimate(calibration, entries);
  const estimate = projection.value;
  const canSubmit = estimate !== null;

  const basisKey =
    calibration.basis === "uncalibrated"
      ? "estimate.uncalibrated"
      : calibration.sessionsUsed.length === 1
        ? "estimate.calibratedOne"
        : "estimate.calibratedMany";

  const update = (index: number, field: keyof Row, value: string) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (estimate === null || !ready) return;
    setSessionGrades(session, entries);
    updateProfile({
      rScore: estimate,
      rScoreStatus: "estimated",
      currentSession: session,
    });
    // Edit mode returns to where the student came from. In the funnel, the DEC was chosen in
    // step 2, so results already know which prerequisites this student covers and can go
    // straight up, score in the URL.
    finishStep(`/onboarding/results?score=${estimate}&status=estimated`);
    clearDraftRows();
  }

  return (
    <ScreenShell
      backHref={hrefFor("/onboarding/score")}
      step="score"
      footer={
        <div className="flex flex-col items-stretch gap-2.5">
          {/* The running total leads the footer: it has a fixed home whether or not a grade
              exists yet, so the layout never jumps when the first number lands. */}
          <div
            aria-live="polite"
            className="flex items-center justify-between gap-3 rounded-xl border border-ink/12 bg-paper px-4 py-2.5 text-[13px] text-ink/70"
          >
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="font-semibold text-ink">{t("est.current")}</span>
              <span className="text-[11px] leading-snug text-ink/50">
                {estimate !== null
                  ? `${t(basisKey).replace("{n}", String(calibration.sessionsUsed.length))}${calibration.clamped ? ` ${t("estimate.clamped")}` : ""}`
                  : t("est.needsGrade")}
              </span>
            </span>
            {estimate !== null ? (
              // GUARDRAIL #2 lives in ScoreValue: "≈" + dashed frame + badge for an estimate.
              <ScoreValue value={estimate} status="estimated" size="md" framed badge="always" />
            ) : (
              <span
                aria-hidden="true"
                className="inline-flex flex-shrink-0 items-center rounded-xl border border-dashed border-ink/25 px-4 py-2.5 font-display text-[20px] font-extrabold leading-none text-ink/30 tabular-nums"
              >
                ≈ —
              </span>
            )}
          </div>

          {/* Non-dismissible, and always on screen with the CTA: an estimate never leaves this
              screen without the reason it cannot be trusted next to it (guardrail #2). */}
          <div role="note" className="flex items-start gap-2.5 rounded bg-ink/[0.04] p-3">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink/45" aria-hidden />
            <p className="text-[12px] leading-relaxed text-ink/60">{t("est.caveat")}</p>
          </div>

          <button
            type="submit"
            form={FORM_ID}
            disabled={!canSubmit || !ready}
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
              <div key={index} className="flex items-center gap-3">
                <input
                  value={row.name}
                  onChange={(e) => update(index, "name", e.target.value)}
                  placeholder={t("est.coursePlaceholder")}
                  aria-label={`${t("est.course")} ${n}`}
                  autoComplete="off"
                  enterKeyHint="next"
                  className="h-12 min-w-0 flex-1 rounded border border-ink/15 bg-paper px-3 text-[16px] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-[1.5px] focus:border-ultramarine"
                />
                <input
                  value={row.grade}
                  onChange={(e) => update(index, "grade", e.target.value)}
                  placeholder="%"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  enterKeyHint="go"
                  aria-label={`${t("est.grade")} ${n}`}
                  className="h-12 w-20 rounded border border-ink/15 bg-paper px-3 text-right text-[16px] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-[1.5px] focus:border-ultramarine tabular-nums"
                />
                <button
                  type="button"
                  aria-label={`${t("est.remove")} ${courseName || n}`}
                  onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                  disabled={rows.length <= 1}
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink/55 transition-colors hover:bg-chalk active:text-ember disabled:opacity-30"
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
          className="mt-3 inline-flex min-h-[48px] w-fit items-center gap-1.5 rounded-full border border-ultramarine/30 px-4 text-[14px] font-semibold text-ultramarine tap-spring hover:bg-ultramarine/[0.06] disabled:opacity-40"
        >
          <Plus className="h-[18px] w-[18px]" aria-hidden />
          {t("est.addCourse")}
        </button>
      </form>
    </ScreenShell>
  );
}
