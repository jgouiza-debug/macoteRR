/**
 * Structured-HTML collector pattern: scheduled scraper for pages that rarely change shape
 * (program catalogs, course lists) per docs/02-scraping-collection-plan.md.
 *
 * This is the Phase 1 scaffold, not a working scraper: the actual markup for each cegep's
 * "programmes d'etudes" page needs to be inspected per-institution (starting with Sainte-Foy,
 * per the doc's build order) before a real parser can be written against it. Wire up an HTML
 * parser (e.g. cheerio) and the real selectors once that research is done.
 */
import { politeFetch } from "../lib/fetch";
import type { CollectorResult } from "../lib/types";
import type { Database } from "@/lib/db/database.types";

type CegepProgramRow = Database["public"]["Tables"]["staging_cegep_programs"]["Insert"];

function parseProgramsHtml(_html: string): Omit<
  CegepProgramRow,
  "collector_name" | "collected_at" | "review_status" | "raw_snapshot_path"
>[] {
  throw new Error(
    "Not implemented: parse this cegep's program catalog markup once its structure has been inspected.",
  );
}

export async function collectCegepPrograms(sourceUrl: string): Promise<CollectorResult<CegepProgramRow>> {
  const { response, snapshot } = await politeFetch(sourceUrl);
  const html = await response.text();
  const parsed = parseProgramsHtml(html);
  const collectedAt = new Date().toISOString();

  return {
    rows: parsed.map((row) => ({ ...row, collector_name: "cegep-programs.collector", collected_at: collectedAt })),
    sourceUrl,
    snapshot,
    collectedAt,
    collectorName: "cegep-programs.collector",
  };
}
