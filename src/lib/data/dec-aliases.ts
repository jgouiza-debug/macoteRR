/**
 * Maps a cégep's own programme code to the ministerial family it belongs to.
 *
 * The picker offers the scraped codes ("200.B1" is Sainte-Foy's Sciences de la nature, "300.13"
 * a Sciences humaines profile, "200.16" a double DEC with Sciences de la nature), while the
 * curated catalogue (src/lib/data/cegep-catalog.ts) and the generic profiles key on the
 * ministerial base code ("200.B0", "300.A0"). Without a bridge, every student who picked a
 * local variant got "prerequisites unknown" for all 237 programmes and no profile card.
 *
 * The bridge is the scraped programme NAME, which the cégep itself writes as "Sciences de la
 * nature : profil Santé" or "Sciences humaines – Monde". Matching the family name is a
 * statement about which ministerial programme the local variant is a version of — the NY
 * science core those variants share (cegep-catalog.ts) is what the prerequisite comparison
 * actually reads. Nothing here asserts a cutoff, a course, or an eligibility.
 */

import { CEGEP_DEC_PROGRAM_BY_CODE } from "./cegep-catalog";
import { findDecProgramName, normalizeProgramCode } from "./cegep-institutions";

const FAMILY_BY_NAME: { pattern: RegExp; base: string }[] = [
  { pattern: /sciences? de la nature|natural science|science de la nature/, base: "200.B0" },
  { pattern: /sciences informatiques et math|computer science and math/, base: "200.C0" },
  { pattern: /sciences humaines|social science/, base: "300.A0" },
  { pattern: /arts, lettres et communication|arts, letters and communication|arts and letters/, base: "500.A1" },
  { pattern: /histoire et civilisation|history and civilization/, base: "700.B0" },
  { pattern: /sciences, lettres et arts|liberal arts/, base: "700.A0" },
  { pattern: /^musique|^music/, base: "501.A0" },
  { pattern: /^danse|^dance/, base: "506.A0" },
  { pattern: /arts visuels|visual arts/, base: "510.A0" },
];

/**
 * The ministerial base code for `code`, or null when neither the code nor its scraped name
 * identifies a family. A code already in the curated catalogue resolves to itself.
 */
export function resolveDecBaseCode(code: string | null | undefined): string | null {
  if (!code) return null;
  const normalized = normalizeProgramCode(code);
  if (CEGEP_DEC_PROGRAM_BY_CODE.has(normalized)) return normalized;
  const name = findDecProgramName(normalized)?.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (!name) return null;
  for (const family of FAMILY_BY_NAME) {
    if (family.pattern.test(name)) return family.base;
  }
  return null;
}
