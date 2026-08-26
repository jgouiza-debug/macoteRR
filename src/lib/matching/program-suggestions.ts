import { CEGEP_PROGRAM_CATALOG, type CegepProgramSummary } from "@/lib/data/cegep-programs-catalog";
import { UNIVERSITY_PROGRAM_CATALOG, type UniversityProgramListing } from "@/lib/data/university-programs-catalog";
import { getGenericProgramProfile, type GenericProgramProfile } from "@/lib/data/generic-program-profiles";

/**
 * Broad-catalog program suggestions: cégep ↔ university programs whose NAMES share
 * significant words ("informatique" in both "Techniques de l'informatique" and "Baccalauréat
 * en informatique et génie logiciel"), or connected through ministerial generic profiles
 * (e.g. Sciences humaines 300.A0 -> Administration, Droit, Psychologie).
 *
 * EXPLAINABILITY PRINCIPLE:
 * Deliberately NOT a predictive fit score or recommendation engine (Code des professions,
 * art. 37.1). Every suggestion includes its factual match rationale (`sharedWords` or `matchChip`)
 * showing *why* it appears ("matched on: informatique", "Profil : Administration").
 */

const STOPWORDS = new Set([
  "de", "des", "du", "la", "le", "les", "et", "en", "au", "aux", "un", "une",
  "pour", "dans", "sur", "avec", "the", "and", "of", "in", "for", "baccalaureat", "maitrise", "certificat",
]);

/**
 * Closed synonym groups for common cégep-name / university-name connections.
 */
const SYNONYM_GROUPS: string[][] = [
  ["droit", "juridiques", "juridique", "law"],
  ["infirmiers", "infirmieres", "infirmier", "infirmiere", "soins", "nursing"],
  ["gestion", "administration", "affaires", "management", "business", "commerce", "comptabilite"],
  ["genie", "ingenierie", "engineering"],
  ["sante", "medicale", "medical", "medecine", "dentaire", "pharmacie"],
  ["education", "enseignement", "pedagogie", "teaching"],
  ["arts", "lettres", "litterature", "communication", "journalisme"],
  ["informatique", "logiciel", "software", "computing", "donnees"],
  ["psychologie", "psychoeducation", "social", "sociologie"],
  ["biologie", "biochimie", "chimie", "physique", "science"],
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

export type ProgramSuggestion<T> = {
  item: T;
  sharedWords: string[];
  matchChip?: string;
};

function suggest<T>(
  sourceName: string,
  catalog: readonly T[],
  nameOf: (item: T) => string,
  limit: number,
  profile?: GenericProgramProfile,
): ProgramSuggestion<T>[] {
  const sourceWords = tokenize(sourceName);

  // If a generic profile exists (e.g. 300.A0 or 200.B0), include profile keywords
  const profileWords = new Map<string, string>(); // word -> profile reason
  if (profile) {
    for (const p of profile.profils) {
      const pWords = tokenize(p.name);
      for (const w of pWords) {
        profileWords.set(w, `Profil : ${p.name.split(" ")[0]}`);
      }
    }
  }

  if (sourceWords.size === 0 && profileWords.size === 0) return [];

  const scored = catalog
    .map((item) => {
      const itemWords = tokenize(nameOf(item));
      const sharedWords = [...itemWords].filter(
        (word) => sourceWords.has(word) || profileWords.has(word),
      );

      let matchChip: string | undefined;
      for (const word of sharedWords) {
        if (profileWords.has(word)) {
          matchChip = profileWords.get(word);
          break;
        }
      }
      if (!matchChip && sharedWords.length > 0) {
        matchChip = `Programme : ${sourceName.split(" ")[0]}`;
      }

      return {
        item,
        sharedWords,
        matchChip,
      };
    })
    .filter((row) => row.sharedWords.length > 0);

  scored.sort((a, b) => b.sharedWords.length - a.sharedWords.length);
  return scored.slice(0, limit);
}

export function suggestUniversityProgramsForCegepProgram(
  cegepProgramName: string,
  limit = 8,
  programCode?: string | null,
): ProgramSuggestion<UniversityProgramListing>[] {
  const profile = programCode ? getGenericProgramProfile(programCode) : undefined;
  return suggest(
    cegepProgramName,
    UNIVERSITY_PROGRAM_CATALOG,
    (p) => p.programName,
    limit,
    profile,
  );
}

export function suggestCegepProgramsForUniversityProgram(
  universityProgramName: string,
  limit = 8,
): ProgramSuggestion<CegepProgramSummary>[] {
  return suggest(
    universityProgramName,
    CEGEP_PROGRAM_CATALOG,
    (p) => p.programName,
    limit,
  );
}
