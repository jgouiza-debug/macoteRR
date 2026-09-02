/**
 * The one answer to "what is this cégep / DEC called", whichever vocabulary the code arrives in.
 *
 * Three catalogues name the same things differently (see cegep-institutions.ts): the curated
 * `CEGEPS` list ("Cégep de Sainte-Foy"), the scraped offerings ("Cégep Limoilou : campus de
 * Limoilou", "Collège Bart (privé)"), and the ministerial DEC list ("Sciences de la nature").
 * Every screen used to chain two or three of them by hand, and one of those chains
 * (profile) compared an un-normalised scraped code against a normalised one and never
 * matched. Resolve here, once.
 */

import { CEGEPS, CEGEP_PROGRAMS } from "@/lib/sample-data";
import { CEGEP_DEC_PROGRAM_BY_CODE } from "@/lib/data/cegep-catalog";
import {
  findCegepInstitution,
  findDecProgramName,
  normalizeProgramCode,
} from "@/lib/data/cegep-institutions";

/** Display name for a cégep short code ("sainte-foy"), or null when it is unknown or unset. */
export function resolveCegepName(shortCode: string | null | undefined): string | null {
  if (!shortCode) return null;
  // The curated name reads cleaner ("Collège Bart" vs the scrape's "Collège Bart (privé)");
  // the scraped one covers campuses and colleges the curated list never had.
  return (
    CEGEPS.find((c) => c.id === shortCode)?.name ??
    findCegepInstitution(shortCode)?.name ??
    null
  );
}

/**
 * Display name for a ministerial DEC code, in either spelling ("200B1" or "200.B1"), or null.
 * The scraped offering name wins because it is what the student saw when they picked it.
 */
export function resolveDecName(
  code: string | null | undefined,
  locale: "fr" | "en" = "fr",
): string | null {
  if (!code) return null;
  const normalized = normalizeProgramCode(code);
  const scraped = findDecProgramName(normalized);
  if (scraped) return scraped;
  const curated = CEGEP_DEC_PROGRAM_BY_CODE.get(normalized);
  if (curated) return locale === "fr" ? curated.nameFr : curated.nameEn;
  return CEGEP_PROGRAMS.find((p) => p.id === normalized)?.name ?? null;
}
