/**
 * Personal cote R calibration and projection.
 *
 * What this is. The official cote R is computed by the cégeps and the BCI from per-course
 * cote Z values corrected for group strength (IFG / IFPG) — inputs no student holds, which is
 * why this product never claims to compute an official cote R (docs/01-data-architecture.md,
 * guardrail #2). What a student does hold is their own history: for each finished session, the
 * grades they earned and the official cote R their cégep gave them. That pair is enough to fit
 * a personal, one-parameter model,
 *
 *     officialCoteR_s ≈ ratio × weightedMean(grades of session s)
 *
 * and to apply that ratio to the grades of a session in progress. The output is an ESTIMATE of
 * how the student's own score has historically tracked their grades — not a reproduction of the
 * BCI's calculation. Every function below says so in its own doc comment, and every screen that
 * shows the output must label it as such, with basis "uncalibrated" surfaced as a distinct
 * label so a student never mistakes the crude fallback for a fit against their own history.
 *
 * Pure module by design: no React, no clock, no store, no screen imports. Same input → same
 * output, which is what lets scripts/checks/calibration.check.ts pin its behaviour.
 *
 * The weighting convention (weight defaulting to 1, weighted mean = Σ w·x / Σ w) is the one
 * src/lib/rscore/impact.ts already uses, so a course row can feed both modules unchanged.
 */

export type SessionGrade = {
  /** The session this grade belongs to. Matched exactly against Confirmation.session. */
  session: number;
  course: string;
  /** Percentage grade, 0..100. Anything outside that range is ignored, not clamped. */
  grade: number;
  /**
   * Group statistics, when the bulletin carries them. The calibration model does not use
   * them — a cote Z needs the group's spread, which students rarely have — but the row keeps
   * them so the same data can drive impact.ts without reshaping.
   */
  groupAverage?: number | null;
  groupStdDev?: number | null;
  /** Course weighting (unités). Defaults to 1 when a cégep does not publish it. */
  weight?: number;
};

export type Confirmation = {
  session: number;
  /** The official cote R the cégep communicated for that session, 15..50. */
  officialCoteR: number;
};

/**
 * How the ratio was obtained. Callers must show "uncalibrated" as a distinct label: it means
 * the crude default, not a fit against the student's own confirmed history.
 */
export type CalibrationBasis = "uncalibrated" | "single_session" | "least_squares";

export type Calibration = {
  /** Estimated cote R per percentage point of weighted session mean. */
  ratio: number;
  basis: CalibrationBasis;
  /** Sessions that carried both a confirmation and at least one valid grade, ascending. */
  sessionsUsed: number[];
  /**
   * How far the confirmed scores sit from the FITTED ratio, in cote R points (root mean
   * square), measured before any clamping: it describes how well one ratio explains the
   * sessions, not how far the clamp moved it (`clamped` says that). A single session is
   * reproduced exactly by construction, so its residual is 0. null when nothing was fitted.
   */
  residual: number | null;
  /** True when the fitted ratio fell outside [RATIO_MIN, RATIO_MAX] and was pulled back in. */
  clamped: boolean;
};

export type Projection = {
  /** Estimated cote R, 2 decimals, or null when no valid grade was supplied. */
  value: number | null;
  basis: CalibrationBasis;
  /** Number of grades that actually entered the mean. */
  gradeCount: number;
};

export type WhatIfChange = { index: number; grade: number };

export type WhatIfResult = {
  before: number | null;
  after: number | null;
  /**
   * after − before, 2 decimals; null when either side has no value — except that a rejected
   * change (index out of range, invalid grade) always reports 0, even with no value on either
   * side: "nothing changed" is the honest answer to a change that was never applied.
   */
  delta: number | null;
};

/**
 * The crude shipped heuristic — a session average scaled into cote R range — and NOT the
 * ministry formula, which needs group statistics (moyenne, écart-type, IFG) the student rarely
 * has. It is only ever the fallback when no confirmed session exists to calibrate against.
 */
export const DEFAULT_RATIO = 0.334;

/**
 * Plausible bounds for a personal ratio. A confirmed cote R of 15..50 against a session mean
 * of roughly 50..100 puts real students well inside this window; a fit that lands outside it
 * is far more likely to be a mistyped grade or score than a real relationship, so the ratio is
 * pulled back in and the calibration says so via `clamped`.
 */
export const RATIO_MIN = 0.25;
export const RATIO_MAX = 0.5;

/** Valid percentage-grade range. Outside it a row is ignored. */
export const GRADE_MIN = 0;
export const GRADE_MAX = 100;

/**
 * Valid cote R range, for confirmations and for projected values alike. Mirrors the database
 * check on estimated_cote_r (15..50). Outside it a confirmation is ignored; a projection is
 * clamped into it.
 */
export const COTE_R_MIN = 15;
export const COTE_R_MAX = 50;

/**
 * The calibration used when no confirmed session exists: the crude default, labelled as such.
 * A shared constant — treat it as read-only (deriveCalibration hands out fresh objects).
 */
// Frozen too: a caller that pushed into the shared array would make every later uncalibrated
// result report sessions it never used.
const NO_SESSIONS = Object.freeze([]) as unknown as number[];

export const UNCALIBRATED: Readonly<Calibration> = Object.freeze({
  ratio: DEFAULT_RATIO,
  basis: "uncalibrated",
  sessionsUsed: NO_SESSIONS,
  residual: null,
  clamped: false,
});

function isValidWeight(weight: number | null | undefined): boolean {
  if (weight === undefined || weight === null) return true;
  return Number.isFinite(weight) && weight > 0;
}

/** A grade row counts only when its grade is a finite 0..100 and its weight, if any, is usable. */
function isValidGrade(row: SessionGrade): boolean {
  return (
    Number.isFinite(row.grade) &&
    row.grade >= GRADE_MIN &&
    row.grade <= GRADE_MAX &&
    isValidWeight(row.weight)
  );
}

function isValidConfirmation(c: Confirmation): boolean {
  return (
    Number.isFinite(c.session) &&
    Number.isFinite(c.officialCoteR) &&
    c.officialCoteR >= COTE_R_MIN &&
    c.officialCoteR <= COTE_R_MAX
  );
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Weighted mean of the valid rows (weight defaulting to 1), or null when none is valid. */
function weightedMean(rows: readonly SessionGrade[]): { mean: number; count: number } | null {
  let sum = 0;
  let totalWeight = 0;
  let count = 0;
  for (const row of rows) {
    if (!isValidGrade(row)) continue;
    const weight = row.weight ?? 1;
    sum += row.grade * weight;
    totalWeight += weight;
    count += 1;
  }
  if (count === 0 || totalWeight <= 0) return null;
  return { mean: sum / totalWeight, count };
}

function clampRatio(raw: number): { ratio: number; clamped: boolean } {
  const ratio = Math.min(RATIO_MAX, Math.max(RATIO_MIN, raw));
  return { ratio, clamped: ratio !== raw };
}

function uncalibrated(): Calibration {
  return { ratio: DEFAULT_RATIO, basis: "uncalibrated", sessionsUsed: [], residual: null, clamped: false };
}

/**
 * Fit the personal ratio from confirmed history. The result is the basis for ESTIMATES only:
 * nothing it produces is, or may be shown as, an official cote R.
 *
 * Only sessions that carry BOTH a valid confirmation (cote R 15..50) and at least one valid
 * grade (0..100) take part; everything else is ignored rather than guessed at. With no such
 * session the crude default comes back, basis "uncalibrated". With one, the ratio is exactly
 * cote ÷ mean and `residual` is 0. With two or more, it is the least-squares line through the
 * origin, Σ(cote_s·mean_s) / Σ(mean_s²), and `residual` says how well that fitted ratio
 * explains the sessions. Only then is the ratio clamped to [RATIO_MIN, RATIO_MAX], with
 * `clamped` recording whether it moved — the residual always describes the fit, not the clamp.
 *
 * When one session appears in several confirmations, the LAST one in input order wins: a
 * re-entered score is taken as a correction of the earlier one. A session whose weighted mean
 * is 0 cannot identify a ratio and is skipped.
 */
export function deriveCalibration(
  confirmations: readonly Confirmation[],
  grades: readonly SessionGrade[],
): Calibration {
  const coteBySession = new Map<number, number>();
  for (const c of confirmations) {
    if (!isValidConfirmation(c)) continue;
    coteBySession.set(c.session, c.officialCoteR); // last wins
  }
  if (coteBySession.size === 0) return uncalibrated();

  const gradesBySession = new Map<number, SessionGrade[]>();
  for (const row of grades) {
    if (!Number.isFinite(row.session) || !isValidGrade(row)) continue;
    const bucket = gradesBySession.get(row.session);
    if (bucket) bucket.push(row);
    else gradesBySession.set(row.session, [row]);
  }

  const points: { session: number; mean: number; cote: number }[] = [];
  for (const [session, cote] of coteBySession) {
    const rows = gradesBySession.get(session);
    if (!rows) continue;
    const stats = weightedMean(rows);
    if (stats === null || stats.mean <= 0) continue;
    points.push({ session, mean: stats.mean, cote });
  }
  points.sort((a, b) => a.session - b.session);

  if (points.length === 0) return uncalibrated();
  const sessionsUsed = points.map((p) => p.session);

  if (points.length === 1) {
    const [{ mean, cote }] = points;
    const raw = cote / mean;
    if (!Number.isFinite(raw)) return uncalibrated();
    const { ratio, clamped } = clampRatio(raw);
    // One point is reproduced exactly by the fitted ratio, so the fit's residual is 0.
    return { ratio, basis: "single_session", sessionsUsed, residual: 0, clamped };
  }

  let numerator = 0;
  let denominator = 0;
  for (const { mean, cote } of points) {
    numerator += cote * mean;
    denominator += mean * mean;
  }
  const fitted = numerator / denominator;
  if (!Number.isFinite(fitted)) return uncalibrated();

  // Residual of the fitted ratio, before clamping: fit quality, not clamp distance.
  let squares = 0;
  for (const { mean, cote } of points) {
    const error = cote - fitted * mean;
    squares += error * error;
  }
  const residual = Math.sqrt(squares / points.length);
  const { ratio, clamped } = clampRatio(fitted);
  return { ratio, basis: "least_squares", sessionsUsed, residual, clamped };
}

/**
 * A calibration whose ratio is not a finite number (e.g. one rehydrated from persisted JSON
 * that lost the field) cannot project anything honestly under its own basis, so it degrades
 * to the crude default — ratio DEFAULT_RATIO, basis "uncalibrated" — exactly what the student
 * would get with no calibration at all. deriveCalibration never produces such an object.
 */
function usable(calibration: Readonly<Calibration>): { ratio: number; basis: CalibrationBasis } {
  if (Number.isFinite(calibration.ratio)) return { ratio: calibration.ratio, basis: calibration.basis };
  return { ratio: DEFAULT_RATIO, basis: "uncalibrated" };
}

/**
 * Apply a calibration to a set of grades and return an ESTIMATED cote R — never an official
 * one. The grades are treated as one session (pass a single session's rows); the weighted
 * mean is scaled by `calibration.ratio`, clamped to [COTE_R_MIN, COTE_R_MAX] and rounded to 2
 * decimals. `value` is null when no valid grade was supplied. `basis` is passed through so the
 * caller can label the number — "uncalibrated" must read differently from a fitted basis. A
 * calibration with a non-finite ratio is projected as uncalibrated (see `usable`), never as NaN.
 */
export function projectEstimate(
  calibration: Readonly<Calibration>,
  grades: readonly SessionGrade[],
): Projection {
  const { ratio, basis } = usable(calibration);
  const stats = weightedMean(grades);
  if (stats === null) return { value: null, basis, gradeCount: 0 };
  const raw = ratio * stats.mean;
  const value = round2(Math.min(COTE_R_MAX, Math.max(COTE_R_MIN, raw)));
  return { value, basis, gradeCount: stats.count };
}

/**
 * The ESTIMATED value before and after replacing one grade, for the what-if slider. Both
 * numbers are projections under the same calibration, so the comparison says how much the
 * estimate moves — nothing about what a university would do with it. An index outside the
 * array or a grade outside 0..100 changes nothing: `after` equals `before` and `delta` is 0.
 * The replaced row keeps its session, course and weight.
 */
export function whatIf(
  calibration: Readonly<Calibration>,
  grades: readonly SessionGrade[],
  change: WhatIfChange,
): WhatIfResult {
  const before = projectEstimate(calibration, grades).value;
  const { index, grade } = change;
  const indexInRange = Number.isInteger(index) && index >= 0 && index < grades.length;
  const gradeValid = Number.isFinite(grade) && grade >= GRADE_MIN && grade <= GRADE_MAX;
  if (!indexInRange || !gradeValid) return { before, after: before, delta: 0 };

  const next = grades.map((row, i) => (i === index ? { ...row, grade } : row));
  const after = projectEstimate(calibration, next).value;
  const delta = before === null || after === null ? null : round2(after - before);
  return { before, after, delta };
}

/**
 * Compatibility helper for the estimate screen, which has no confirmed history to fit against:
 * the uncalibrated projection over plain percentage grades. The result is an ESTIMATE from the
 * crude default ratio and must be labelled as uncalibrated wherever it is shown. Returns null
 * when no grade is a valid 0..100 number.
 */
export function estimateFromGrades(grades: readonly number[]): number | null {
  const rows: SessionGrade[] = grades.map((grade) => ({ session: 0, course: "", grade }));
  return projectEstimate(UNCALIBRATED, rows).value;
}
