import type { CutoffEntry } from "@/lib/sample-data";
import type { TranslationKey } from "@/lib/i18n/dictionary";

/**
 * Universities publish multi-year ranges, min/max/average, or nothing at all — never one
 * current-year number. See docs/01-data-architecture.md. A student's score is compared
 * against a published range, never against a single cutoff.
 */
/**
 * "range": the figures are what a university published as the admitted cote R (last admitted,
 * average, maximum, the top of a range), so low–high is the published range across years.
 * "floor": the university published only a minimum (range_low, minimum_required), so low–high
 * are the published MINIMUMS across years and the top of the real range is unknown. 165 of the
 * 237 catalogue programmes are floors; calling a floor "the published range" and a score above
 * it "above the range" told a 31,20 student they cleared medicine at 22,5 (guardrail #6).
 */
export type CutoffKind = "range" | "floor";
export type CutoffRange = { low: number; high: number; years: number[]; kind: CutoffKind };
export type CutoffStatus = "above" | "inside" | "below" | "unknown";

const FLOOR_TYPES: CutoffEntry["figureType"][] = ["range_low", "minimum_required"];

/** university_official always wins over cegep_compiled when both exist for a program. */
export function getCutoffRange(history: CutoffEntry[]): CutoffRange | null {
  const official = history.filter((h) => h.sourceTier === "university_official");
  const pool = official.length > 0 ? official : history;
  if (pool.length === 0) return null;

  // Admitted-score figures describe the range; a minimum only describes its floor. When a
  // programme publishes both, the admitted figures win and the minimum is not mixed in.
  const admitted = pool.filter((h) => !FLOOR_TYPES.includes(h.figureType));
  const chosen = admitted.length > 0 ? admitted : pool;
  const kind: CutoffKind = admitted.length > 0 ? "range" : "floor";

  const values = chosen.map((h) => h.cutoff);
  const years = [...new Set(chosen.map((h) => h.year))].sort((a, b) => a - b);
  return { low: Math.min(...values), high: Math.max(...values), years, kind };
}

export function compareToCutoffRange(score: number, range: CutoffRange | null): CutoffStatus {
  if (!range) return "unknown";
  if (score > range.high) return "above";
  if (score < range.low) return "below";
  return "inside";
}

/** "2023" for a single year, "2020–2022" for a span. */
export function formatRangeYears(range: CutoffRange): string {
  if (range.years.length <= 1) return String(range.years[0]);
  return `${range.years[0]}–${range.years[range.years.length - 1]}`;
}

/** Shared display mapping so every screen ranks/labels/colors the four states identically. */
export const CUTOFF_STATUS_ORDER: Record<CutoffStatus, number> = {
  above: 0,
  inside: 1,
  below: 2,
  unknown: 3,
};

export const CUTOFF_STATUS_LABEL_KEY: Record<CutoffStatus, TranslationKey> = {
  above: "cutoff.above",
  inside: "cutoff.inside",
  below: "cutoff.below",
  unknown: "cutoff.unverified",
};

/** For a floor, the same four states are about the published minimum, and say so. */
export const CUTOFF_FLOOR_STATUS_LABEL_KEY: Record<CutoffStatus, TranslationKey> = {
  above: "cutoff.aboveFloor",
  inside: "cutoff.atFloor",
  below: "cutoff.belowFloor",
  unknown: "cutoff.unverified",
};

/** The status word for a comparison against `range`: range vocabulary or floor vocabulary. */
export function cutoffStatusLabelKey(status: CutoffStatus, range: CutoffRange | null): TranslationKey {
  return range?.kind === "floor" ? CUTOFF_FLOOR_STATUS_LABEL_KEY[status] : CUTOFF_STATUS_LABEL_KEY[status];
}

/** "Cotes publiées" for a range, "Minimum publié" for a floor. */
export function cutoffRangeLabelKey(range: CutoffRange): TranslationKey {
  return range.kind === "floor" ? "cutoff.publishedFloor" : "cutoff.publishedRange";
}

export const CUTOFF_STATUS_COLOR_CLASS: Record<CutoffStatus, string> = {
  above: "text-moss",
  inside: "text-ultramarine",
  below: "text-ember",
  unknown: "text-ink/40",
};
