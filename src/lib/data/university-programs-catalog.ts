import raw from "./raw/university-programs.json";

/**
 * Real university program listings, scraped 2026-08-25 from each university's own admission
 * site. Broader but shallower than UNIVERSITY_PROGRAMS in src/lib/sample-data.ts:
 *   - Broader: 200 real, named programs across 5 universities (McGill, Laval, UQAM, UdeM,
 *     Concordia) with real admission-page URLs, vs. sample-data.ts's 6 hand-researched programs.
 *   - Shallower: no cutoffHistory, no prerequisites, no placementRate — none of that can be
 *     invented from a program's name and URL. Every one of those still needs the same
 *     primary-source verification pass sample-data.ts's 6 programs went through (see that
 *     file's UNIVERSITY_PROGRAMS for the pattern: figure_type, source_tier, a real citation).
 *
 * Uneven per-institution depth is inherited from the source scrape, not smoothed over here:
 * Concordia's page enumerated every program (166); McGill/Laval/UQAM's scrape only reached a
 * handful of flagship programs (4-6) rather than their full calendars. Do not present per-
 * institution counts as comparable coverage.
 *
 * Do not merge into UNIVERSITY_PROGRAMS — that type requires interestIds, cohortLabel,
 * sourceUrl, lastVerifiedAt, cutoffHistory and prerequisites, all of which would have to be
 * fabricated for 200 rows. Keep this as the broad discovery catalog; UNIVERSITY_PROGRAMS stays
 * the small, fully-verified set the cutoff/prerequisite engines actually reason over.
 */

export type UniversityProgramListing = {
  institution: string;
  programName: string;
  sourceUrl: string;
};

type RawUniversity = {
  university_name: string;
  programs: { program_name: string; url: string }[];
};

export const UNIVERSITY_PROGRAM_CATALOG: UniversityProgramListing[] = (raw as RawUniversity[]).flatMap((u) =>
  u.programs.map((p) => ({
    institution: u.university_name,
    programName: p.program_name,
    sourceUrl: p.url,
  })),
);
