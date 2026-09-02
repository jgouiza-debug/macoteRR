/**
 * The universities the catalogue actually contains, derived from UNIVERSITY_PROGRAMS rather
 * than written down twice. Two screens (the goal wizard and /programs) used to carry their own
 * 17-entry copies and match them by substring; a renamed institution silently emptied a chip.
 * Filters match on `id` with strict equality.
 */

import { UNIVERSITY_PROGRAMS } from "@/lib/sample-data";

export type University = {
  /** Exactly `UniversityProgram.institution`. */
  id: string;
  /** Short chip label; falls back to the full name for anything not listed here. */
  label: string;
};

const SHORT_LABELS: Record<string, string> = {
  "Université Laval": "ULaval",
  "Université de Montréal": "UdeM",
  "McGill University": "McGill",
  "HEC Montréal": "HEC",
  "Polytechnique Montréal": "Polytechnique",
  "Université de Sherbrooke": "UdeS",
  "Concordia University": "Concordia",
  "Université du Québec à Montréal (UQAM)": "UQAM",
  "École de technologie supérieure (ÉTS)": "ÉTS",
  "Université du Québec à Trois-Rivières (UQTR)": "UQTR",
  "Université du Québec à Chicoutimi (UQAC)": "UQAC",
  "Université du Québec à Rimouski (UQAR)": "UQAR",
  "Université du Québec en Outaouais (UQO)": "UQO",
  "Université du Québec en Abitibi-Témiscamingue (UQAT)": "UQAT",
  "Bishop's University": "Bishop's",
  "Université TÉLUQ": "TÉLUQ",
};

/** In first-appearance order of the catalogue, which lists the Quebec City universities first. */
export const UNIVERSITIES: University[] = [...new Set(UNIVERSITY_PROGRAMS.map((p) => p.institution))].map(
  (id) => ({ id, label: SHORT_LABELS[id] ?? id }),
);

export function universityLabel(id: string): string {
  return SHORT_LABELS[id] ?? id;
}
