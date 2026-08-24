import type { BursaryCriteria } from "@/lib/matching/match";
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

export type CegepProgram = { id: string; name: string };

export const CEGEP_PROGRAMS: CegepProgram[] = [
  { id: "sciences-nature", name: "Sciences de la nature" },
  { id: "sciences-humaines", name: "Sciences humaines" },
  { id: "arts-lettres", name: "Arts, lettres et communication" },
  { id: "informatique", name: "Techniques de l'informatique" },
  { id: "sciences-lettres-arts", name: "Sciences, lettres et arts" },
];

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

export type UniversityProgram = {
  id: string;
  name: string;
  institution: string;
  description: string;
  overallCutoff: number;
  cohortLabel: string;
  courseFloor?: { course: string; minGrade: number; note: string };
  placementRate?: { value: number; note: string };
  professionalOrders?: { codes: string[]; note: string };
  sourceUrl: string;
  lastVerifiedAt: string;
  cutoffHistory: { year: number; cutoff: number }[];
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
    overallCutoff: 27.5,
    cohortLabel: "Cohorte automne 2026",
    courseFloor: {
      course: "Mathématiques",
      minGrade: 26.5,
      note: "Cote R minimale exigée dans les préalables de mathématiques.",
    },
    placementRate: {
      value: 96,
      note: "En emploi ou aux études supérieures dans les 6 mois suivant la diplomation.",
    },
    professionalOrders: {
      codes: ["CPA", "CRHA", "CFA"],
      note: "Ordres et titres professionnels que rejoignent couramment les diplômés du BAA.",
    },
    sourceUrl: "https://www.hec.ca/programmes/baccalaureats/baccalaureat-administration-affaires/",
    lastVerifiedAt: "2026-03-03",
    cutoffHistory: [
      { year: 2024, cutoff: 26.8 },
      { year: 2025, cutoff: 27.1 },
      { year: 2026, cutoff: 27.5 },
    ],
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
    overallCutoff: 28.0,
    cohortLabel: "Cohorte automne 2026",
    placementRate: {
      value: 94,
      note: "En emploi ou aux études supérieures dans les 6 mois suivant la diplomation.",
    },
    professionalOrders: {
      codes: ["OIQ"],
      note: "Le titre d'ingénieur au Québec est réservé et encadré par l'Ordre des ingénieurs.",
    },
    sourceUrl: "https://www.polymtl.ca/futur/",
    lastVerifiedAt: "2026-02-12",
    cutoffHistory: [
      { year: 2024, cutoff: 27.6 },
      { year: 2025, cutoff: 27.8 },
      { year: 2026, cutoff: 28.0 },
    ],
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
    overallCutoff: 31.5,
    cohortLabel: "Cohorte automne 2026",
    professionalOrders: {
      codes: ["Barreau", "Notaires"],
      note: "Ordres professionnels accessibles après la formation professionnelle requise.",
    },
    sourceUrl: "https://admission.umontreal.ca/",
    lastVerifiedAt: "2026-01-18",
    cutoffHistory: [
      { year: 2024, cutoff: 31.0 },
      { year: 2025, cutoff: 31.2 },
      { year: 2026, cutoff: 31.5 },
    ],
    prerequisites: [],
  },
  {
    id: "laval-sciences-bio",
    name: "Sciences biologiques",
    institution: "Université Laval",
    description:
      "Étude du vivant, de la génétique aux écosystèmes, avec une forte composante de laboratoire et de terrain.",
    overallCutoff: 24.5,
    cohortLabel: "Cohorte automne 2026",
    sourceUrl: "https://www.ulaval.ca/etudes/programmes",
    lastVerifiedAt: "2026-03-03",
    cutoffHistory: [],
    prerequisites: [],
  },
  {
    id: "laval-genie-civil",
    name: "Génie civil",
    institution: "Université Laval",
    description:
      "Conception et gestion des infrastructures : structures, transport, ressources hydriques et géotechnique.",
    overallCutoff: 26.0,
    cohortLabel: "Cohorte automne 2026",
    professionalOrders: {
      codes: ["OIQ"],
      note: "Le titre d'ingénieur au Québec est réservé et encadré par l'Ordre des ingénieurs.",
    },
    sourceUrl: "https://www.ulaval.ca/etudes/programmes",
    lastVerifiedAt: "2026-03-03",
    cutoffHistory: [],
    prerequisites: [],
  },
  {
    id: "laval-sciences-infirmieres",
    name: "Sciences infirmières",
    institution: "Université Laval",
    description:
      "Formation clinique menant à l'exercice infirmier, avec stages en milieu hospitalier dès la première année.",
    overallCutoff: 28.5,
    cohortLabel: "Cohorte automne 2026",
    professionalOrders: {
      codes: ["OIIQ"],
      note: "L'exercice infirmier au Québec est réservé aux membres de l'Ordre.",
    },
    sourceUrl: "https://www.ulaval.ca/etudes/programmes",
    lastVerifiedAt: "2026-03-03",
    cutoffHistory: [],
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
    eligibleCegepPrograms: ["sciences-nature"],
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
  currentCourses: [
    {
      nameFr: "Calcul différentiel",
      nameEn: "Calculus I",
      code: "201-NYA-05",
      grade: 88,
      groupAverage: 72,
      impact: "high" as const,
    },
    {
      nameFr: "Physique — Mécanique",
      nameEn: "Physics: Mechanics",
      code: "203-NYA-05",
      grade: 82,
      groupAverage: 75,
      impact: "neutral" as const,
    },
    {
      nameFr: "Philosophie et rationalité",
      nameEn: "Philosophy",
      code: "340-101-MQ",
      grade: 76,
      groupAverage: 78,
      impact: "low" as const,
    },
  ],
  goalProgram: {
    nameFr: "Médecine (UdeM)",
    nameEn: "Medicine (UdeM)",
    cutoff: 33.5,
    sourceUrl: "https://admission.umontreal.ca/",
    lastVerifiedAt: "2026-01-18",
  },
};
