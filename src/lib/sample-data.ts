import type { BursaryCriteria } from "@/lib/matching/match";
import type { InterestId } from "@/lib/tags/interests";
import { CEGEP_DEC_PROGRAMS } from "@/lib/data/cegep-catalog";
// Illustrative sample data for the MVP UI. Shaped after docs/01-data-architecture.md so
// wiring real Supabase queries in later phases is a drop-in swap, not a redesign.
//
// Guardrail #1 (docs/00-BUILD-PROMPT.md): every displayed figure carries `sourceUrl` and
// `lastVerifiedAt`. Do not add a numeric field here without both.

export type Cegep = { id: string; name: string; region: string };

export const CEGEPS: Cegep[] = [
  { id: "sainte-foy", name: "Cégep de Sainte-Foy", region: "Québec" },
  { id: "limoilou", name: "Cégep Limoilou", region: "Québec" },
  { id: "garneau", name: "Cégep Garneau", region: "Québec" },
  { id: "champlain-st-lawrence", name: "Cégep Champlain St. Lawrence", region: "Québec" },
  { id: "merici", name: "Collège Mérici", region: "Québec" },
  { id: "osullivan-quebec", name: "Collège O'Sullivan de Québec", region: "Québec" },
];

export type CegepProgram = { id: string; name: string; type: "pre_university" | "technical" };

/**
 * Derived from the real ministerial catalogue in src/lib/data/cegep-catalog.ts rather than
 * hand-listed here, so `id` IS the ministerial code ("200.B0") — the same key
 * src/lib/matching/program-eligibility.ts looks DECs up by. This closes the integration gap
 * that module documents: profiles previously stored invented slugs ("sciences-nature") that
 * resolved to no DEC, silently degrading every prerequisite answer to "unknown".
 *
 * Still a PARTIAL list (see the catalogue's header for exact counts) — never label it
 * "all Quebec cégep programs" in UI copy.
 */
export const CEGEP_PROGRAMS: CegepProgram[] = CEGEP_DEC_PROGRAMS.map((p) => ({
  id: p.code,
  name: p.nameFr,
  type: p.type,
}));

export type Session = { id: number; labelFr: string; labelEn: string };

export const SESSIONS: Session[] = [
  { id: 1, labelFr: "Automne 2024", labelEn: "Fall 2024" },
  { id: 2, labelFr: "Hiver 2025", labelEn: "Winter 2025" },
  { id: 3, labelFr: "Automne 2025", labelEn: "Fall 2025" },
  { id: 4, labelFr: "Hiver 2026", labelEn: "Winter 2026" },
  { id: 5, labelFr: "Automne 2026", labelEn: "Fall 2026" },
  { id: 6, labelFr: "Hiver 2027", labelEn: "Winter 2027" },
];

export type PrerequisiteStatus = "met" | "missing" | "in_progress";

/**
 * No single "current cutoff" per program: universities publish multi-year ranges, or
 * min/max/average, or nothing at all, and the freshest official figures often run several
 * years behind the current admission cycle. See docs/01-data-architecture.md. Every entry
 * carries its own year and figure type; src/lib/rscore/cutoff-range.ts turns a set of these
 * into a low/high range, never a single point.
 */
export type CutoffFigureType =
  | "last_admitted"
  | "minimum_required"
  | "maximum"
  | "average"
  | "range_low"
  | "range_high";
export type CutoffSourceTier = "university_official" | "cegep_compiled";
export type CutoffEntry = {
  year: number;
  cutoff: number;
  figureType: CutoffFigureType;
  sourceTier: CutoffSourceTier;
};

export type UniversityProgram = {
  id: string;
  name: string;
  institution: string;
  description: string;
  /** Category tags for onboarding/interest matching — a manual classification, not a sourced figure. */
  interestIds: InterestId[];
  cohortLabel: string;
  courseFloor?: { course: string; minGrade: number; note: string };
  placementRate?: { value: number; note: string };
  professionalOrders?: { codes: string[]; note: string };
  sourceUrl: string;
  lastVerifiedAt: string;
  /** Empty until a primary source is verified — never filled with a guessed figure. */
  cutoffHistory: CutoffEntry[];
  prerequisites: { name: string; status: PrerequisiteStatus }[];
};

const SRAM_SOURCE = "https://www.sram.qc.ca/";

export const UNIVERSITY_PROGRAMS: UniversityProgram[] = [
  {
    id: "hec-baa",
    name: "Administration des affaires (BAA)",
    institution: "HEC Montréal",
    description:
      "Programme reconnu internationalement, alliant la théorie de gestion rigoureuse à la pratique, préparant à des rôles de direction dans un contexte mondial.",
    interestIds: ["business"],
    cohortLabel: "Cohorte automne 2026",
    // No published cote R on HEC's own admission page as of this verification — the
    // previous 27,5 / 26,5 figures could not be re-confirmed from a primary source and
    // have been dropped rather than shipped unverified. See the 2026-08-24 data audit.
    placementRate: {
      value: 96,
      note: "En emploi ou aux études supérieures dans les 6 mois suivant la diplomation.",
    },
    professionalOrders: {
      codes: ["CPA", "CRHA", "CFA"],
      note: "Ordres et titres professionnels que rejoignent couramment les diplômés du BAA.",
    },
    sourceUrl: "https://www.hec.ca/programmes/baccalaureats/baa/demande-admission",
    lastVerifiedAt: "2026-08-24",
    cutoffHistory: [],
    prerequisites: [
      { name: "Calcul différentiel", status: "met" },
      { name: "Calcul intégral", status: "met" },
      { name: "Algèbre linéaire", status: "missing" },
    ],
  },
  {
    id: "poly-genie-logiciel",
    name: "Génie logiciel",
    institution: "Polytechnique Montréal",
    description:
      "Formation d'ingénieur agréée couvrant la conception, l'architecture et la vérification des systèmes logiciels à grande échelle.",
    interestIds: ["tech_eng"],
    cohortLabel: "Cohorte automne 2026",
    // Polytechnique's admission-statistics page didn't return readable per-program figures
    // during the 2026-08-24 verification pass — dropped rather than shipped unverified.
    placementRate: {
      value: 94,
      note: "En emploi ou aux études supérieures dans les 6 mois suivant la diplomation.",
    },
    professionalOrders: {
      codes: ["OIQ"],
      note: "Le titre d'ingénieur au Québec est réservé et encadré par l'Ordre des ingénieurs.",
    },
    sourceUrl: "https://www.polymtl.ca/admission/baccalaureat/conditions-dadmission-au-baccalaureat/statistiques-dadmission",
    lastVerifiedAt: "2026-08-24",
    cutoffHistory: [],
    prerequisites: [
      { name: "Calcul différentiel", status: "met" },
      { name: "Calcul intégral", status: "met" },
      { name: "Physique — Mécanique", status: "met" },
    ],
  },
  {
    id: "udem-droit",
    name: "Droit",
    institution: "Université de Montréal",
    description:
      "Baccalauréat en droit civil québécois, menant au Barreau ou à la Chambre des notaires après la formation professionnelle.",
    interestIds: ["law_social"],
    cohortLabel: "Cohorte automne 2026",
    professionalOrders: {
      codes: ["Barreau", "Notaires"],
      note: "Ordres professionnels accessibles après la formation professionnelle requise.",
    },
    sourceUrl: "https://admission.umontreal.ca/statistiques-dadmission-cote-r/",
    lastVerifiedAt: "2026-08-24",
    // UdeM publishes low/high/average across admitted cégep-basis candidates, not one
    // number. Automne 2024 cohort, as of 2024-07-11.
    cutoffHistory: [
      { year: 2024, cutoff: 31.505, figureType: "last_admitted", sourceTier: "university_official" },
      { year: 2024, cutoff: 33.168, figureType: "average", sourceTier: "university_official" },
      { year: 2024, cutoff: 38.058, figureType: "maximum", sourceTier: "university_official" },
    ],
    prerequisites: [],
  },
  {
    id: "laval-sciences-bio",
    name: "Sciences biologiques",
    institution: "Université Laval",
    description:
      "Étude du vivant, de la génétique aux écosystèmes, avec une forte composante de laboratoire et de terrain.",
    interestIds: ["science", "environment"],
    cohortLabel: "Cohorte automne 2026",
    // Not a limited-enrolment ("contingenté") program in Laval's own cote-R table — no
    // competitive cutoff to publish. Re-check if that changes.
    sourceUrl: "https://www.ulaval.ca/etudes/programmes",
    lastVerifiedAt: "2026-08-24",
    cutoffHistory: [],
    prerequisites: [],
  },
  {
    id: "laval-genie-civil",
    name: "Génie civil",
    institution: "Université Laval",
    description:
      "Conception et gestion des infrastructures : structures, transport, ressources hydriques et géotechnique.",
    interestIds: ["tech_eng", "environment"],
    cohortLabel: "Cohorte automne 2026",
    // Not a limited-enrolment ("contingenté") program in Laval's own cote-R table — no
    // competitive cutoff to publish. Re-check if that changes.
    professionalOrders: {
      codes: ["OIQ"],
      note: "Le titre d'ingénieur au Québec est réservé et encadré par l'Ordre des ingénieurs.",
    },
    sourceUrl: "https://www.ulaval.ca/etudes/programmes",
    lastVerifiedAt: "2026-08-24",
    cutoffHistory: [],
    prerequisites: [],
  },
  {
    id: "laval-sciences-infirmieres",
    name: "Sciences infirmières",
    institution: "Université Laval",
    description:
      "Formation clinique menant à l'exercice infirmier, avec stages en milieu hospitalier dès la première année.",
    interestIds: ["health"],
    cohortLabel: "Cohorte automne 2026",
    professionalOrders: {
      codes: ["OIIQ"],
      note: "L'exercice infirmier au Québec est réservé aux membres de l'Ordre.",
    },
    sourceUrl: "https://www.ulaval.ca/sites/default/files/futurs-etudiants/IPC_2024-2025-WEB.pdf",
    lastVerifiedAt: "2026-08-24",
    // Laval's own IPC table, "CRC" column (cote de rendement au collégial — cégep-basis
    // candidates), Automne 2023, updated 2023-08-15. No CRU/university-transfer row here:
    // this app is cégep-only.
    cutoffHistory: [
      { year: 2023, cutoff: 26.529, figureType: "last_admitted", sourceTier: "university_official" },
    ],
    prerequisites: [],
  },
];

/**
 * Bursary rows carry matching CRITERIA, not a precomputed tier — the tier is derived per
 * student by src/lib/matching/match.ts so the same row lands differently for different
 * students, and the "why" is explainable rather than baked in.
 */
export type Bursary = BursaryCriteria & {
  name: string;
  sourceOrg: string;
  amountMin: number | null;
  deadlinePrecision?: "day" | "month";
  /**
   * null when the foundation handles applications internally. The UI then tells the student
   * to contact their cégep's financial-aid office rather than inventing a link that 404s.
   */
  applicationUrl: string | null;
  hasPublicApplicationLink: boolean;
  requiresEssay: boolean;
  requiresRecommendation: boolean;
  sourceUrl: string;
  lastVerifiedAt: string;
};

export const BURSARIES: Bursary[] = [
  {
    id: "excellence-sciences-nature",
    name: "Bourse d'excellence en sciences de la nature",
    sourceOrg: "Fondation du Cégep de Sainte-Foy",
    cegepId: "sainte-foy",
    // Ministerial DEC code, matching CEGEP_PROGRAMS[].id / StudentProfile.cegepProgramId.
    // BursaryCriteria types this as plain string[], so a stale slug here would silently
    // never match instead of failing to compile — see the check in scripts/checks/.
    eligibleCegepPrograms: ["200.B0"],
    eligibleUniversityPrograms: null,
    minRScore: 27,
    minSession: null,
    tagCriteria: null,
    amountMin: 1500,
    amountMax: 1500,
    deadlineIso: "2026-10-15",
    applicationUrl: "https://www.cegep-ste-foy.qc.ca/fondation/",
    hasPublicApplicationLink: true,
    requiresEssay: false,
    requiresRecommendation: false,
    sourceUrl: "https://www.cegep-ste-foy.qc.ca/fondation/bourses/",
    lastVerifiedAt: "2026-03-03",
  },
  {
    id: "implication-communautaire",
    name: "Bourse d'implication communautaire Desjardins",
    sourceOrg: "Fondation du Cégep de Sainte-Foy",
    cegepId: "sainte-foy",
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: null,
    minSession: null,
    tagCriteria: ["volunteering", "community_engagement"],
    amountMin: 500,
    amountMax: 500,
    deadlineIso: "2026-11-01",
    applicationUrl: "https://www.cegep-ste-foy.qc.ca/fondation/",
    hasPublicApplicationLink: true,
    requiresEssay: true,
    requiresRecommendation: false,
    sourceUrl: "https://www.cegep-ste-foy.qc.ca/fondation/bourses/",
    lastVerifiedAt: "2026-03-03",
  },
  {
    // Exercises the internal-application path: no public form exists, so the card must
    // route the student to their cégep instead of offering a dead link.
    id: "perseverance-sainte-foy",
    name: "Bourse de persévérance scolaire",
    sourceOrg: "Fondation du Cégep de Sainte-Foy",
    cegepId: "sainte-foy",
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: null,
    minSession: 2,
    tagCriteria: ["perseverance"],
    amountMin: null,
    amountMax: null,
    deadlineIso: null,
    applicationUrl: null,
    hasPublicApplicationLink: false,
    requiresEssay: false,
    requiresRecommendation: true,
    sourceUrl: "https://www.cegep-ste-foy.qc.ca/fondation/bourses/",
    lastVerifiedAt: "2026-03-03",
  },
  {
    id: "afe-prets-bourses",
    name: "Programme de prêts et bourses (AFE)",
    sourceOrg: "Gouvernement du Québec",
    cegepId: null,
    eligibleCegepPrograms: null,
    eligibleUniversityPrograms: null,
    minRScore: null,
    minSession: null,
    tagCriteria: null,
    amountMin: null,
    amountMax: null,
    deadlineIso: null,
    applicationUrl: "https://www.quebec.ca/education/aide-financiere-aux-etudes",
    hasPublicApplicationLink: true,
    requiresEssay: false,
    requiresRecommendation: false,
    sourceUrl: "https://www.quebec.ca/education/aide-financiere-aux-etudes",
    lastVerifiedAt: "2026-02-18",
  },
];

export type Deadline = {
  id: string;
  titleFr: string;
  titleEn: string;
  dateIso: string;
  detailFr: string;
  detailEn: string;
  urgent?: boolean;
  sourceUrl: string;
  lastVerifiedAt: string;
};

export const DEADLINES: Deadline[] = [
  {
    id: "withdrawal",
    titleFr: "Date limite d'abandon sans échec",
    titleEn: "Course Withdrawal Deadline",
    dateIso: "2026-11-13",
    detailFr: "Dernier jour pour abandonner un cours sans mention d'échec.",
    detailEn: "Last day to drop without failure.",
    urgent: true,
    sourceUrl: "https://www.cegep-ste-foy.qc.ca/",
    lastVerifiedAt: "2026-03-03",
  },
  {
    id: "sram-round-1",
    titleFr: "Ronde d'admission SRAM — 1er tour",
    titleEn: "SRAM Admission Round 1",
    dateIso: "2027-03-01",
    detailFr: "Date limite pour soumettre tes demandes d'admission universitaire.",
    detailEn: "Submit university applications.",
    sourceUrl: SRAM_SOURCE,
    lastVerifiedAt: "2026-03-03",
  },
];

export const STUDENT_SAMPLE = {
  cegep: CEGEPS[0],
  program: CEGEP_PROGRAMS[0],
  session: SESSIONS[4],
  rScoreEstimated: 32.4,
};

export const DASHBOARD_SAMPLE = {
  currentEstimate: 32.41,
  currentSessionLabelFr: "Automne 2026",
  currentSessionLabelEn: "Fall 2026",
  confirmedSessions: [
    { sessionFr: "Hiver 2026", sessionEn: "Winter 2026", score: 31.85 },
    { sessionFr: "Automne 2025", sessionEn: "Fall 2025", score: 30.2 },
  ],
  // No groupStdDev: real cégep bulletins publish the group average but essentially never
  // the standard deviation, so this exercises the degraded path in src/lib/rscore/impact.ts
  // deliberately, rather than the idealised full cote-Z path.
  currentCourses: [
    {
      nameFr: "Calcul différentiel",
      nameEn: "Calculus I",
      code: "201-NYA-05",
      grade: 88,
      groupAverage: 72,
    },
    {
      nameFr: "Physique — Mécanique",
      nameEn: "Physics: Mechanics",
      code: "203-NYA-05",
      grade: 82,
      groupAverage: 75,
    },
    {
      nameFr: "Philosophie et rationalité",
      nameEn: "Philosophy",
      code: "340-101-MQ",
      grade: 76,
      groupAverage: 78,
    },
  ],
  // Reuses UNIVERSITY_PROGRAMS' real udem-droit figures rather than a separate fabricated
  // single-cutoff mock — see the 2026-08-24 data audit on why one current number is wrong here.
  goalProgram: {
    nameFr: "Droit (UdeM)",
    nameEn: "Law (UdeM)",
    cutoffHistory: [
      { year: 2024, cutoff: 31.505, figureType: "last_admitted" as const, sourceTier: "university_official" as const },
      { year: 2024, cutoff: 33.168, figureType: "average" as const, sourceTier: "university_official" as const },
      { year: 2024, cutoff: 38.058, figureType: "maximum" as const, sourceTier: "university_official" as const },
    ],
    sourceUrl: "https://admission.umontreal.ca/statistiques-dadmission-cote-r/",
    lastVerifiedAt: "2026-08-24",
  },
};
