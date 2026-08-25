/**
 * Resolves a saved target id to something displayable.
 *
 * `StudentProfile.targetUniversityProgramIds` holds ids from two places:
 *
 *   - src/lib/sample-data.ts's UNIVERSITY_PROGRAMS — a handful of programs that carry a
 *     sourced, dated cutoff, added from a program detail page;
 *   - src/lib/data/catalog.ts's CATALOG_UNIVERSITY_PROGRAMS — the full scraped directory of
 *     198 programs with names and links but no admission figures, added by the quiz.
 *
 * They share one namespace on purpose: both describe the same kind of thing, and a few ids
 * (UdeM's Droit, for instance) genuinely refer to the same program in both lists. Where they
 * overlap the sourced entry wins, so a target never loses its cutoff by being added from the
 * quiz instead of the detail page.
 */

import { UNIVERSITY_PROGRAMS } from "@/lib/sample-data";
import { findUniversity, findUniversityProgram } from "@/lib/data/catalog";

export type ResolvedTarget = {
  id: string;
  name: string;
  institution: string;
  /** Only present for the sourced list; the scraped directory has no cutoffs. */
  cutoff: number | null;
  sourceUrl: string | null;
  lastVerifiedAt: string | null;
  /** True when a program detail page exists at /programs/[id]. */
  hasDetailPage: boolean;
};

const SOURCED_BY_ID = new Map(UNIVERSITY_PROGRAMS.map((p) => [p.id, p]));

export function resolveTarget(id: string): ResolvedTarget | null {
  const sourced = SOURCED_BY_ID.get(id);
  if (sourced) {
    return {
      id,
      name: sourced.name,
      institution: sourced.institution,
      cutoff: sourced.overallCutoff,
      sourceUrl: sourced.sourceUrl,
      lastVerifiedAt: sourced.lastVerifiedAt,
      hasDetailPage: true,
    };
  }

  const catalogued = findUniversityProgram(id);
  if (catalogued) {
    return {
      id,
      name: catalogued.name,
      institution: findUniversity(catalogued.universityShortCode)?.name ?? "",
      cutoff: null,
      sourceUrl: catalogued.url || null,
      lastVerifiedAt: null,
      hasDetailPage: false,
    };
  }

  return null;
}

export function resolveTargets(ids: string[]): ResolvedTarget[] {
  return ids.map(resolveTarget).filter((target): target is ResolvedTarget => target !== null);
}
