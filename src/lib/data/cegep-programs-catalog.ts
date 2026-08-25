import raw from "./raw/cegep-programs.json";

/**
 * Real cégep program offerings, scraped 2026-08-24 from 11 Capitale-Nationale-area
 * institutions' own program pages (see docs/02-scraping-collection-plan.md's target list).
 *
 * This is a BROADER but SHALLOWER catalog than src/lib/data/cegep-catalog.ts:
 *   - Broader: 150 real offerings (83 distinct ministerial codes) across all 11 target
 *     institutions, vs. cegep-catalog.ts's hand-curated 42 DEC programs.
 *   - Shallower: no core-course curriculum data. cegep-catalog.ts's `coreCourseCodes` (used by
 *     src/lib/matching/program-eligibility.ts for precise prerequisite matching) has no
 *     equivalent here — this file only knows a program's name, ministerial code, category, and
 *     which cégep(s) offer it. It cannot answer "does this DEC's curriculum cover that
 *     prerequisite" — only "does a program with this name exist, and where."
 *
 * Do not merge these into cegep-catalog.ts's CEGEP_DEC_PROGRAMS: that type's contract requires
 * `coreCourseCodes` (even if empty-but-verified), which this data does not have. Keep the two
 * catalogs separate rather than fabricate a `coreCoursesVerified: true` on data that was never
 * checked against a curriculum.
 */

export type CegepProgramCategory = "Programme préuniversitaire" | "Programme technique" | "Cheminement particulier";

export type CegepProgramOffering = {
  cegepName: string;
  cegepWebsite: string | null;
  programCode: string;
  programName: string;
  category: CegepProgramCategory;
  /** Raw HTML from the program's own page — render only through a sanitizer, never as-is. */
  descriptionHtml: string;
};

type RawCegep = {
  cegep_name: string;
  website: string;
  programs: {
    program_code: string;
    program_name: string;
    category: string;
    description: string;
  }[];
};

export const CEGEP_PROGRAM_OFFERINGS: CegepProgramOffering[] = (raw as RawCegep[]).flatMap((cegep) =>
  cegep.programs.map((p) => ({
    cegepName: cegep.cegep_name,
    cegepWebsite: cegep.website || null,
    programCode: p.program_code,
    programName: p.program_name,
    category: p.category as CegepProgramCategory,
    descriptionHtml: p.description,
  })),
);

/** One row per distinct ministerial code, with every cégep offering it. */
export type CegepProgramSummary = {
  programCode: string;
  programName: string;
  category: CegepProgramCategory;
  offeredAt: string[];
};

export const CEGEP_PROGRAM_CATALOG: CegepProgramSummary[] = (() => {
  const byCode = new Map<string, CegepProgramSummary>();
  for (const offering of CEGEP_PROGRAM_OFFERINGS) {
    const existing = byCode.get(offering.programCode);
    if (existing) {
      existing.offeredAt.push(offering.cegepName);
    } else {
      byCode.set(offering.programCode, {
        programCode: offering.programCode,
        programName: offering.programName,
        category: offering.category,
        offeredAt: [offering.cegepName],
      });
    }
  }
  return [...byCode.values()].sort((a, b) => a.programName.localeCompare(b.programName, "fr"));
})();
