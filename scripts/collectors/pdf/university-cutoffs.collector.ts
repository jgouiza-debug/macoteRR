/**
 * PDF collector pattern: text extraction plus a hand-written parser per document, since
 * cutoff tables and prerequisite PDFs are not uniform across institutions, per
 * docs/02-scraping-collection-plan.md. Runs at most annually; always lands in staging,
 * never auto-promotes.
 *
 * This is the Phase 1 scaffold, not a working parser: the actual per-document pattern (e.g.
 * HEC Montreal's prerequisites PDF) needs to be written once that document has been inspected.
 * Wire up a PDF text-extraction library (e.g. pdf-parse) and the real per-document pattern then.
 */
import { politeFetch } from "../lib/fetch";
import type { CollectorResult } from "../lib/types";
import type { Database } from "@/lib/db/database.types";

type CutoffRow = Database["public"]["Tables"]["staging_cutoff_history"]["Insert"];

function parseCutoffPdf(_pdfText: string): Omit<
  CutoffRow,
  "collector_name" | "collected_at" | "review_status" | "raw_snapshot_path"
>[] {
  throw new Error(
    "Not implemented: parse this university's cutoff PDF once its layout has been inspected.",
  );
}

export async function collectUniversityCutoffs(sourceUrl: string): Promise<CollectorResult<CutoffRow>> {
  const { snapshot } = await politeFetch(sourceUrl);
  const pdfText = ""; // TODO: extract text from `snapshot` once a PDF library is wired up.
  const parsed = parseCutoffPdf(pdfText);
  const collectedAt = new Date().toISOString();

  return {
    rows: parsed.map((row) => ({ ...row, collector_name: "university-cutoffs.collector", collected_at: collectedAt })),
    sourceUrl,
    snapshot,
    collectedAt,
    collectorName: "university-cutoffs.collector",
  };
}
