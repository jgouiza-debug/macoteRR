/**
 * Bridges the three vocabularies the app uses for a cégep.
 *
 *   - `CEGEPS` in src/lib/sample-data.ts keys them by short code ("sainte-foy"), which is what
 *     `StudentProfile.cegepId`, the bursary rows, and `cegeps.short_code` in Supabase all use.
 *   - `CEGEP_PROGRAM_OFFERINGS` in ./cegep-programs-catalog.ts keys them by the display name
 *     the scrape captured ("Cégep de Sainte-Foy"), because that is all the source pages gave.
 *   - `CEGEP_PROGRAMS` in sample-data keys DEC programs by ministerial code ("200.B0"), which
 *     is what src/lib/matching/program-eligibility.ts matches curriculum against.
 *
 * Nothing else should hard-code a scraped institution name. This is the one place the mapping
 * lives, so a rename in the scrape breaks here loudly rather than silently emptying a picker.
 *
 * The list is derived from the offerings rather than hand-written, so it can never claim a
 * cégep the catalogue has no programs for. That is why it supersedes sample-data's six-entry
 * `CEGEPS` stub for anything program-related: the scrape covers eleven institutions, including
 * Limoilou's two campuses as separate entries, which the stub collapsed into one.
 */

import { CEGEP_PROGRAM_OFFERINGS, type CegepProgramCategory } from "./cegep-programs-catalog";

export type CegepInstitution = {
  /** Stable key used by the profile, the bursary rows, and `cegeps.short_code`. */
  shortCode: string;
  /** Exactly as the scrape captured it — the join key into CEGEP_PROGRAM_OFFERINGS. */
  name: string;
  websiteUrl: string | null;
  programCount: number;
};

/**
 * Scraped display name → short code. A name missing here is a hard error rather than a
 * silently-slugged guess: a drifted code would orphan a student's saved profile and quietly
 * detach them from their cégep's bursaries.
 */
const SHORT_CODE_BY_NAME: Record<string, string> = {
  "Cégep de Sainte-Foy": "sainte-foy",
  "Cégep Garneau": "garneau",
  "Cégep Limoilou : campus de Limoilou": "limoilou",
  "Cégep Limoilou : campus de Charlesbourg": "limoilou-charlesbourg",
  "Champlain College: St. Lawrence Campus": "champlain-slc",
  "Centre d'études collégiales en Charlevoix": "charlevoix",
  "Conservatoire de musique de Québec": "conservatoire-quebec",
  "Collège Bart (privé)": "bart",
  "Mérici Collégial Privé (privé)": "merici",
  "Notre-Dame-de-Foy (privé)": "notre-dame-de-foy",
  "Collège O'Sullivan de Québec (privé)": "osullivan-quebec",
};

export const CEGEP_INSTITUTIONS: CegepInstitution[] = (() => {
  const byName = new Map<string, CegepInstitution>();

  for (const offering of CEGEP_PROGRAM_OFFERINGS) {
    const existing = byName.get(offering.cegepName);
    if (existing) {
      existing.programCount += 1;
      continue;
    }

    const shortCode = SHORT_CODE_BY_NAME[offering.cegepName];
    if (!shortCode) {
      throw new Error(
        `No short code mapped for scraped cégep "${offering.cegepName}" — add one to SHORT_CODE_BY_NAME.`,
      );
    }

    byName.set(offering.cegepName, {
      shortCode,
      name: offering.cegepName,
      websiteUrl: offering.cegepWebsite,
      programCount: 1,
    });
  }

  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name, "fr"));
})();

const BY_SHORT_CODE = new Map(CEGEP_INSTITUTIONS.map((c) => [c.shortCode, c]));

export function findCegepInstitution(shortCode: string | null | undefined) {
  return shortCode ? BY_SHORT_CODE.get(shortCode) : undefined;
}

/**
 * `310C0` -> `310.C0`. The ministry publishes these codes with a separator; this scrape
 * dropped it, while the curated catalogue in ./cegep-catalog.ts keeps it. Normalising here
 * means a stored code is always in one canonical form.
 *
 * Note the two catalogues still disagree on program *revisions* — Sainte-Foy runs 200.B1 where
 * the curated list records 200.B0. That is real, not a bug: revisions differ by cégep. A code
 * the curated list does not know simply yields `prerequisites_unknown` from
 * src/lib/matching/program-eligibility.ts, which is the honest answer and already a state that
 * module renders distinctly. Do not "fix" it by snapping to the nearest known revision.
 */
export function normalizeProgramCode(code: string): string {
  const trimmed = code.trim();
  if (/^\d{3}[A-Z0-9]{2}$/i.test(trimmed)) {
    return `${trimmed.slice(0, 3)}.${trimmed.slice(3).toUpperCase()}`;
  }
  return trimmed;
}

export type CegepDecOffering = {
  /** Ministerial code — the id `CEGEP_PROGRAMS` and the profile both use. */
  programCode: string;
  programName: string;
  category: CegepProgramCategory;
};

/**
 * The DEC programs one cégep actually offers, de-duplicated by ministerial code and sorted by
 * name. Empty for an unknown or unset cégep, which callers should read as "no filter yet"
 * rather than "this school offers nothing".
 */
export function decOfferingsAtCegep(shortCode: string | null | undefined): CegepDecOffering[] {
  const institution = findCegepInstitution(shortCode);
  if (!institution) return [];

  const byCode = new Map<string, CegepDecOffering>();
  for (const offering of CEGEP_PROGRAM_OFFERINGS) {
    if (offering.cegepName !== institution.name) continue;
    if (byCode.has(offering.programCode)) continue;
    byCode.set(offering.programCode, {
      programCode: normalizeProgramCode(offering.programCode),
      programName: offering.programName,
      category: offering.category,
    });
  }

  return [...byCode.values()].sort((a, b) => a.programName.localeCompare(b.programName, "fr"));
}

/** Ministerial codes offered at one cégep, for filtering a list keyed by code. */
export function decCodesAtCegep(shortCode: string | null | undefined): Set<string> {
  return new Set(decOfferingsAtCegep(shortCode).map((o) => o.programCode));
}
