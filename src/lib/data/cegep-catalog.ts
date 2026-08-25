/**
 * Quebec collegial reference catalogue: standard course codes + DEC programs.
 *
 * WHAT IS ENCODED HERE (exact counts — do not round up in code or UI copy):
 *   - 9 collegial courses: the "NY" science sequence only (201 mathématiques, 203 physique,
 *     202 chimie, 101 biologie).
 *   - 9 pre-university DEC programs.
 *   - 33 technical DEC programs.
 *
 * THIS IS A PARTIAL CATALOGUE. Quebec offers roughly 130 technical DEC programs; the 33 below
 * are a subset chosen for coverage of the common ones, not a complete list. Any UI that renders
 * this data must say "a selection of programs", never "all Quebec cégep programs". Use
 * CATALOG_COUNTS rather than hard-coding numbers into copy, so the two can never drift.
 *
 * WHERE THE DATA COMES FROM:
 *   - Program codes and French names are the ministerial program codes published by the
 *     Ministère de l'Enseignement supérieur in its collegial program list (the "200.B0" /
 *     "420.B0" numbering). They are stable public reference data.
 *   - Course codes are the standard Quebec collegial numbering: discipline number + sequence
 *     (e.g. 201 = mathématiques, 203 = physique, 202 = chimie, 101 = biologie).
 *
 * VERIFIED vs. STILL NEEDS SOURCING (as of 2026-08-24):
 *   - VERIFIED: every `code` and `nameFr` below, and the `coreCourseCodes` of 200.B0.
 *   - NEEDS SOURCING: `coreCourseCodes` for every program whose `coreCoursesVerified` is false
 *     (see that flag's doc — an empty array there means "not researched", NOT "none"). Also
 *     unsourced: local course titles, pondération, and per-cégep availability (see below).
 *
 * WHAT IS DELIBERATELY ABSENT — read before "completing" this file:
 *   - No admission cutoffs, R-score thresholds, or grade floors of any kind. Those belong to
 *     university programs in src/lib/sample-data.ts, carry sourceUrl + lastVerifiedAt per
 *     Guardrail #1, and are never inferred from a program code.
 *   - No claim that any university program requires any course listed here. This file states
 *     what a DEC contains, never what a university demands.
 *   - No formation générale (français, philosophie, anglais, éducation physique). Those courses
 *     are universal to every DEC, so they cannot differentiate a university prerequisite, and
 *     the 4th français, 3rd philosophie, and all anglais codes are program- and
 *     placement-dependent. A partial list would read as complete and mislead. Omitted on
 *     purpose, not forgotten.
 *   - No pondération (the DB `courses.weighting` column stays null until sourced).
 *   - No per-cégep availability. A DEC code is province-wide; which cégep offers it is a
 *     separate fact this file does not assert. The DB models the offering
 *     (`cegep_programs.cegep_id` is NOT NULL); this catalogue models the ministerial program.
 *     They are two different entities — see the note above CEGEP_DEC_PROGRAMS.
 *   - No Sciences humaines profiles, no double-DEC / DEC intégré combinations, no Tremplin DEC.
 *     See the note above CEGEP_DEC_PROGRAMS for why.
 */

/** Discipline number that prefixes a collegial course code. */
export type DisciplineCode =
  | "101" // biologie
  | "201" // mathématiques
  | "202" // chimie
  | "203"; // physique

/**
 * Union of every course code in COLLEGIAL_COURSES. Declared as a literal union so that
 * `coreCourseCodes` below is checked at compile time: a typo'd or removed course code is a
 * build error, not a silently empty lookup at runtime.
 */
export type CollegialCourseCode =
  | "101-NYA-05"
  | "201-NYA-05"
  | "201-NYB-05"
  | "201-NYC-05"
  | "202-NYA-05"
  | "202-NYB-05"
  | "203-NYA-05"
  | "203-NYB-05"
  | "203-NYC-05";

export type CollegialCourse = {
  code: CollegialCourseCode;
  disciplineCode: DisciplineCode;
  nameFr: string;
  nameEn: string;
};

/**
 * The 9 "NY" courses — the ministry-standard specific-education science sequence carried by
 * pre-university science programs across every cégep. These are the courses that actually
 * matter for university prerequisite tracking, which is why the list stops here.
 *
 * Caveat on titles: the CODE is the stable, province-wide key. The displayed TITLE is set
 * locally and varies between cégeps (201-NYC-05 appears as "Algèbre linéaire et géométrie
 * vectorielle" or "Algèbre vectorielle et linéaire"; 101-NYA-05 as "Évolution et diversité du
 * vivant" or "Biologie générale I"). Match on `code`, never on `nameFr`.
 *
 * `nameEn` is a display translation for the English UI. Most of these courses are taught under
 * a French title; the English string is not a claim about an official ministerial English name.
 */
export const COLLEGIAL_COURSES: CollegialCourse[] = [
  // 201 — Mathématiques
  { code: "201-NYA-05", disciplineCode: "201", nameFr: "Calcul différentiel", nameEn: "Calculus I (Differential Calculus)" },
  { code: "201-NYB-05", disciplineCode: "201", nameFr: "Calcul intégral", nameEn: "Calculus II (Integral Calculus)" },
  { code: "201-NYC-05", disciplineCode: "201", nameFr: "Algèbre linéaire et géométrie vectorielle", nameEn: "Linear Algebra and Vector Geometry" },

  // 203 — Physique
  { code: "203-NYA-05", disciplineCode: "203", nameFr: "Mécanique", nameEn: "Mechanics" },
  { code: "203-NYB-05", disciplineCode: "203", nameFr: "Électricité et magnétisme", nameEn: "Electricity and Magnetism" },
  { code: "203-NYC-05", disciplineCode: "203", nameFr: "Ondes et physique moderne", nameEn: "Waves and Modern Physics" },

  // 202 — Chimie
  { code: "202-NYA-05", disciplineCode: "202", nameFr: "Chimie générale : la matière", nameEn: "General Chemistry: Matter" },
  { code: "202-NYB-05", disciplineCode: "202", nameFr: "Chimie des solutions", nameEn: "Chemistry of Solutions" },

  // 101 — Biologie
  { code: "101-NYA-05", disciplineCode: "101", nameFr: "Évolution et diversité du vivant", nameEn: "Evolution and Diversity of Life" },
];

export type DecProgramType = "pre_university" | "technical";

export type CegepDecProgram = {
  /** Ministerial program code, e.g. "200.B0". The natural key — stable and province-wide. */
  code: string;
  nameFr: string;
  /** Display translation for the English UI. Not a claim about an official English title. */
  nameEn: string;
  type: DecProgramType;
  /**
   * Which of COLLEGIAL_COURSES this DEC carries in its core.
   *
   * SCOPE: this answers only "which NY-sequence courses are in the core". It is NOT the
   * program's full course grid — formation générale, locally-coded discipline courses, and
   * optional/profile courses are all out of scope for this catalogue.
   */
  coreCourseCodes: CollegialCourseCode[];
  /**
   * Whether `coreCourseCodes` was actually checked against the program's content.
   *
   * true  → the list is complete with respect to COLLEGIAL_COURSES. An empty array here is a
   *         positive finding: this DEC's core carries none of the NY science sequence.
   * false → not researched. An empty array here means UNKNOWN, not none. Do not render it as
   *         "this program has no science prerequisites".
   *
   * This flag exists because a bare empty array cannot distinguish "verified as none" from
   * "nobody looked yet", and the difference materially changes what a student is told.
   */
  coreCoursesVerified: boolean;
};

/**
 * Ministerial DEC programs: 9 pre-university + 33 technical (see CATALOG_COUNTS).
 *
 * ENTITY NOTE: a row here is a *ministerial program*, province-wide. It is not the same entity
 * as a `cegep_programs` row in the database, which models a program *offered at one specific
 * cégep* (`cegep_id` is NOT NULL there). Mapping is one ministerial program → many cégep
 * offerings. This file does not assert which cégeps offer what.
 *
 * WHY SOME THINGS ARE MISSING:
 *   - Sciences humaines profiles (Administration, Individu, Monde, Justice et société, …) are
 *     defined by each cégep, not by the ministry, and carry no ministerial code. Encoding them
 *     with invented codes would be fabrication, so Sciences humaines appears once as 300.A0.
 *   - Double-DEC / DEC intégré combinations and Tremplin DEC (a transition pathway that grants
 *     no diploma) are omitted — the former because their codes were not verified, the latter
 *     because it is not a DEC.
 *
 * WHY MOST TECHNICAL PROGRAMS HAVE AN EMPTY coreCourseCodes: the NY sequence is specific to
 * pre-university science programs. Technical DECs carry their own locally-coded, trade-adapted
 * mathematics and science instead. Empty + verified is therefore the correct, expected answer
 * for a technical program — not a gap. If a specific technical DEC is later confirmed to carry
 * an NY course, flip that single entry.
 */
export const CEGEP_DEC_PROGRAMS: CegepDecProgram[] = [
  // ==========================================================================
  // PRE-UNIVERSITY (9)
  // ==========================================================================
  {
    code: "200.B0",
    nameFr: "Sciences de la nature",
    nameEn: "Natural Science",
    type: "pre_university",
    // The full math/physics/chemistry/biology NY sequence. Note that cégeps run this program
    // with profiles (health vs. pure/applied sciences) that differ in the OPTIONAL courses
    // accompanying this core; the optional slots are out of this catalogue's scope.
    coreCourseCodes: [
      "201-NYA-05",
      "201-NYB-05",
      "201-NYC-05",
      "203-NYA-05",
      "203-NYB-05",
      "203-NYC-05",
      "202-NYA-05",
      "202-NYB-05",
      "101-NYA-05",
    ],
    coreCoursesVerified: true,
  },
  {
    code: "200.C0",
    nameFr: "Sciences informatiques et mathématiques",
    nameEn: "Computer Science and Mathematics",
    type: "pre_university",
    // NOT NONE — NOT RESEARCHED. This program does carry a mathematics sequence; exactly which
    // NY courses sit in its core was not confirmed against the program's content, so nothing is
    // listed rather than a plausible guess. coreCoursesVerified: false marks that.
    coreCourseCodes: [],
    coreCoursesVerified: false,
  },
  {
    code: "300.A0",
    nameFr: "Sciences humaines",
    nameEn: "Social Science",
    type: "pre_university",
    // Verified as none: the Sciences humaines core uses its own mathematics and quantitative
    // methods courses, not the NY sequence. NY math courses may be available as OPTIONS
    // depending on the cégep and profile — options are out of this catalogue's scope, so a
    // student's actual transcript is the only authority on whether they took one.
    coreCourseCodes: [],
    coreCoursesVerified: true,
  },
  {
    code: "500.A1",
    nameFr: "Arts, lettres et communication",
    nameEn: "Arts, Literature and Communication",
    type: "pre_university",
    // Code note: this revised program replaced the earlier "Arts et lettres" (500.A0). Older
    // student records and archived cégep pages may still show 500.A0.
    coreCourseCodes: [],
    coreCoursesVerified: true,
  },
  {
    code: "501.A0",
    nameFr: "Musique",
    nameEn: "Music",
    type: "pre_university",
    coreCourseCodes: [],
    coreCoursesVerified: true,
  },
  {
    code: "506.A0",
    nameFr: "Danse",
    nameEn: "Dance",
    type: "pre_university",
    coreCourseCodes: [],
    coreCoursesVerified: true,
  },
  {
    code: "510.A0",
    nameFr: "Arts visuels",
    nameEn: "Visual Arts",
    type: "pre_university",
    coreCourseCodes: [],
    coreCoursesVerified: true,
  },
  {
    code: "700.A0",
    nameFr: "Sciences, lettres et arts",
    nameEn: "Science, Literature and Arts",
    type: "pre_university",
    // NOT NONE — NOT RESEARCHED. This multidisciplinary program does include science courses;
    // whether they are the NY-coded ones was not confirmed.
    coreCourseCodes: [],
    coreCoursesVerified: false,
  },
  {
    code: "700.B0",
    nameFr: "Histoire et civilisation",
    nameEn: "History and Civilization",
    type: "pre_university",
    coreCourseCodes: [],
    coreCoursesVerified: true,
  },

  // ==========================================================================
  // TECHNICAL (33) — a selection of common programs, not the full ~130.
  // Every entry below: coreCourseCodes [] + coreCoursesVerified true, per the structural
  // rationale documented above this constant.
  // ==========================================================================

  // --- Santé (7) ---
  { code: "111.A0", nameFr: "Techniques d'hygiène dentaire", nameEn: "Dental Hygiene", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "120.A0", nameFr: "Techniques de diététique", nameEn: "Dietetic Technology", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "142.A0", nameFr: "Technologie de radiodiagnostic", nameEn: "Radiodiagnostic Technology", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "144.A0", nameFr: "Techniques de réadaptation physique", nameEn: "Physical Rehabilitation Techniques", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "145.A0", nameFr: "Techniques de santé animale", nameEn: "Animal Health Technology", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "180.A0", nameFr: "Soins infirmiers", nameEn: "Nursing", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "181.A0", nameFr: "Soins préhospitaliers d'urgence", nameEn: "Paramedic Care", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },

  // --- Sciences appliquées et laboratoire (2) ---
  // 210.AA and 210.AB are the two voies de spécialisation of the Techniques de laboratoire
  // family; the ministry codes the specializations, not a single parent program.
  { code: "210.AA", nameFr: "Techniques de laboratoire : biotechnologies", nameEn: "Laboratory Technology: Biotechnology", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "210.AB", nameFr: "Techniques de laboratoire : chimie analytique", nameEn: "Laboratory Technology: Analytical Chemistry", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },

  // --- Bâtiment et génie (6) ---
  { code: "221.A0", nameFr: "Technologie de l'architecture", nameEn: "Architectural Technology", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "221.B0", nameFr: "Technologie du génie civil", nameEn: "Civil Engineering Technology", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "221.C0", nameFr: "Technologie de la mécanique du bâtiment", nameEn: "Building Systems Technology", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "235.B0", nameFr: "Technologie du génie industriel", nameEn: "Industrial Engineering Technology", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "241.A0", nameFr: "Techniques de génie mécanique", nameEn: "Mechanical Engineering Technology", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "241.D0", nameFr: "Technologie de maintenance industrielle", nameEn: "Industrial Maintenance Technology", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },

  // --- Services sociaux, éducatifs et juridiques (8) ---
  { code: "310.A0", nameFr: "Techniques policières", nameEn: "Police Technology", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "310.B0", nameFr: "Techniques d'intervention en délinquance", nameEn: "Correctional Intervention", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "310.C0", nameFr: "Techniques juridiques", nameEn: "Paralegal Technology", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "322.A0", nameFr: "Techniques d'éducation à l'enfance", nameEn: "Early Childhood Education", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "351.A0", nameFr: "Techniques d'éducation spécialisée", nameEn: "Special Care Counselling", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "388.A0", nameFr: "Techniques de travail social", nameEn: "Social Service", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "391.A0", nameFr: "Techniques d'intervention en loisir", nameEn: "Recreation Leadership Techniques", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "393.A0", nameFr: "Techniques de la documentation", nameEn: "Information and Library Technologies", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },

  // --- Administration, commerce et informatique (7) ---
  { code: "410.A0", nameFr: "Techniques de la logistique du transport", nameEn: "Transportation Logistics", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "410.B0", nameFr: "Techniques de comptabilité et de gestion", nameEn: "Accounting and Management Technology", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "410.D0", nameFr: "Gestion de commerces", nameEn: "Business Management", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "414.A0", nameFr: "Techniques de tourisme", nameEn: "Tourism Techniques", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "420.B0", nameFr: "Techniques de l'informatique", nameEn: "Computer Science Technology", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "430.A0", nameFr: "Techniques de gestion hôtelière", nameEn: "Hotel Management Techniques", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "430.B0", nameFr: "Gestion d'un établissement de restauration", nameEn: "Restaurant Management", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },

  // --- Design et communication graphique (3) ---
  { code: "570.A0", nameFr: "Graphisme", nameEn: "Graphic Design", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "570.C0", nameFr: "Techniques de design industriel", nameEn: "Industrial Design", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
  { code: "570.E0", nameFr: "Techniques de design d'intérieur", nameEn: "Interior Design", type: "technical", coreCourseCodes: [], coreCoursesVerified: true },
];

// ============================================================================
// Lookups and derived views
// ============================================================================

export const COLLEGIAL_COURSE_BY_CODE = new Map(COLLEGIAL_COURSES.map((course) => [course.code, course]));

export const CEGEP_DEC_PROGRAM_BY_CODE = new Map(CEGEP_DEC_PROGRAMS.map((program) => [program.code, program]));

export const PRE_UNIVERSITY_DEC_PROGRAMS = CEGEP_DEC_PROGRAMS.filter((p) => p.type === "pre_university");

export const TECHNICAL_DEC_PROGRAMS = CEGEP_DEC_PROGRAMS.filter((p) => p.type === "technical");

/**
 * Exact catalogue size, derived rather than written down, so UI copy can state real numbers and
 * can never drift from the data. Per the honesty rule, copy must present this as a partial
 * catalogue — `technicalTotalInQuebec` is the approximate province-wide total for context and is
 * intentionally typed as approximate.
 */
export const CATALOG_COUNTS = {
  courses: COLLEGIAL_COURSES.length,
  preUniversityPrograms: PRE_UNIVERSITY_DEC_PROGRAMS.length,
  technicalPrograms: TECHNICAL_DEC_PROGRAMS.length,
  /** Approximate, for "33 of roughly 130" style copy. Not a precise figure. */
  approximateTechnicalTotalInQuebec: 130,
} as const;

export function courseLabel(code: CollegialCourseCode, locale: "fr" | "en"): string {
  const course = COLLEGIAL_COURSE_BY_CODE.get(code);
  if (!course) return code;
  return locale === "fr" ? course.nameFr : course.nameEn;
}

export function decProgramLabel(code: string, locale: "fr" | "en"): string {
  const program = CEGEP_DEC_PROGRAM_BY_CODE.get(code);
  if (!program) return code;
  return locale === "fr" ? program.nameFr : program.nameEn;
}

/**
 * Resolved core courses for a DEC, or null when the program is unknown OR its core has not been
 * researched (`coreCoursesVerified: false`). Returning null rather than [] keeps callers from
 * rendering "no science courses required" for a program nobody has checked — an empty array from
 * this function always means a verified none.
 */
export function coreCoursesForDecProgram(code: string): CollegialCourse[] | null {
  const program = CEGEP_DEC_PROGRAM_BY_CODE.get(code);
  if (!program || !program.coreCoursesVerified) return null;
  return program.coreCourseCodes
    .map((c) => COLLEGIAL_COURSE_BY_CODE.get(c))
    .filter((c): c is CollegialCourse => c !== undefined);
}
