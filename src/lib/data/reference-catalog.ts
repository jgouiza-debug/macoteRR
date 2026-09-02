/**
 * The reference catalogue: the one payload the app reads its programmes, bursaries, dates
 * and institutions from. Shared by the server route that builds it (from Postgres when a
 * project is configured, from the shipped TypeScript otherwise) and the client store that
 * caches it. No React, no Node APIs, so both sides can import it.
 */

import {
  CEGEPS,
  CEGEP_PROGRAMS,
  UNIVERSITY_PROGRAMS,
  BURSARIES,
  SESSIONS,
  type Cegep,
  type CegepProgram,
  type UniversityProgram,
  type Bursary,
  type Session,
} from "@/lib/sample-data";
import { ALL_IMPORTANT_DATES, type ImportantDate } from "@/lib/data/important-dates";
import { REFERENCE_CATALOG_GENERATED_AT, REFERENCE_CATALOG_VERSION } from "@/lib/data/version";

/** Where a catalogue came from — surfaced so a stale fallback is never mistaken for live data. */
export type CatalogSource = "bundle" | "db" | "fallback";

export type ReferenceCatalog = {
  /** Hash written by scripts/data/build-catalog.ts, or the catalog_versions row it seeded. */
  version: string;
  generatedAt: string;
  source: CatalogSource;
  cegeps: Cegep[];
  cegepPrograms: CegepProgram[];
  universityPrograms: UniversityProgram[];
  bursaries: Bursary[];
  deadlines: ImportantDate[];
  sessions: Session[];
};

/** The catalogue the app ships. Always available, offline included. */
export const DEFAULT_CATALOG: ReferenceCatalog = {
  version: REFERENCE_CATALOG_VERSION,
  generatedAt: REFERENCE_CATALOG_GENERATED_AT,
  source: "bundle",
  cegeps: CEGEPS,
  cegepPrograms: CEGEP_PROGRAMS,
  universityPrograms: UNIVERSITY_PROGRAMS,
  bursaries: BURSARIES,
  deadlines: ALL_IMPORTANT_DATES,
  sessions: SESSIONS,
};

/** Shape check before a fetched or cached payload is trusted (a cached HTML error page is not a catalogue). */
export function isReferenceCatalog(value: unknown): value is ReferenceCatalog {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.version === "string" &&
    typeof v.generatedAt === "string" &&
    Array.isArray(v.cegeps) &&
    Array.isArray(v.cegepPrograms) &&
    Array.isArray(v.universityPrograms) &&
    Array.isArray(v.bursaries) &&
    Array.isArray(v.deadlines) &&
    Array.isArray(v.sessions)
  );
}
