/**
 * The app's view over the generated Quebec City catalogue.
 *
 * `catalog.generated.ts` is machine-written and must not be edited; this module is the
 * hand-maintained layer on top of it — indexes, lookups, ordering, and the interest-domain
 * classification the university-choice quiz runs on.
 *
 * Everything here is pure and synchronous. The catalogue ships in the bundle rather than
 * being fetched, because onboarding's first screen is a cégep picker and a student who just
 * opened the app on cégep wifi should not wait on a round-trip to see it.
 */

import {
  CATALOG_CEGEPS,
  CATALOG_CEGEP_PROGRAMS,
  CATALOG_UNIVERSITIES,
  CATALOG_UNIVERSITY_PROGRAMS,
  type CatalogCegep,
  type CatalogCegepProgram,
  type CatalogUniversity,
  type CatalogUniversityProgram,
  type CegepProgramType,
} from "./catalog.generated";

export type {
  CatalogCegep,
  CatalogCegepProgram,
  CatalogUniversity,
  CatalogUniversityProgram,
  CegepProgramType,
};

export { CATALOG_CEGEPS, CATALOG_CEGEP_PROGRAMS, CATALOG_UNIVERSITIES, CATALOG_UNIVERSITY_PROGRAMS };

// ------------------------------------------------------------------ indexes

const CEGEP_BY_CODE = new Map(CATALOG_CEGEPS.map((c) => [c.shortCode, c]));
const CEGEP_PROGRAM_BY_ID = new Map(CATALOG_CEGEP_PROGRAMS.map((p) => [p.id, p]));
const UNIVERSITY_BY_CODE = new Map(CATALOG_UNIVERSITIES.map((u) => [u.shortCode, u]));
const UNIVERSITY_PROGRAM_BY_ID = new Map(CATALOG_UNIVERSITY_PROGRAMS.map((p) => [p.id, p]));

const PROGRAMS_BY_CEGEP = new Map<string, CatalogCegepProgram[]>();
for (const program of CATALOG_CEGEP_PROGRAMS) {
  const bucket = PROGRAMS_BY_CEGEP.get(program.cegepShortCode);
  if (bucket) bucket.push(program);
  else PROGRAMS_BY_CEGEP.set(program.cegepShortCode, [program]);
}

export function findCegep(shortCode: string | null | undefined): CatalogCegep | undefined {
  return shortCode ? CEGEP_BY_CODE.get(shortCode) : undefined;
}

export function findCegepProgram(id: string | null | undefined): CatalogCegepProgram | undefined {
  return id ? CEGEP_PROGRAM_BY_ID.get(id) : undefined;
}

export function findUniversity(shortCode: string | null | undefined): CatalogUniversity | undefined {
  return shortCode ? UNIVERSITY_BY_CODE.get(shortCode) : undefined;
}

export function findUniversityProgram(
  id: string | null | undefined,
): CatalogUniversityProgram | undefined {
  return id ? UNIVERSITY_PROGRAM_BY_ID.get(id) : undefined;
}

/** Programs offered by one cégep, already alphabetised by the generator. */
export function programsForCegep(shortCode: string | null | undefined): CatalogCegepProgram[] {
  return shortCode ? (PROGRAMS_BY_CEGEP.get(shortCode) ?? []) : [];
}

// ------------------------------------------------------------------ searching

/** Accent- and case-insensitive, so "cegep" matches "Cégep" and "genie" matches "génie". */
export function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function matchesQuery(haystack: string, query: string): boolean {
  const q = normalizeForSearch(query);
  if (!q) return true;
  return normalizeForSearch(haystack).includes(q);
}

// ------------------------------------------------------- program type labels

export const CEGEP_PROGRAM_TYPE_ORDER: CegepProgramType[] = ["pre_university", "technical", "special"];

const PROGRAM_TYPE_LABELS: Record<CegepProgramType, { fr: string; en: string }> = {
  pre_university: { fr: "Préuniversitaire", en: "Pre-university" },
  technical: { fr: "Technique", en: "Technical" },
  special: { fr: "Cheminement particulier", en: "Transition pathway" },
};

export function programTypeLabel(type: CegepProgramType, locale: "fr" | "en"): string {
  return PROGRAM_TYPE_LABELS[type][locale];
}

// ----------------------------------------------------------- interest domains
//
// The university-choice quiz needs to turn "what interests you" into a shortlist drawn from
// 198 scraped program names of wildly mixed granularity — UdeM publishes 20 broad faculties,
// Concordia publishes 166 individual majors. Rather than pretend a taxonomy exists in the
// source data, each domain owns a keyword list matched against the program name in both
// languages. A program can land in several domains; one that matches nothing simply never
// surfaces from the quiz, and stays reachable by search.

export type InterestDomainId =
  | "health"
  | "engineering"
  | "computing"
  | "business"
  | "law_politics"
  | "sciences"
  | "social_human"
  | "arts_design"
  | "communication"
  | "education"
  | "environment";

export type InterestDomain = {
  id: InterestDomainId;
  fr: string;
  en: string;
  /** Lowercase, unaccented substrings matched against the normalised program name. */
  keywords: string[];
};

export const INTEREST_DOMAINS: InterestDomain[] = [
  {
    id: "health",
    fr: "Santé et soins",
    en: "Health & care",
    keywords: [
      "sante", "medecine", "medicine", "nursing", "infirm", "pharma", "dent", "physio",
      "readaptation", "kinesio", "nutrition", "ergotherapie", "orthophonie", "optometrie",
      "sciences de la vie", "biomedical", "exercise science", "health", "occupational therapy",
      "speech", "audiolog", "podiatr", "sage-femme",
    ],
  },
  {
    id: "engineering",
    fr: "Génie et technologies",
    en: "Engineering & tech",
    keywords: [
      "genie", "engineering", "beng", "bse", "aerospace", "mechanical", "electrical", "civil",
      "industrial", "chemical engineering", "building engineering", "sciences appliquees",
    ],
  },
  {
    id: "computing",
    fr: "Informatique et données",
    en: "Computing & data",
    keywords: [
      "informatique", "computer science", "software", "logiciel", "data", "donnees",
      "intelligence artificielle", "artificial intelligence", "cybersecur", "information systems",
      "computation", "game design", "web",
    ],
  },
  {
    id: "business",
    fr: "Affaires et gestion",
    en: "Business & management",
    keywords: [
      "administration", "gestion", "management", "bcomm", "bcom", "commerce", "comptab",
      "accountancy", "finance", "marketing", "economie", "economics", "actuarial", "actuariat",
      "supply chain", "entrepreneur", "human resource", "real estate", "insurance", "business",
    ],
  },
  {
    id: "law_politics",
    fr: "Droit et politique",
    en: "Law & politics",
    keywords: [
      "droit", "law", "juridique", "political", "politique", "science politique",
      "relations internationales", "international studies", "human rights", "criminolog",
      "public policy", "justice",
    ],
  },
  {
    id: "sciences",
    fr: "Sciences pures",
    en: "Pure sciences",
    keywords: [
      "mathemat", "physic", "physique", "chimie", "chemistry", "biolog", "biochim", "biochem",
      "statistic", "statistiqu", "geolog", "astro", "sciences pures", "actuarial mathematics",
      "biophysics", "neuroscience",
    ],
  },
  {
    id: "social_human",
    fr: "Sciences humaines et sociales",
    en: "Social sciences & humanities",
    keywords: [
      "psycholog", "sociolog", "anthropolog", "histoire", "history", "philosoph", "geograph",
      "sciences humaines", "social", "religion", "etudes", "studies", "linguist", "lettres",
      "langue", "language", "litterature", "literature", "translation", "traduction", "classics",
    ],
  },
  {
    id: "arts_design",
    fr: "Arts, design et création",
    en: "Arts, design & creation",
    keywords: [
      "art", "arts", "musique", "music", "design", "theatre", "cinema", "film", "danse", "dance",
      "beaux-arts", "bfa", "amenagement", "architecture", "urbanis", "photograph", "sculpture",
      "painting", "creative", "studio", "animation",
    ],
  },
  {
    id: "communication",
    fr: "Communication et médias",
    en: "Communication & media",
    keywords: [
      "communication", "journalis", "media", "medias", "publicit", "advertis", "professional writing",
      "redaction", "broadcast",
    ],
  },
  {
    id: "education",
    fr: "Enseignement",
    en: "Teaching & education",
    keywords: [
      "enseignement", "education", "teaching", "pedagog", "didactique", "adult education",
      "early childhood", "child studies",
    ],
  },
  {
    id: "environment",
    fr: "Environnement et durabilité",
    en: "Environment & sustainability",
    keywords: [
      "environnement", "environment", "developpement durable", "sustainab", "ecolog", "climat",
      "agro", "foresterie", "forestry", "geographie physique", "urban planning",
    ],
  },
];

export const INTEREST_DOMAIN_BY_ID = new Map(INTEREST_DOMAINS.map((d) => [d.id, d]));

export function interestDomainLabel(id: InterestDomainId, locale: "fr" | "en"): string {
  const domain = INTEREST_DOMAIN_BY_ID.get(id);
  if (!domain) return id;
  return locale === "fr" ? domain.fr : domain.en;
}

/**
 * Domains a program name falls into. Built once at module load rather than per keystroke —
 * 198 programs × ~200 keywords is cheap once and wasteful on every render.
 */
const DOMAINS_BY_PROGRAM = new Map<string, InterestDomainId[]>();
for (const program of CATALOG_UNIVERSITY_PROGRAMS) {
  const haystack = normalizeForSearch(program.name);
  const matched = INTEREST_DOMAINS.filter((domain) =>
    domain.keywords.some((keyword) => haystack.includes(keyword)),
  ).map((domain) => domain.id);
  if (matched.length > 0) DOMAINS_BY_PROGRAM.set(program.id, matched);
}

export function domainsForUniversityProgram(programId: string): InterestDomainId[] {
  return DOMAINS_BY_PROGRAM.get(programId) ?? [];
}

/**
 * Programs matching any of the chosen domains, ranked by how many of them they hit, so a
 * student who picks "health" and "sciences" sees Biochemistry above plain Anthropology.
 * Ties break alphabetically for a stable, non-arbitrary order.
 */
export function universityProgramsForDomains(
  domains: InterestDomainId[],
): { program: CatalogUniversityProgram; matches: InterestDomainId[] }[] {
  if (domains.length === 0) return [];
  const wanted = new Set(domains);

  return CATALOG_UNIVERSITY_PROGRAMS.map((program) => ({
    program,
    matches: domainsForUniversityProgram(program.id).filter((d) => wanted.has(d)),
  }))
    .filter((row) => row.matches.length > 0)
    .sort(
      (a, b) =>
        b.matches.length - a.matches.length ||
        a.program.name.localeCompare(b.program.name, "fr"),
    );
}
