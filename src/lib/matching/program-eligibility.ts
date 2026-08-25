import type { UniversityProgram } from "@/lib/sample-data";
import {
  CEGEP_DEC_PROGRAMS,
  type CegepDecProgram,
  type CollegialCourseCode,
} from "@/lib/data/cegep-catalog";
import {
  compareToCutoffRange,
  getCutoffRange,
  CUTOFF_STATUS_ORDER,
  type CutoffRange,
  type CutoffStatus,
} from "@/lib/rscore/cutoff-range";

/**
 * Links a cégep DEC's core curriculum to a university program's recorded prerequisites.
 *
 * WHAT THIS ANSWERS: "does this DEC's core curriculum include the courses this university
 * program lists as prerequisites?" — a statement relating two catalogues.
 *
 * WHAT THIS DOES NOT ANSWER, and no caller or UI copy may imply that it does:
 *   1. Whether the student has actually passed those courses. That lives on a transcript, not
 *      here. `UniversityProgram.prerequisites[].status` ("met"/"missing"/"in_progress") is a
 *      hard-coded, student-relative display value in sample-data.ts that is not derived from
 *      any profile — this module deliberately IGNORES it rather than launder a hard-coded
 *      assumption into a computed-looking answer.
 *   2. Whether the student is admissible. A prerequisite outside a DEC's core does NOT mean
 *      the student lacks it: collegial students routinely take courses like 201-NYA-05 as
 *      optional/complementary courses outside their program's core. `prereq_not_in_core`
 *      means exactly what its name says and must be phrased that way in the UI.
 *
 * Non-goals, same philosophy as src/lib/matching/match.ts: no blended numeric "match score",
 * no admission probability. The cutoff dimension and the prerequisite dimension are reported
 * separately and stay separately explainable; the sort is a lexicographic ordering over two
 * independent labelled states, never a weighted total.
 *
 * REFERENCE DATA IN THIS FILE — provenance, per the repo's data-honesty rule:
 *   - The only data encoded here is `PREREQUISITE_COURSE_CODES`: a table mapping the free-text
 *     French prerequisite names recorded in src/lib/sample-data.ts onto standard collegial
 *     course codes. Course codes, DEC codes and core-course lists all live in
 *     src/lib/data/cegep-catalog.ts with their own provenance header; nothing is duplicated.
 *   - VERIFIED: that the codes on the right-hand side exist — the `CollegialCourseCode` literal
 *     union makes a typo a build error rather than a silent lookup miss.
 *   - A NORMALIZATION DECISION MADE HERE, not a university's claim: that the display string
 *     "Algèbre linéaire" refers to 201-NYC-05, and "Physique — Mécanique" to 203-NYA-05.
 *     Recording a code here does NOT assert that the university accepts only that exact course
 *     or rejects an equivalent. It exists so a DEC core list and a prerequisite list can be
 *     compared at all.
 *   - KNOWN WEAKNESS, inherited: cegep-catalog.ts warns that collegial course TITLES are set
 *     locally and vary between cégeps (201-NYC-05 is "Algèbre linéaire et géométrie
 *     vectorielle" at one cégep, "Algèbre vectorielle et linéaire" at another) and that callers
 *     should "match on `code`, never on `nameFr`". This table matches on a name because the
 *     university-side data records names and nothing else yet. That is exactly why the table is
 *     CLOSED: an unrecognized name resolves to null and is reported as `prereq_unmapped`, never
 *     silently scored. There is no fuzzy or substring fallback. The real fix is a `courseCode`
 *     field on the university-side prerequisite rows — which is also what the database expects
 *     (`university_program_prerequisites.course_id` is an FK to `courses`), so this table is a
 *     temporary bridge, not the destination.
 *   - STILL NEEDS SOURCING: which university programs require what. This file adds no
 *     prerequisite claims — it reads only what sample-data.ts already records, and 4 of its 6
 *     university programs record none at all, which resolves to `prerequisites_unknown`.
 *   - Date: 2026-08-24.
 */

/* ------------------------------------------------------------------ *
 * Input: the DEC side
 * ------------------------------------------------------------------ */

/**
 * The slice of a catalogue DEC entry this module needs. Derived from `CegepDecProgram` with
 * `Pick`, so the catalogue and this module can never drift apart silently, while any object
 * carrying these three fields still satisfies it.
 *
 * `coreCoursesVerified` is load-bearing and must not be dropped: cegep-catalog.ts uses it to
 * distinguish "this DEC's core verifiably carries none of the NY sequence" (true + empty, a
 * positive finding) from "nobody has researched this DEC's core" (false + empty, unknown).
 * Collapsing the two would tell a student their program lacks a course when nobody ever looked.
 */
export type DecCoreCourses = Pick<CegepDecProgram, "code" | "coreCoursesVerified"> & {
  /**
   * Widened to `readonly` versus the catalogue's mutable array: querying eligibility should
   * never require a caller to hand over a list this module could mutate. `CegepDecProgram`
   * remains assignable, and `findDecCoreCourses` defaulting to CEGEP_DEC_PROGRAMS is what
   * enforces that at compile time.
   */
  coreCourseCodes: readonly CollegialCourseCode[];
};

/* ------------------------------------------------------------------ *
 * Prerequisite name → standard collegial course code
 * ------------------------------------------------------------------ */

/**
 * Closed alias table, keyed by normalized name. Covers every prerequisite string that actually
 * appears in sample-data.ts, plus the catalogue's own `nameFr` spellings and the common local
 * title variants for the same courses, so a future data pass can spell them either way.
 */
const PREREQUISITE_COURSE_CODES: Record<string, CollegialCourseCode> = {
  // 201 — Mathématiques
  "calcul differentiel": "201-NYA-05",
  "calcul integral": "201-NYB-05",
  "algebre lineaire": "201-NYC-05",
  "algebre lineaire vectorielle": "201-NYC-05",
  "algebre vectorielle et lineaire": "201-NYC-05",
  "algebre lineaire et geometrie vectorielle": "201-NYC-05",
  // 203 — Physique
  "mecanique": "203-NYA-05",
  "physique mecanique": "203-NYA-05",
  "electricite et magnetisme": "203-NYB-05",
  "physique electricite et magnetisme": "203-NYB-05",
  "ondes et physique moderne": "203-NYC-05",
  "physique ondes et physique moderne": "203-NYC-05",
  // 202 — Chimie
  "chimie generale": "202-NYA-05",
  "chimie generale la matiere": "202-NYA-05",
  "chimie des solutions": "202-NYB-05",
  // 101 — Biologie
  "biologie generale": "101-NYA-05",
  "evolution et diversite du vivant": "101-NYA-05",
};

/**
 * Diacritics stripped, case folded, every run of non-alphanumerics collapsed to one space — so
 * "Physique — Mécanique" and "physique mecanique" produce the same key. Matching then stays
 * EXACT on the normalized form: no substring or fuzzy matching, by design.
 */
function normalizeName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** null = this module has never seen the name and refuses to guess at a code for it. */
export function resolvePrerequisiteCourseCode(name: string): CollegialCourseCode | null {
  return PREREQUISITE_COURSE_CODES[normalizeName(name)] ?? null;
}

/* ------------------------------------------------------------------ *
 * Result types
 * ------------------------------------------------------------------ */

export type PrerequisiteCoverage =
  | "prerequisites_met"
  | "prerequisites_partial"
  | "prerequisites_unknown";

export type EligibilityReasonKind =
  /** Resolved to a course code that IS in the DEC's core. A positive finding. */
  | "prereq_covered"
  /** Resolved, absent from a VERIFIED core — a real, nameable gap in the DEC's curriculum. */
  | "prereq_not_in_core"
  /** Resolved, but the DEC's core is unresearched, so its absence proves nothing. */
  | "prereq_core_unverified"
  /** Name is not in the closed alias table — cannot be judged either way. */
  | "prereq_unmapped"
  /** The university program records no prerequisites at all in our data. */
  | "no_prereqs_recorded"
  /** No DEC supplied, or the code is not in the catalogue. */
  | "dec_unknown";

export type EligibilityReason = {
  kind: EligibilityReasonKind;
  /** The prerequisite name exactly as recorded on the university program. */
  name?: string;
  /** Course code the name resolved to. Absent for `prereq_unmapped` and the two global kinds. */
  courseCode?: CollegialCourseCode;
};

export type PrerequisiteEligibility = {
  status: PrerequisiteCoverage;
  reasons: EligibilityReason[];
  /**
   * Derived strictly from `reasons` — no second source of truth. Lets the UI say "2 of 3"
   * instead of leaning on the status word alone. When `no_prereqs_recorded` or `dec_unknown`
   * is present every per-prerequisite count is 0 because nothing could be judged; `recorded`
   * still reports how many the program lists.
   */
  counts: {
    recorded: number;
    covered: number;
    notInCore: number;
    coreUnverified: number;
    unmapped: number;
  };
};

/* ------------------------------------------------------------------ *
 * Core evaluation
 * ------------------------------------------------------------------ */

/**
 * Status precedence. The ordering exists so that no path can report "met" on incomplete
 * knowledge, and no path can report a gap we did not actually establish:
 *   1. Program records no prerequisites          → unknown  (NEVER "met")
 *   2. No DEC / not in the catalogue             → unknown
 *   3. Any prerequisite absent from a VERIFIED   → partial  (a definite, nameable gap)
 *      core
 *   4. Any name unresolvable, or absent from an  → unknown  (cannot assert "met")
 *      UNVERIFIED core
 *   5. Every prerequisite resolved and in core   → met
 *
 * On rule 3: "partial" is the label for "not fully covered by the DEC core", and it covers the
 * zero-covered case too — `counts` carries the breakdown so the UI renders "0 of 3" or "2 of 3"
 * rather than relying on the word to carry the nuance.
 *
 * On rule 4: this is the rule that makes `coreCoursesVerified` matter. A DEC whose core nobody
 * has researched must never produce a gap, however plausible that gap looks.
 */
export function evaluatePrerequisites(
  dec: DecCoreCourses | null,
  program: Pick<UniversityProgram, "prerequisites">,
): PrerequisiteEligibility {
  const recorded = program.prerequisites.length;
  const nothingJudged = {
    recorded,
    covered: 0,
    notInCore: 0,
    coreUnverified: 0,
    unmapped: 0,
  };

  // 1. Nothing recorded on the university side. True today for 4 of the 6 programs in
  //    sample-data.ts, and it means "we have not sourced them", not "this program has none".
  if (recorded === 0) {
    return {
      status: "prerequisites_unknown",
      reasons: [{ kind: "no_prereqs_recorded" }],
      counts: nothingJudged,
    };
  }

  // 2. Nothing on the DEC side to compare against.
  if (!dec) {
    return {
      status: "prerequisites_unknown",
      reasons: [{ kind: "dec_unknown" }],
      counts: nothingJudged,
    };
  }

  const core = new Set<CollegialCourseCode>(dec.coreCourseCodes);
  const reasons: EligibilityReason[] = [];
  let covered = 0;
  let notInCore = 0;
  let coreUnverified = 0;
  let unmapped = 0;

  for (const prerequisite of program.prerequisites) {
    // `prerequisite.status` is deliberately not read here — see the file header.
    const courseCode = resolvePrerequisiteCourseCode(prerequisite.name);

    if (courseCode === null) {
      reasons.push({ kind: "prereq_unmapped", name: prerequisite.name });
      unmapped += 1;
    } else if (core.has(courseCode)) {
      // Presence is a positive finding whether or not the list was audited for completeness.
      reasons.push({ kind: "prereq_covered", name: prerequisite.name, courseCode });
      covered += 1;
    } else if (dec.coreCoursesVerified) {
      reasons.push({ kind: "prereq_not_in_core", name: prerequisite.name, courseCode });
      notInCore += 1;
    } else {
      // Absence from an unresearched list is not evidence of absence.
      reasons.push({ kind: "prereq_core_unverified", name: prerequisite.name, courseCode });
      coreUnverified += 1;
    }
  }

  const counts = { recorded, covered, notInCore, coreUnverified, unmapped };

  // 3. A definite gap outranks an unresolved one: it is the more specific, more useful fact.
  if (notInCore > 0) return { status: "prerequisites_partial", reasons, counts };
  // 4. Everything else is covered, but something unresolved means we cannot say "met".
  if (coreUnverified > 0 || unmapped > 0) {
    return { status: "prerequisites_unknown", reasons, counts };
  }
  // 5.
  return { status: "prerequisites_met", reasons, counts };
}

/* ------------------------------------------------------------------ *
 * Display: two dimensions, kept separate
 * ------------------------------------------------------------------ */

export type ProgramEligibility<T> = {
  program: T;
  /** Reused wholesale from src/lib/rscore/cutoff-range.ts — not reimplemented here. */
  cutoff: { status: CutoffStatus; range: CutoffRange | null };
  prerequisites: PrerequisiteEligibility;
};

/**
 * Shared display mapping, mirroring CUTOFF_STATUS_ORDER so both dimensions rank by the same
 * house rule: a known-bad state sorts above a we-know-nothing state.
 */
export const PREREQUISITE_STATUS_ORDER: Record<PrerequisiteCoverage, number> = {
  prerequisites_met: 0,
  prerequisites_partial: 1,
  prerequisites_unknown: 2,
};

export const PREREQUISITE_STATUS_COLOR_CLASS: Record<PrerequisiteCoverage, string> = {
  prerequisites_met: "text-moss",
  prerequisites_partial: "text-ember",
  prerequisites_unknown: "text-ink/40",
};

export type RankProgramsInput<T extends UniversityProgram> = {
  /**
   * Ministerial DEC code, e.g. "200.B0" — the key `CegepDecProgram.code` uses.
   *
   * INTEGRATION GAP, deliberately not papered over: `StudentProfile.cegepProgramId` currently
   * persists legacy slugs ("sciences-nature"), not ministerial codes, and no slug→code bridge
   * exists in either module. Passing a slug resolves to no DEC and degrades to
   * `prerequisites_unknown` — safe, but useless. Whoever migrates onboarding to the catalogue
   * owns that mapping; guessing it here would put an unsourced equivalence in the logic layer.
   */
  decProgramCode: string | null;
  /** null → cutoff status is "unknown"; a range cannot be compared against no score. */
  rScore: number | null;
  universityPrograms: readonly T[];
  /** Defaults to the shipped catalogue. Injectable for tests and for a narrowed subset. */
  decCatalog?: readonly DecCoreCourses[];
};

/** null when the code is absent or not in the catalogue — never a partial-credit fallback. */
export function findDecCoreCourses(
  decProgramCode: string | null,
  decCatalog: readonly DecCoreCourses[] = CEGEP_DEC_PROGRAMS,
): DecCoreCourses | null {
  if (!decProgramCode) return null;
  return decCatalog.find((d) => d.code === decProgramCode) ?? null;
}

/**
 * Programs annotated with both states and sorted for display.
 *
 * The sort is lexicographic over (cutoff status, prerequisite status, institution, name). That
 * is an ordering, not a score: neither dimension is weighted against the other, both survive
 * untouched on every row, and the UI is expected to render them as two separate labelled facts.
 * Collapsing them into one number would be the false-precision failure that
 * src/lib/matching/match.ts rules out for bursaries.
 *
 * Expect a lot of "unknown" — 4 of 6 programs currently record no cutoff history and 4 of 6
 * record no prerequisites. An all-unknown catalogue is a supported, honest result, not a bug.
 */
export function rankProgramsForStudent<T extends UniversityProgram>({
  decProgramCode,
  rScore,
  universityPrograms,
  decCatalog = CEGEP_DEC_PROGRAMS,
}: RankProgramsInput<T>): ProgramEligibility<T>[] {
  const dec = findDecCoreCourses(decProgramCode, decCatalog);

  const rows: ProgramEligibility<T>[] = universityPrograms.map((program) => {
    const range = getCutoffRange(program.cutoffHistory);
    return {
      program,
      cutoff: {
        range,
        status: rScore === null ? "unknown" : compareToCutoffRange(rScore, range),
      },
      prerequisites: evaluatePrerequisites(dec, program),
    };
  });

  return rows.sort((a, b) => {
    const byCutoff = CUTOFF_STATUS_ORDER[a.cutoff.status] - CUTOFF_STATUS_ORDER[b.cutoff.status];
    if (byCutoff !== 0) return byCutoff;

    const byPrereq =
      PREREQUISITE_STATUS_ORDER[a.prerequisites.status] -
      PREREQUISITE_STATUS_ORDER[b.prerequisites.status];
    if (byPrereq !== 0) return byPrereq;

    // Deterministic tiebreak so the list never reshuffles between renders.
    const byInstitution = a.program.institution.localeCompare(b.program.institution, "fr");
    if (byInstitution !== 0) return byInstitution;
    return a.program.name.localeCompare(b.program.name, "fr");
  });
}
