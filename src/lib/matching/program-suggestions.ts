import { CEGEP_PROGRAM_CATALOG, type CegepProgramSummary } from "@/lib/data/cegep-programs-catalog";
import { UNIVERSITY_PROGRAM_CATALOG, type UniversityProgramListing } from "@/lib/data/university-programs-catalog";

/**
 * Broad-catalog program suggestions: cégep ↔ university programs whose NAMES share
 * significant words ("informatique" in both "Techniques de l'informatique" and "Baccalauréat
 * en informatique et génie logiciel"). This is deliberately NOT the same thing as
 * src/lib/matching/program-eligibility.ts's prerequisite-coverage check — that module compares
 * verified curricula and can say "met" / "partial" / "unknown". This one has no curriculum
 * data to compare (see cegep-programs-catalog.ts's header) and only ever answers "these two
 * program names appear to be about the same field" — a discovery aid, not an eligibility
 * signal. `sharedWords` is returned specifically so a caller can show its work ("matched on:
 * informatique") rather than presenting a bare ranked list as if it were a computed score.
 */

const STOPWORDS = new Set([
  "de", "des", "du", "la", "le", "les", "et", "en", "au", "aux", "un", "une",
  "pour", "dans", "sur", "avec", "aux", "the", "and", "of", "in", "for",
]);

/**
 * Closed synonym groups for common c\u00e9gep-name / university-name mismatches a bare token
 * overlap misses entirely \u2014 a technical DEC's "Techniques juridiques" and a university's
 * "Droit" share zero words otherwise. Same philosophy as program-eligibility.ts's alias
 * table: explicit and closed, not fuzzy or substring matching. Not exhaustive \u2014 expand as
 * real gaps turn up, don't try to pre-guess every field's vocabulary.
 */
const SYNONYM_GROUPS: string[][] = [
  ["droit", "juridiques", "juridique", "law"],
  ["infirmiers", "infirmieres", "infirmier", "infirmiere", "soins", "nursing"],
  ["gestion", "administration", "affaires", "management", "business"],
  ["genie", "ingenierie", "engineering"],
  ["comptabilite", "comptable", "accounting"],
  ["sante", "medicale", "medical", "medecine"],
  ["education", "enseignement", "pedagogie", "teaching"],
  ["arts", "lettres", "litterature", "communication"],
  ["informatique", "logiciel", "software", "computing"],
];

const SYNONYM_OF = new Map<string, string[]>();
for (const group of SYNONYM_GROUPS) {
  for (const word of group) SYNONYM_OF.set(word, group);
}

function tokenize(name: string): Set<string> {
  const words = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));

  const expanded = new Set<string>(words);
  for (const word of words) {
    for (const synonym of SYNONYM_OF.get(word) ?? []) expanded.add(synonym);
  }
  return expanded;
}

export type ProgramSuggestion<T> = { item: T; sharedWords: string[] };

function suggest<T>(
  sourceName: string,
  catalog: readonly T[],
  nameOf: (item: T) => string,
  limit: number,
): ProgramSuggestion<T>[] {
  const sourceWords = tokenize(sourceName);
  if (sourceWords.size === 0) return [];

  const scored = catalog
    .map((item) => ({
      item,
      sharedWords: [...tokenize(nameOf(item))].filter((word) => sourceWords.has(word)),
    }))
    .filter((row) => row.sharedWords.length > 0);

  scored.sort((a, b) => b.sharedWords.length - a.sharedWords.length);
  return scored.slice(0, limit);
}

export function suggestUniversityProgramsForCegepProgram(
  cegepProgramName: string,
  limit = 8,
): ProgramSuggestion<UniversityProgramListing>[] {
  return suggest(cegepProgramName, UNIVERSITY_PROGRAM_CATALOG, (p) => p.programName, limit);
}

export function suggestCegepProgramsForUniversityProgram(
  universityProgramName: string,
  limit = 8,
): ProgramSuggestion<CegepProgramSummary>[] {
  return suggest(universityProgramName, CEGEP_PROGRAM_CATALOG, (p) => p.programName, limit);
}
