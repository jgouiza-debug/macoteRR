/**
 * Minimal runnable self-check for src/lib/matching/program-eligibility.ts.
 * No test framework by design — this repo has none. Run with:
 *
 *   npx tsx scripts/checks/program-eligibility.check.ts
 *
 * Fixtures below are TEST FIXTURES, not catalogue data — they exist to exercise branches that
 * the real catalogue does not currently contain (an unverified core holding courses, an
 * unmappable prerequisite name). Real DEC data lives in src/lib/data/cegep-catalog.ts. The
 * checks that assert on real data read it from the catalogue rather than restating it.
 */
import assert from "node:assert/strict";
import {
  evaluatePrerequisites,
  findDecCoreCourses,
  rankProgramsForStudent,
  resolvePrerequisiteCourseCode,
  type DecCoreCourses,
} from "../../src/lib/matching/program-eligibility";
import { CEGEP_DEC_PROGRAM_BY_CODE } from "../../src/lib/data/cegep-catalog";
import { UNIVERSITY_PROGRAMS } from "../../src/lib/sample-data";

/** 200.B0 Sciences de la nature — the real catalogue entry, carrying the full NY sequence. */
const SCIENCES_NATURE = CEGEP_DEC_PROGRAM_BY_CODE.get("200.B0");
assert.ok(SCIENCES_NATURE, "200.B0 missing from the catalogue");
assert.equal(SCIENCES_NATURE.coreCoursesVerified, true);
assert.equal(SCIENCES_NATURE.coreCourseCodes.length, 9);

/** 300.A0 Sciences humaines — verified as carrying none of the NY sequence. */
const SCIENCES_HUMAINES = CEGEP_DEC_PROGRAM_BY_CODE.get("300.A0");
assert.ok(SCIENCES_HUMAINES, "300.A0 missing from the catalogue");

/** 200.C0 — in the catalogue, but its core was never researched. */
const UNRESEARCHED = CEGEP_DEC_PROGRAM_BY_CODE.get("200.C0");
assert.ok(UNRESEARCHED, "200.C0 missing from the catalogue");
assert.equal(UNRESEARCHED.coreCoursesVerified, false);

const REQUIRES_CALCULUS = {
  prerequisites: [{ name: "Calcul différentiel", status: "met" as const }],
};

let passed = 0;
function check(label: string, fn: () => void) {
  fn();
  passed += 1;
  console.log(`  ok  ${label}`);
}

console.log("program-eligibility self-check\n");

// --- name → standard collegial course code -------------------------------------------
check("resolves the exact strings recorded in sample-data.ts", () => {
  assert.equal(resolvePrerequisiteCourseCode("Calcul différentiel"), "201-NYA-05");
  assert.equal(resolvePrerequisiteCourseCode("Calcul intégral"), "201-NYB-05");
  assert.equal(resolvePrerequisiteCourseCode("Algèbre linéaire"), "201-NYC-05");
  // Em dash, accents and casing all normalize away.
  assert.equal(resolvePrerequisiteCourseCode("Physique — Mécanique"), "203-NYA-05");
  assert.equal(resolvePrerequisiteCourseCode("physique mecanique"), "203-NYA-05");
});

check("refuses to guess a code for an unknown name", () => {
  assert.equal(resolvePrerequisiteCourseCode("Histoire de l'art"), null);
  // No substring fallback: this contains "Calcul intégral" but is not that course.
  assert.equal(resolvePrerequisiteCourseCode("Calcul intégral avancé II"), null);
});

// --- the three required cases --------------------------------------------------------
check("full NY sequence covers a program requiring Calcul différentiel → met", () => {
  const result = evaluatePrerequisites(SCIENCES_NATURE, REQUIRES_CALCULUS);
  assert.equal(result.status, "prerequisites_met");
  assert.deepEqual(result.reasons, [
    { kind: "prereq_covered", name: "Calcul différentiel", courseCode: "201-NYA-05" },
  ]);
  assert.equal(result.counts.covered, 1);
});

check("a DEC with no science courses does NOT cover it → partial, with the gap named", () => {
  const result = evaluatePrerequisites(SCIENCES_HUMAINES, REQUIRES_CALCULUS);
  assert.notEqual(result.status, "prerequisites_met");
  assert.equal(result.status, "prerequisites_partial");
  assert.deepEqual(result.reasons, [
    { kind: "prereq_not_in_core", name: "Calcul différentiel", courseCode: "201-NYA-05" },
  ]);
  assert.equal(result.counts.notInCore, 1);
});

check("a program with no recorded prerequisites → unknown, never met", () => {
  const result = evaluatePrerequisites(SCIENCES_NATURE, { prerequisites: [] });
  assert.equal(result.status, "prerequisites_unknown");
  assert.deepEqual(result.reasons, [{ kind: "no_prereqs_recorded" }]);
});

// --- coreCoursesVerified: the rule that stops an unresearched DEC inventing a gap -----
check("an UNVERIFIED core never produces a gap → unknown, not partial", () => {
  const result = evaluatePrerequisites(UNRESEARCHED, REQUIRES_CALCULUS);
  assert.equal(result.status, "prerequisites_unknown");
  assert.deepEqual(result.reasons, [
    { kind: "prereq_core_unverified", name: "Calcul différentiel", courseCode: "201-NYA-05" },
  ]);
  assert.equal(result.counts.notInCore, 0);
  assert.equal(result.counts.coreUnverified, 1);
});

check("an empty core is a real finding only when verified", () => {
  // Same empty course list, opposite flag → opposite honest answer.
  const base = { code: "fixture", coreCourseCodes: [] } as const;
  const verified: DecCoreCourses = { ...base, coreCoursesVerified: true };
  const unverified: DecCoreCourses = { ...base, coreCoursesVerified: false };
  assert.equal(evaluatePrerequisites(verified, REQUIRES_CALCULUS).status, "prerequisites_partial");
  assert.equal(
    evaluatePrerequisites(unverified, REQUIRES_CALCULUS).status,
    "prerequisites_unknown",
  );
});

check("a course PRESENT in an unverified core still counts as covered", () => {
  const fixture: DecCoreCourses = {
    code: "fixture-unverified-with-courses",
    coreCourseCodes: ["201-NYA-05"],
    coreCoursesVerified: false,
  };
  const result = evaluatePrerequisites(fixture, REQUIRES_CALCULUS);
  assert.equal(result.status, "prerequisites_met");
  assert.equal(result.counts.covered, 1);
});

// --- the other honesty paths ---------------------------------------------------------
check("no DEC at all → unknown, never partial", () => {
  const result = evaluatePrerequisites(null, REQUIRES_CALCULUS);
  assert.equal(result.status, "prerequisites_unknown");
  assert.deepEqual(result.reasons, [{ kind: "dec_unknown" }]);
  assert.equal(result.counts.recorded, 1);
});

check("an unresolvable prerequisite name blocks 'met'", () => {
  const result = evaluatePrerequisites(SCIENCES_NATURE, {
    prerequisites: [
      { name: "Calcul différentiel", status: "met" },
      { name: "Histoire de l'art", status: "met" },
    ],
  });
  assert.equal(result.status, "prerequisites_unknown");
  assert.equal(result.counts.covered, 1);
  assert.equal(result.counts.unmapped, 1);
});

check("a definite gap outranks an unresolvable name", () => {
  const result = evaluatePrerequisites(SCIENCES_HUMAINES, {
    prerequisites: [
      { name: "Calcul différentiel", status: "met" },
      { name: "Histoire de l'art", status: "met" },
    ],
  });
  assert.equal(result.status, "prerequisites_partial");
  assert.equal(result.counts.notInCore, 1);
  assert.equal(result.counts.unmapped, 1);
});

check("the hard-coded student-relative `status` field is ignored", () => {
  // Same DEC, same course, opposite recorded `status` — the computed answer must not move.
  const met = evaluatePrerequisites(SCIENCES_NATURE, {
    prerequisites: [{ name: "Algèbre linéaire", status: "met" }],
  });
  const missing = evaluatePrerequisites(SCIENCES_NATURE, {
    prerequisites: [{ name: "Algèbre linéaire", status: "missing" }],
  });
  assert.deepEqual(met, missing);
  assert.equal(met.status, "prerequisites_met");
});

// --- against the real catalogue ------------------------------------------------------
check("real catalogue: the 4 programs recording no prerequisites read as unknown", () => {
  const noPrereqs = UNIVERSITY_PROGRAMS.filter((p) => p.prerequisites.length === 0);
  assert.equal(noPrereqs.length, 4, "sample-data.ts changed — re-check this expectation");
  for (const program of noPrereqs) {
    assert.equal(evaluatePrerequisites(SCIENCES_NATURE, program).status, "prerequisites_unknown");
  }
});

check("real catalogue: every recorded prerequisite name resolves to a course code", () => {
  for (const program of UNIVERSITY_PROGRAMS) {
    for (const prerequisite of program.prerequisites) {
      assert.notEqual(
        resolvePrerequisiteCourseCode(prerequisite.name),
        null,
        `unmapped prerequisite name on ${program.id}: "${prerequisite.name}"`,
      );
    }
  }
});

check("real catalogue: 200.B0 covers both programs that record prerequisites", () => {
  for (const id of ["hec-baa", "poly-genie-logiciel"]) {
    const program = UNIVERSITY_PROGRAMS.find((p) => p.id === id);
    assert.ok(program, `${id} missing from sample-data.ts`);
    assert.equal(evaluatePrerequisites(SCIENCES_NATURE, program).status, "prerequisites_met");
  }
});

// --- DEC lookup ----------------------------------------------------------------------
check("findDecCoreCourses resolves by ministerial code, and only by that", () => {
  assert.equal(findDecCoreCourses("200.B0")?.code, "200.B0");
  assert.equal(findDecCoreCourses(null), null);
  assert.equal(findDecCoreCourses("not-a-code"), null);
  // The known integration gap: a legacy profile slug does NOT resolve.
  assert.equal(findDecCoreCourses("sciences-nature"), null);
});

// --- ranking -------------------------------------------------------------------------
check("ranking annotates both dimensions separately and sorts deterministically", () => {
  const input = {
    decProgramCode: "200.B0",
    rScore: 32.4,
    universityPrograms: UNIVERSITY_PROGRAMS,
  };
  const ranked = rankProgramsForStudent(input);

  assert.equal(ranked.length, UNIVERSITY_PROGRAMS.length);

  // Cutoff status is the primary key; "unknown" sinks last, per CUTOFF_STATUS_ORDER.
  const cutoffStates = ranked.map((r) => r.cutoff.status);
  const firstUnknown = cutoffStates.indexOf("unknown");
  if (firstUnknown !== -1) {
    assert.ok(cutoffStates.slice(firstUnknown).every((s) => s === "unknown"));
  }

  // Both dimensions survive on every row — nothing is blended into one number.
  for (const row of ranked) {
    assert.ok("status" in row.cutoff && "status" in row.prerequisites);
  }

  // Stable across calls.
  assert.deepEqual(
    ranked.map((r) => r.program.id),
    rankProgramsForStudent(input).map((r) => r.program.id),
  );
});

check("a null R-score yields cutoff status 'unknown', never a comparison", () => {
  const ranked = rankProgramsForStudent({
    decProgramCode: "200.B0",
    rScore: null,
    universityPrograms: UNIVERSITY_PROGRAMS,
  });
  for (const row of ranked) assert.equal(row.cutoff.status, "unknown");
});

check("an unknown DEC code degrades to unknown, not to a false gap", () => {
  const ranked = rankProgramsForStudent({
    decProgramCode: "not-a-code",
    rScore: 32.4,
    universityPrograms: UNIVERSITY_PROGRAMS,
  });
  for (const row of ranked) assert.equal(row.prerequisites.status, "prerequisites_unknown");
});

console.log(`\n${passed} checks passed.`);
