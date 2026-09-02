/**
 * Minimal runnable self-check for src/lib/matching/program-eligibility.ts.
 * No test framework by design — this repo has none. Run with:
 *
 *   npm run check:data   (or npx tsx scripts/checks/program-eligibility.check.ts)
 *
 * Fixtures below are TEST FIXTURES, not catalogue data — they exist to exercise branches that
 * the real catalogue does not currently contain (an unverified core holding courses, an
 * unmappable prerequisite name). Real DEC data lives in src/lib/data/cegep-catalog.ts. The
 * checks that assert on real data read it from the catalogue rather than restating it, so a
 * data refresh changes what they measure, not whether they pass.
 */
import assert from "node:assert/strict";
import {
  evaluatePrerequisites,
  findDecCoreCourses,
  rankProgramsForStudent,
  resolvePrerequisite,
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

function reasonSummary(result: ReturnType<typeof evaluatePrerequisites>) {
  return result.reasons.map((r) => ({ kind: r.kind, name: r.name, courseCode: r.courseCode }));
}

console.log("program-eligibility self-check\n");

// --- name → standard collegial course code (alias table) ---------------------------------
check("alias table resolves the catalogue spellings and common local variants", () => {
  assert.equal(resolvePrerequisiteCourseCode("Calcul différentiel"), "201-NYA-05");
  assert.equal(resolvePrerequisiteCourseCode("Calcul intégral"), "201-NYB-05");
  assert.equal(resolvePrerequisiteCourseCode("Algèbre linéaire"), "201-NYC-05");
  // Em dash, accents and casing all normalize away.
  assert.equal(resolvePrerequisiteCourseCode("Physique — Mécanique"), "203-NYA-05");
  assert.equal(resolvePrerequisiteCourseCode("physique mecanique"), "203-NYA-05");
});

check("alias table refuses to guess a code for an unknown name", () => {
  assert.equal(resolvePrerequisiteCourseCode("Histoire de l'art"), null);
  // No substring fallback: this contains "Calcul intégral" but is not that course.
  assert.equal(resolvePrerequisiteCourseCode("Calcul intégral avancé II"), null);
});

// --- the parser the real catalogue needs ------------------------------------------------
check("parser reads the codes in parentheses, one group per required course", () => {
  assert.deepEqual(resolvePrerequisite("Calcul différentiel (201-NYA)"), {
    kind: "courses",
    groups: [[{ code: "201-NYA-05", raw: "201-NYA" }]],
  });
  assert.deepEqual(resolvePrerequisite("Physique mécanique et électromagnétisme (203-NYA, 203-NYB)"), {
    kind: "courses",
    groups: [[{ code: "203-NYA-05", raw: "203-NYA" }], [{ code: "203-NYB-05", raw: "203-NYB" }]],
  });
});

check("parser keeps 'ou' alternatives in one group, unknown codes marked as outside", () => {
  assert.deepEqual(resolvePrerequisite("Algèbre linéaire (201-NYC ou 201-105)"), {
    kind: "courses",
    groups: [[{ code: "201-NYC-05", raw: "201-NYC" }, { code: null, raw: "201-105" }]],
  });
  assert.deepEqual(resolvePrerequisite("Biologie générale et humaine (101-NYA, 101-LC)"), {
    kind: "courses",
    groups: [[{ code: "101-NYA-05", raw: "101-NYA" }], [{ code: null, raw: "101-LC" }]],
  });
});

check("parser recognises the diploma-only markers and code-less titles", () => {
  assert.deepEqual(resolvePrerequisite("Diplôme d’études collégiales (DEC) reconnu"), { kind: "dec_only" });
  assert.deepEqual(resolvePrerequisite("Diplôme d’études collégiales (DEC) sans préalables spécifiques"), {
    kind: "dec_only",
  });
  assert.deepEqual(resolvePrerequisite("Biologie humaine"), { kind: "unmapped" });
  assert.deepEqual(resolvePrerequisite("Méthodes quantitatives ou Calcul différentiel"), {
    kind: "courses",
    groups: [[{ code: null, raw: "Méthodes quantitatives" }, { code: "201-NYA-05", raw: "Calcul différentiel" }]],
  });
});

// --- the three required cases ----------------------------------------------------------
check("full NY sequence covers a program requiring Calcul différentiel → met", () => {
  const result = evaluatePrerequisites(SCIENCES_NATURE, REQUIRES_CALCULUS);
  assert.equal(result.status, "prerequisites_met");
  assert.deepEqual(reasonSummary(result), [
    { kind: "prereq_covered", name: "Calcul différentiel", courseCode: "201-NYA-05" },
  ]);
  assert.equal(result.counts.covered, 1);
});

check("a DEC with no science courses does NOT cover it → partial, with the gap named", () => {
  const result = evaluatePrerequisites(SCIENCES_HUMAINES, REQUIRES_CALCULUS);
  assert.equal(result.status, "prerequisites_partial");
  assert.deepEqual(reasonSummary(result), [
    { kind: "prereq_not_in_core", name: "Calcul différentiel", courseCode: "201-NYA-05" },
  ]);
  assert.equal(result.counts.notInCore, 1);
});

check("a program with no recorded prerequisites → unknown, never met", () => {
  const result = evaluatePrerequisites(SCIENCES_NATURE, { prerequisites: [] });
  assert.equal(result.status, "prerequisites_unknown");
  assert.deepEqual(reasonSummary(result), [{ kind: "no_prereqs_recorded", name: undefined, courseCode: undefined }]);
});

// --- alternatives and diploma-only requirements ---------------------------------------
check("an alternative outside the catalogue blocks a gap claim → unknown, not partial", () => {
  const program = { prerequisites: [{ name: "Calcul différentiel ou Mathématiques appliquées à la gestion (201-NYA ou 201-103)", status: "met" as const }] };
  assert.equal(evaluatePrerequisites(SCIENCES_NATURE, program).status, "prerequisites_met");
  const humanities = evaluatePrerequisites(SCIENCES_HUMAINES, program);
  assert.equal(humanities.status, "prerequisites_unknown");
  assert.equal(humanities.reasons[0].kind, "prereq_outside_catalogue");
  assert.deepEqual(humanities.reasons[0].outsideCatalogue, ["201-103"]);
  assert.equal(humanities.counts.outsideCatalogue, 1);
});

check("a two-course requirement needs both courses in the core", () => {
  const program = { prerequisites: [{ name: "Physique mécanique et électromagnétisme (203-NYA, 203-NYB)", status: "met" as const }] };
  const fixture: DecCoreCourses = { code: "fixture-mechanics-only", coreCourseCodes: ["203-NYA-05"], coreCoursesVerified: true };
  assert.equal(evaluatePrerequisites(SCIENCES_NATURE, program).status, "prerequisites_met");
  assert.equal(evaluatePrerequisites(fixture, program).status, "prerequisites_partial");
});

check("a program asking only for the DEC itself → met with a dec_only reason", () => {
  const program = { prerequisites: [{ name: "Diplôme d’études collégiales (DEC) reconnu", status: "met" as const }] };
  const result = evaluatePrerequisites(SCIENCES_HUMAINES, program);
  assert.equal(result.status, "prerequisites_met");
  assert.equal(result.reasons[0].kind, "dec_only");
  assert.equal(result.counts.decOnly, 1);
  assert.equal(result.counts.covered, 0);
});

// --- coreCoursesVerified: the rule that stops an unresearched DEC inventing a gap -----
check("an UNVERIFIED core never produces a gap → unknown, not partial", () => {
  const result = evaluatePrerequisites(UNRESEARCHED, REQUIRES_CALCULUS);
  assert.equal(result.status, "prerequisites_unknown");
  assert.deepEqual(reasonSummary(result), [
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
  assert.equal(evaluatePrerequisites(unverified, REQUIRES_CALCULUS).status, "prerequisites_unknown");
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
  assert.deepEqual(reasonSummary(result), [{ kind: "dec_unknown", name: undefined, courseCode: undefined }]);
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
/**
 * Titles the university-side data records with no course code and no alias-table entry.
 * They name real collegial courses outside the 9-course NY catalogue (human biology, organic
 * chemistry). Adding a code to the data, or a course to the catalogue, is the fix — not
 * widening this list. A new unmapped title fails the check so it gets looked at.
 */
const KNOWN_UNMAPPED_TITLES = new Set(["Biologie humaine", "Chimie organique"]);

check("real catalogue: every program records at least one prerequisite", () => {
  const empty = UNIVERSITY_PROGRAMS.filter((p) => p.prerequisites.length === 0);
  assert.equal(empty.length, 0, `programs with no recorded prerequisites: ${empty.map((p) => p.id).join(", ")}`);
});

check("real catalogue: every recorded prerequisite resolves, except the documented titles", () => {
  for (const program of UNIVERSITY_PROGRAMS) {
    for (const prerequisite of program.prerequisites) {
      const resolution = resolvePrerequisite(prerequisite.name);
      if (resolution.kind === "unmapped") {
        assert.ok(
          KNOWN_UNMAPPED_TITLES.has(prerequisite.name),
          `unmapped prerequisite on ${program.id}: "${prerequisite.name}"`,
        );
      }
    }
  }
});

check("real catalogue: 200.B0 is never 'partial' — its core carries the whole NY sequence", () => {
  let met = 0;
  for (const program of UNIVERSITY_PROGRAMS) {
    const result = evaluatePrerequisites(SCIENCES_NATURE, program);
    assert.notEqual(result.status, "prerequisites_partial", `${program.id} reads as partial for 200.B0`);
    if (result.status === "prerequisites_met") met += 1;
  }
  assert.ok(met > 0, "200.B0 covers no program at all — the parser or the data regressed");
  console.log(`      200.B0 → met for ${met} of ${UNIVERSITY_PROGRAMS.length} programs`);
});

check("real catalogue: 300.A0 yields both definite gaps and honest unknowns", () => {
  const statuses = new Map<string, number>();
  for (const program of UNIVERSITY_PROGRAMS) {
    const status = evaluatePrerequisites(SCIENCES_HUMAINES, program).status;
    statuses.set(status, (statuses.get(status) ?? 0) + 1);
  }
  assert.ok((statuses.get("prerequisites_partial") ?? 0) > 0, "no program requires an NY course 300.A0 lacks?");
  assert.ok((statuses.get("prerequisites_met") ?? 0) > 0, "no DEC-only program reads as met for 300.A0?");
  console.log(`      300.A0 → ${[...statuses].map(([k, v]) => `${k.replace("prerequisites_", "")}=${v}`).join(", ")}`);
});

// --- DEC lookup ----------------------------------------------------------------------
check("findDecCoreCourses resolves by ministerial code, and only by that", () => {
  assert.equal(findDecCoreCourses("200.B0")?.code, "200.B0");
  assert.equal(findDecCoreCourses(null), null);
  assert.equal(findDecCoreCourses("not-a-code"), null);
  // A legacy profile slug does NOT resolve.
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
