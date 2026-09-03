/**
 * Shape guards for the profile store's grade/confirmation fields. Run under `npm run check:data`.
 * Mirrors the style of program-eligibility.check.ts: assert, exit 1 on the first failure.
 */
import assert from "node:assert/strict";
import {
  DEFAULT_PROFILE,
  normaliseProfile,
  normaliseCourseGrades,
  normaliseConfirmations,
  withConfirmation,
  withSessionGrades,
  type StudentProfile,
} from "@/lib/profile/store";

let ran = 0;
function check(label: string, fn: () => void) {
  fn();
  ran += 1;
  console.log(`  ok  ${label}`);
}

check("DEFAULT_PROFILE carries both arrays empty", () => {
  assert.deepEqual(DEFAULT_PROFILE.courseGrades, []);
  assert.deepEqual(DEFAULT_PROFILE.confirmations, []);
});

check("a legacy profile without the fields loads unchanged, with [] for both", () => {
  const legacy = { cegepId: "sainte-foy", cegepProgramId: "200.B0", selfTags: ["leadership"] } as Partial<StudentProfile>;
  const p = normaliseProfile(legacy);
  assert.equal(p.cegepId, "sainte-foy");
  assert.equal(p.cegepProgramId, "200.B0");
  assert.deepEqual(p.selfTags, ["leadership"]);
  assert.deepEqual(p.courseGrades, []);
  assert.deepEqual(p.confirmations, []);
});

check("malformed grade rows are dropped; groupAverage kept only when finite", () => {
  const out = normaliseCourseGrades([
    { session: 1, course: "Calcul", grade: 88 },
    { session: 1, course: "Chimie", grade: 91, groupAverage: 75 },
    { session: 1, course: "Bad", grade: "x" },
    { session: "y", course: "Bad", grade: 80 },
    { session: 1, grade: 80 },
    { session: 1, course: "NaNavg", grade: 80, groupAverage: Number.NaN },
    "nonsense",
  ]);
  assert.equal(out.length, 3);
  assert.equal(out[0].groupAverage, undefined);
  assert.equal(out[1].groupAverage, 75);
  assert.equal(out[2].groupAverage, undefined);
});

check("malformed confirmations are dropped", () => {
  const out = normaliseConfirmations([
    { session: 1, officialCoteR: 30.2 },
    { session: 2, officialCoteR: "x" },
    { officialCoteR: 31 },
    null,
  ]);
  assert.deepEqual(out, [{ session: 1, officialCoteR: 30.2 }]);
});

check("withConfirmation replaces-or-appends and sorts by session", () => {
  let list = withConfirmation([], 3, 31.0);
  list = withConfirmation(list, 1, 28.0);
  list = withConfirmation(list, 3, 31.5); // replace session 3
  assert.deepEqual(list, [
    { session: 1, officialCoteR: 28.0 },
    { session: 3, officialCoteR: 31.5 },
  ]);
});

check("withSessionGrades replaces exactly one session and forces the session field", () => {
  const base = [
    { session: 1, course: "A", grade: 80 },
    { session: 2, course: "B", grade: 85 },
  ];
  const out = withSessionGrades(base, 1, [{ session: 99, course: "C", grade: 90 }]);
  assert.deepEqual(out, [
    { session: 1, course: "C", grade: 90 },
    { session: 2, course: "B", grade: 85 },
  ]);
});

console.log(`\n${ran} checks passed.`);
