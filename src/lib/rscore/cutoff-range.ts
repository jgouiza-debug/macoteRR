import type { CutoffEntry } from "@/lib/sample-data";
import type { TranslationKey } from "@/lib/i18n/dictionary";

/**
 * Universities publish multi-year ranges, min/max/average, or nothing at all — never one
 * current-year number. See docs/01-data-architecture.md. A student's score is compared
 * against a published range, never against a single cutoff.
 */
export type CutoffRange = { low: number; high: number; years: number[] };
export type CutoffStatus = "above" | "inside" | "below" | "unknown";

/** university_official always wins over cegep_compiled when both exist for a program. */
export function getCutoffRange(history: CutoffEntry[]): CutoffRange | null {
  const official = history.filter((h) => h.sourceTier === "university_official");
  const pool = official.length > 0 ? official : history;
  if (pool.length === 0) return null;

  const values = pool.map((h) => h.cutoff);
  const years = [...new Set(pool.map((h) => h.year))].sort((a, b) => a - b);
  return { low: Math.min(...values), high: Math.max(...values), years };
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

export const CUTOFF_STATUS_COLOR_CLASS: Record<CutoffStatus, string> = {
  above: "text-moss",
  inside: "text-ultramarine",
  below: "text-ember",
  unknown: "text-ink/40",
};
