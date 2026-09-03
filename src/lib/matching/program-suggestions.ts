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
 * art. 37.1). Every suggestion carries its factual match rationale (`match`) showing *why* it
 * appears: the word(s) the two titles share, as they are spelled in the title they came from,
 * and whether the link runs through the DEC's own name or through one of its profiles. The
 * screen phrases it ("lien : informatique"); this module never returns a sentence.
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

/** Accent-free, lower-case form of one word: the vocabulary every comparison runs in. */
function fold(word: string): string {
  return word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokenize(name: string): Set<string> {
  const words = fold(name)
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));

  const expanded = new Set<string>(words);
  for (const word of words) {
    for (const synonym of SYNONYM_OF.get(word) ?? []) expanded.add(synonym);
  }
  return expanded;
}

/** How many words a match label may carry before it stops reading as a label. */
const MAX_LABEL_WORDS = 3;

/**
 * The words of `name`, spelled as they are in `name` ("Génie", not "genie"), that are — or
 * are synonyms of — one of `shared`. This is what the student is shown as the link, so it
 * has to be a word they can find in a title, not a folded token.
 */
function matchedWordsIn(name: string, shared: ReadonlySet<string>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of name.split(/[^\p{L}\p{N}]+/u)) {
    const token = fold(raw);
    if (token.length <= 2 || STOPWORDS.has(token) || seen.has(token)) continue;
    const related = [token, ...(SYNONYM_OF.get(token) ?? [])];
    if (!related.some((word) => shared.has(word))) continue;
    seen.add(token);
    out.push(raw);
    if (out.length >= MAX_LABEL_WORDS) break;
  }
  return out;
}

/**
 * Why a suggestion is on the list. `kind` says which title the link runs through — the DEC's
 * own name ("program") or one of its ministerial profiles ("profile") — and `label` is the
 * shared word(s) from that title, never a sentence, so the screen can phrase and translate
 * the framing itself.
 */
export type SuggestionMatch = {
  kind: "profile" | "program";
  label: string;
};

export type ProgramSuggestion<T> = {
  item: T;
  sharedWords: string[];
  match: SuggestionMatch;
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
  const profileWords = new Map<string, string>(); // word -> the profile name it came from
  if (profile) {
    for (const p of profile.profils) {
      for (const w of tokenize(p.name)) {
        if (!profileWords.has(w)) profileWords.set(w, p.name);
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
      return { item, sharedWords };
    })
    .filter((row) => row.sharedWords.length > 0)
    .map(({ item, sharedWords }) => {
      const shared = new Set(sharedWords);
      const profileName = sharedWords.map((word) => profileWords.get(word)).find(Boolean);

      let match: SuggestionMatch;
      if (profileName) {
        const words = matchedWordsIn(profileName, shared);
        match = { kind: "profile", label: words.length > 0 ? words.join(", ") : profileName };
      } else {
        const words = matchedWordsIn(sourceName, shared);
        match = {
          kind: "program",
          label:
            words.length > 0
              ? words.join(", ")
              : matchedWordsIn(nameOf(item), shared).join(", ") ||
                sharedWords.slice(0, MAX_LABEL_WORDS).join(", "),
        };
      }

      return { item, sharedWords, match };
    });

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

export function suggestTopUniversityPrograms<T extends { name: string }>(
  cegepProgramName: string,
  universityPrograms: readonly T[],
  limit = 5,
  programCode?: string | null,
): ProgramSuggestion<T>[] {
  const profile = programCode ? getGenericProgramProfile(programCode) : undefined;
  return suggest(
    cegepProgramName,
    universityPrograms,
    (p) => p.name,
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
