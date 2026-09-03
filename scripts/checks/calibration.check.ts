/**
 * Minimal runnable self-check for src/lib/rscore/calibration.ts.
 * No test framework by design — this repo has none. Run with:
 *
 *   npm run check:rscore   (or npx tsx scripts/checks/calibration.check.ts)
 *
 * Every fixture below is a TEST FIXTURE: made-up grades and made-up confirmed scores chosen
 * to exercise one branch each. Nothing here is a real student's data or a real cutoff.
 * The module is pure, so each check pins an exact behaviour: the crude fallback, the
 * single-session ratio, least squares over exact and noisy sessions, both clamp ends, the
 * validity filters, last-wins on duplicate confirmations, the null projection, the what-if
 * delta, and determinism. Any failure prints the check that failed and exits 1.
 */
import assert from "node:assert/strict";
import {
  COTE_R_MAX,
  COTE_R_MIN,
  DEFAULT_RATIO,
  RATIO_MAX,
  RATIO_MIN,
  UNCALIBRATED,
  deriveCalibration,
  estimateFromGrades,
  projectEstimate,
  whatIf,
  type Calibration,
  type Confirmation,
  type SessionGrade,
} from "../../src/lib/rscore/calibration";

let passed = 0;
function check(label: string, fn: () => void) {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n  FAIL  ${label}\n${message}\n`);
    process.exit(1);
  }
  passed += 1;
  console.log(`  ok  ${label}`);
}

/** Build one session's rows from plain grades, weight 1 each. */
function session(n: number, grades: number[], weight?: number): SessionGrade[] {
  return grades.map((grade, i) => ({
    session: n,
    course: `course-${n}-${i + 1}`,
    grade,
    ...(weight === undefined ? {} : { weight }),
  }));
}

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** The crude estimator exactly as the estimate screen shipped it (clamped at 36 on top). */
function crudeEstimator(grades: number[]): number {
  if (grades.length === 0) return 0;
  return Math.min(Math.max(mean(grades) * 0.334, 15), 36);
}

const EPSILON = 1e-9;
/** Two decimals of rounding leave at most half a hundredth between our value and a raw one. */
const HALF_CENT = 0.005 + EPSILON;

console.log("calibration self-check\n");

// --- the uncalibrated fallback ----------------------------------------------------------
check("DEFAULT_RATIO is the crude shipped ratio and UNCALIBRATED carries it", () => {
  assert.equal(DEFAULT_RATIO, 0.334);
  assert.equal(UNCALIBRATED.ratio, DEFAULT_RATIO);
  assert.equal(UNCALIBRATED.basis, "uncalibrated");
  assert.deepEqual([...UNCALIBRATED.sessionsUsed], []);
  assert.equal(UNCALIBRATED.residual, null);
  assert.equal(UNCALIBRATED.clamped, false);
});

check("deriveCalibration with nothing to fit returns the uncalibrated default", () => {
  assert.deepEqual(deriveCalibration([], []), {
    ratio: DEFAULT_RATIO,
    basis: "uncalibrated",
    sessionsUsed: [],
    residual: null,
    clamped: false,
  });
  // A confirmation with no grades in its session is not enough either.
  assert.equal(deriveCalibration([{ session: 1, officialCoteR: 28 }], []).basis, "uncalibrated");
  // Nor are grades with no confirmation.
  assert.equal(deriveCalibration([], session(1, [80, 85])).basis, "uncalibrated");
  // Nor a confirmation and grades that live in different sessions.
  assert.equal(
    deriveCalibration([{ session: 2, officialCoteR: 28 }], session(1, [80, 85])).basis,
    "uncalibrated",
  );
});

check("uncalibrated fallback equals the crude estimator on the same grades (modulo the 50 clamp)", () => {
  const sets = [[75], [80, 85, 90], [55, 62, 71, 68], [100, 100, 100], [40, 45], [0, 100]];
  for (const grades of sets) {
    const ours = estimateFromGrades(grades);
    assert.ok(ours !== null, `null for ${JSON.stringify(grades)}`);
    // Our value is rounded to 2 decimals; the crude one is not.
    assert.ok(
      Math.abs(ours - crudeEstimator(grades)) <= HALF_CENT,
      `${ours} vs crude ${crudeEstimator(grades)} for ${JSON.stringify(grades)}`,
    );
  }
  // The floors agree: the crude one clamps at 15 and so do we.
  assert.equal(estimateFromGrades([0]), COTE_R_MIN);
  // With 0..100 grades the crude ceiling of 36 is never reached (100 × 0.334 = 33.4), so the
  // only difference between the two is the ceiling itself: ours is the database's 50.
  assert.equal(estimateFromGrades([100]), 33.4);
  assert.equal(COTE_R_MAX, 50);
});

check("estimateFromGrades ignores invalid grades and returns null when none is valid", () => {
  assert.equal(estimateFromGrades([]), null);
  assert.equal(estimateFromGrades([NaN, -1, 101, Infinity]), null);
  assert.equal(estimateFromGrades([80, NaN, 101]), estimateFromGrades([80]));
});

// --- single session ------------------------------------------------------------------
check("single session: ratio is exactly cote ÷ mean, residual 0, not clamped", () => {
  const grades = session(1, [80, 90, 70]); // mean 80
  const cal = deriveCalibration([{ session: 1, officialCoteR: 28 }], grades);
  assert.equal(cal.ratio, 28 / 80);
  assert.equal(cal.basis, "single_session");
  assert.deepEqual(cal.sessionsUsed, [1]);
  assert.equal(cal.residual, 0);
  assert.equal(cal.clamped, false);
  // Projecting the same session with its own calibration reproduces the confirmed value.
  assert.equal(projectEstimate(cal, grades).value, 28);
});

check("weighted mean follows impact.ts: weight defaults to 1, Σw·x / Σw", () => {
  const rows: SessionGrade[] = [
    { session: 1, course: "a", grade: 90, weight: 2 },
    { session: 1, course: "b", grade: 60, weight: 1 },
    { session: 1, course: "c", grade: 60 }, // weight defaults to 1
  ];
  // (180 + 60 + 60) / 4 = 75
  const cal = deriveCalibration([{ session: 1, officialCoteR: 30 }], rows);
  assert.ok(Math.abs(cal.ratio - 30 / 75) < EPSILON);
  const unweighted = deriveCalibration([{ session: 1, officialCoteR: 30 }], session(1, [90, 60, 60]));
  assert.ok(Math.abs(unweighted.ratio - 30 / 70) < EPSILON);
  assert.notEqual(cal.ratio, unweighted.ratio);
});

// --- least squares -----------------------------------------------------------------
const TRUE_RATIO = 0.31;
const EXACT_SESSIONS = [
  { n: 1, grades: [70, 72, 68] }, // mean 70
  { n: 2, grades: [80, 85, 75] }, // mean 80
  { n: 3, grades: [90, 88, 92] }, // mean 90
];
const exactGrades = EXACT_SESSIONS.flatMap((s) => session(s.n, s.grades));
const exactConfirmations: Confirmation[] = EXACT_SESSIONS.map((s) => ({
  session: s.n,
  officialCoteR: TRUE_RATIO * mean(s.grades),
}));

check("least squares over three exact sessions recovers the ratio to 1e-9 with ~0 residual", () => {
  const cal = deriveCalibration(exactConfirmations, exactGrades);
  assert.equal(cal.basis, "least_squares");
  assert.deepEqual(cal.sessionsUsed, [1, 2, 3]);
  assert.ok(Math.abs(cal.ratio - TRUE_RATIO) < 1e-9, `ratio ${cal.ratio}`);
  assert.ok(cal.residual !== null && cal.residual >= 0 && cal.residual < 1e-9, `residual ${cal.residual}`);
  assert.equal(cal.clamped, false);
});

check("least squares over noisy sessions lands within 0.02 of the ratio, residual > 0", () => {
  const noise = [0.4, -0.3, 0.2];
  const noisy: Confirmation[] = exactConfirmations.map((c, i) => ({
    session: c.session,
    officialCoteR: c.officialCoteR + noise[i],
  }));
  const cal = deriveCalibration(noisy, exactGrades);
  assert.equal(cal.basis, "least_squares");
  assert.ok(Math.abs(cal.ratio - TRUE_RATIO) < 0.02, `ratio ${cal.ratio}`);
  assert.ok(cal.residual !== null && cal.residual > 0, `residual ${cal.residual}`);
  assert.ok(cal.residual < Math.max(...noise.map(Math.abs)) + EPSILON, `residual ${cal.residual}`);
  assert.equal(cal.clamped, false);
});

check("sessionsUsed is ascending whatever the input order", () => {
  const cal = deriveCalibration([...exactConfirmations].reverse(), [...exactGrades].reverse());
  assert.deepEqual(cal.sessionsUsed, [1, 2, 3]);
  assert.ok(Math.abs(cal.ratio - TRUE_RATIO) < 1e-9);
});

// --- clamping ----------------------------------------------------------------------
check("a ratio above RATIO_MAX is clamped down and flagged", () => {
  // 45 / 60 = 0.75 → 0.5
  const grades = session(1, [60]);
  const cal = deriveCalibration([{ session: 1, officialCoteR: 45 }], grades);
  assert.equal(cal.ratio, RATIO_MAX);
  assert.equal(cal.clamped, true);
  assert.equal(cal.basis, "single_session");
  // The residual describes the fit, not the clamp: one session is always reproduced exactly.
  assert.equal(cal.residual, 0);
});

check("a ratio below RATIO_MIN is clamped up and flagged", () => {
  // 15 / 100 = 0.15 → 0.25
  const cal = deriveCalibration([{ session: 1, officialCoteR: 15 }], session(1, [100]));
  assert.equal(cal.ratio, RATIO_MIN);
  assert.equal(cal.clamped, true);
  assert.equal(cal.residual, 0);
});

check("least squares clamps too; the residual is the fitted ratio's misfit, measured before the clamp", () => {
  const cal = deriveCalibration(
    [
      { session: 1, officialCoteR: 48 },
      { session: 2, officialCoteR: 50 },
    ],
    [...session(1, [70]), ...session(2, [75])],
  );
  assert.equal(cal.basis, "least_squares");
  assert.equal(cal.ratio, RATIO_MAX);
  assert.equal(cal.clamped, true);
  // Fitted ratio 7110 / 10525 ≈ 0.6755 leaves errors of about ±0.7; the clamped 0.5 would
  // leave ~12.75. Pinning "< 1" pins the pre-clamp computation.
  const fitted = (48 * 70 + 50 * 75) / (70 * 70 + 75 * 75);
  const expected = Math.sqrt(((48 - fitted * 70) ** 2 + (50 - fitted * 75) ** 2) / 2);
  assert.ok(cal.residual !== null && cal.residual > 0 && cal.residual < 1, `residual ${cal.residual}`);
  assert.ok(cal.residual !== null && Math.abs(cal.residual - expected) < EPSILON, `residual ${cal.residual}`);
});

check("a ratio inside the window is left alone and not flagged", () => {
  const cal = deriveCalibration([{ session: 1, officialCoteR: 25 }], session(1, [100]));
  assert.equal(cal.ratio, 0.25);
  assert.equal(cal.clamped, false);
  const top = deriveCalibration([{ session: 1, officialCoteR: 40 }], session(1, [80]));
  assert.equal(top.ratio, 0.5);
  assert.equal(top.clamped, false);
});

// --- validity filters --------------------------------------------------------------
check("grades outside 0..100 and non-finite grades are ignored, not clamped", () => {
  const clean = deriveCalibration([{ session: 1, officialCoteR: 28 }], session(1, [80, 90, 70]));
  const dirty = deriveCalibration(
    [{ session: 1, officialCoteR: 28 }],
    [...session(1, [80, 90, 70]), ...session(1, [101, -1, NaN, Infinity, 1000])],
  );
  assert.deepEqual(dirty, clean);
  // 0 and 100 are inside the range and count.
  const edges = deriveCalibration([{ session: 1, officialCoteR: 25 }], session(1, [0, 100]));
  assert.equal(edges.basis, "single_session");
  assert.equal(edges.ratio, 0.5);
});

check("a row with an unusable weight is ignored, a missing weight counts as 1", () => {
  const clean = deriveCalibration([{ session: 1, officialCoteR: 28 }], session(1, [80, 90, 70]));
  const dirty = deriveCalibration(
    [{ session: 1, officialCoteR: 28 }],
    [
      ...session(1, [80, 90, 70]),
      { session: 1, course: "zero-weight", grade: 10, weight: 0 },
      { session: 1, course: "negative-weight", grade: 10, weight: -2 },
      { session: 1, course: "nan-weight", grade: 10, weight: NaN },
    ],
  );
  assert.deepEqual(dirty, clean);
});

check("confirmations outside 15..50 are ignored", () => {
  const grades = session(1, [80, 90, 70]);
  for (const bad of [14.99, 50.01, 0, -3, NaN, Infinity]) {
    const cal = deriveCalibration([{ session: 1, officialCoteR: bad }], grades);
    assert.equal(cal.basis, "uncalibrated", `cote ${bad} was used`);
  }
  // The boundaries themselves are valid.
  assert.equal(deriveCalibration([{ session: 1, officialCoteR: 15 }], session(1, [50])).basis, "single_session");
  assert.equal(deriveCalibration([{ session: 1, officialCoteR: 50 }], session(1, [100])).basis, "single_session");
});

check("a session whose only grades are invalid does not take part", () => {
  const cal = deriveCalibration(
    [
      { session: 1, officialCoteR: 28 },
      { session: 2, officialCoteR: 30 },
    ],
    [...session(1, [80, 90, 70]), ...session(2, [101, NaN])],
  );
  assert.equal(cal.basis, "single_session");
  assert.deepEqual(cal.sessionsUsed, [1]);
  assert.equal(cal.ratio, 28 / 80);
});

check("a session with a zero mean cannot identify a ratio and is skipped", () => {
  const cal = deriveCalibration([{ session: 1, officialCoteR: 20 }], session(1, [0, 0]));
  assert.equal(cal.basis, "uncalibrated");
  assert.equal(Number.isFinite(cal.ratio), true);
});

check("duplicate confirmations for one session: the last one in input order wins", () => {
  const grades = session(1, [80, 90, 70]); // mean 80
  const cal = deriveCalibration(
    [
      { session: 1, officialCoteR: 24 },
      { session: 1, officialCoteR: 28 },
    ],
    grades,
  );
  assert.equal(cal.ratio, 28 / 80);
  assert.deepEqual(cal.sessionsUsed, [1]);
  const reversed = deriveCalibration(
    [
      { session: 1, officialCoteR: 28 },
      { session: 1, officialCoteR: 24 },
    ],
    grades,
  );
  assert.equal(reversed.ratio, 24 / 80);
  // An invalid later entry does not overwrite a valid earlier one.
  const invalidLast = deriveCalibration(
    [
      { session: 1, officialCoteR: 28 },
      { session: 1, officialCoteR: 99 },
    ],
    grades,
  );
  assert.equal(invalidLast.ratio, 28 / 80);
});

// --- projection ---------------------------------------------------------------------
check("projectEstimate is null with no grades and carries the basis through", () => {
  assert.deepEqual(projectEstimate(UNCALIBRATED, []), {
    value: null,
    basis: "uncalibrated",
    gradeCount: 0,
  });
  const fitted = deriveCalibration([{ session: 1, officialCoteR: 28 }], session(1, [80]));
  assert.deepEqual(projectEstimate(fitted, []), { value: null, basis: "single_session", gradeCount: 0 });
  assert.deepEqual(projectEstimate(fitted, session(2, [NaN, 101])), {
    value: null,
    basis: "single_session",
    gradeCount: 0,
  });
});

check("projectEstimate clamps into 15..50, rounds to 2 decimals and counts only valid grades", () => {
  const half: Calibration = { ...UNCALIBRATED, ratio: RATIO_MAX, sessionsUsed: [] };
  assert.equal(projectEstimate(half, session(2, [100])).value, COTE_R_MAX);
  assert.equal(projectEstimate(UNCALIBRATED, session(2, [0, 10])).value, COTE_R_MIN);
  const p = projectEstimate(UNCALIBRATED, session(2, [77, 83, 91, NaN, 200]));
  // 0.334 × 83.666… = 27.9446… → 27.94
  assert.equal(p.value, 27.94);
  assert.equal(p.gradeCount, 3);
  assert.equal(p.basis, "uncalibrated");
});

check("a calibration with a non-finite ratio projects as uncalibrated, never as NaN", () => {
  const grades = session(2, [80]);
  const reference = projectEstimate(UNCALIBRATED, grades);
  for (const ratio of [NaN, Infinity, -Infinity, undefined as unknown as number]) {
    const broken: Calibration = { ratio, basis: "least_squares", sessionsUsed: [1, 2], residual: 0.3, clamped: false };
    const p = projectEstimate(broken, grades);
    assert.deepEqual(p, reference, `ratio ${ratio}`);
    assert.ok(p.value !== null && Number.isFinite(p.value));
    assert.equal(p.basis, "uncalibrated");
    const w = whatIf(broken, grades, { index: 0, grade: 90 });
    assert.ok(w.before !== null && w.after !== null && w.delta !== null);
    assert.ok(Number.isFinite(w.before) && Number.isFinite(w.after) && Number.isFinite(w.delta));
    assert.ok(w.delta > 0);
  }
  // Even with no grades the basis is reported honestly.
  assert.deepEqual(projectEstimate({ ...UNCALIBRATED, ratio: NaN, basis: "single_session" }, []), {
    value: null,
    basis: "uncalibrated",
    gradeCount: 0,
  });
});

// --- what-if -------------------------------------------------------------------------
check("whatIf: raising a grade moves the estimate up, lowering it moves it down", () => {
  const cal = deriveCalibration([{ session: 1, officialCoteR: 28 }], session(1, [80, 90, 70]));
  const current = session(2, [75, 80, 85]);
  const up = whatIf(cal, current, { index: 0, grade: 95 });
  assert.ok(up.before !== null && up.after !== null && up.delta !== null);
  assert.ok(up.after > up.before);
  assert.ok(up.delta > 0);
  assert.ok(Math.abs(up.delta - (up.after - up.before)) <= HALF_CENT);
  assert.equal(up.before, projectEstimate(cal, current).value);

  const down = whatIf(cal, current, { index: 2, grade: 50 });
  assert.ok(down.before !== null && down.after !== null && down.delta !== null);
  assert.ok(down.after < down.before);
  assert.ok(down.delta < 0);

  const same = whatIf(cal, current, { index: 1, grade: 80 });
  assert.equal(same.after, same.before);
  assert.equal(same.delta, 0);
});

check("whatIf: an out-of-range index or an invalid grade changes nothing", () => {
  const current = session(2, [75, 80, 85]);
  const before = projectEstimate(UNCALIBRATED, current).value;
  for (const change of [
    { index: 3, grade: 90 },
    { index: -1, grade: 90 },
    { index: 1.5, grade: 90 },
    { index: NaN, grade: 90 },
    { index: 0, grade: 101 },
    { index: 0, grade: -1 },
    { index: 0, grade: NaN },
  ]) {
    assert.deepEqual(whatIf(UNCALIBRATED, current, change), { before, after: before, delta: 0 }, JSON.stringify(change));
  }
});

check("whatIf keeps the replaced row's weight and leaves the input untouched", () => {
  const current: SessionGrade[] = [
    { session: 2, course: "heavy", grade: 60, weight: 3 },
    { session: 2, course: "light", grade: 60, weight: 1 },
  ];
  const snapshot = JSON.stringify(current);
  const heavy = whatIf(UNCALIBRATED, current, { index: 0, grade: 90 });
  const light = whatIf(UNCALIBRATED, current, { index: 1, grade: 90 });
  assert.ok(heavy.delta !== null && light.delta !== null && heavy.delta > light.delta);
  assert.equal(JSON.stringify(current), snapshot);
});

// --- determinism ---------------------------------------------------------------------
check("same input twice gives deep-equal output everywhere", () => {
  const noisy: Confirmation[] = exactConfirmations.map((c, i) => ({
    session: c.session,
    officialCoteR: c.officialCoteR + [0.4, -0.3, 0.2][i],
  }));
  assert.deepEqual(deriveCalibration(noisy, exactGrades), deriveCalibration(noisy, exactGrades));
  const cal = deriveCalibration(noisy, exactGrades);
  const current = session(4, [75, 80, 85]);
  assert.deepEqual(projectEstimate(cal, current), projectEstimate(cal, current));
  assert.deepEqual(whatIf(cal, current, { index: 0, grade: 95 }), whatIf(cal, current, { index: 0, grade: 95 }));
  assert.deepEqual(estimateFromGrades([75, 80, 85]), estimateFromGrades([75, 80, 85]));
});

console.log(`\n${passed} checks passed.`);
