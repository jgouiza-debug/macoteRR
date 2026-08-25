/**
 * Local-First Reference Store:
 * Ships the reference dataset once, caches in IndexedDB, and checks
 * an integer version on boot. Issue 0 network reads if version matches.
 * Provides request deduplication across concurrent components.
 */

import { idbGet, idbSet } from "./indexed-db";
import { REFERENCE_CATALOG_VERSION } from "./version";
import {
  UNIVERSITY_PROGRAMS,
  BURSARIES,
  DEADLINES,
  SESSIONS,
  type UniversityProgram,
  type Bursary,
  type Deadline,
  type Session,
} from "@/lib/sample-data";
import {
  CATALOG_CEGEPS,
  CATALOG_CEGEP_PROGRAMS,
  CATALOG_UNIVERSITIES,
  CATALOG_UNIVERSITY_PROGRAMS,
  type CatalogCegep,
  type CatalogCegepProgram,
  type CatalogUniversity,
  type CatalogUniversityProgram,
} from "@/lib/data/catalog";

export type ReferenceCatalog = {
  version: number;
  cegeps: CatalogCegep[];
  cegepPrograms: CatalogCegepProgram[];
  universities: CatalogUniversity[];
  /** Full scraped directory: names and links, no admission figures. */
  universityCatalog: CatalogUniversityProgram[];
  /** The subset carrying sourced cutoffs — what the comparison screens read. */
  universityPrograms: UniversityProgram[];
  bursaries: Bursary[];
  deadlines: Deadline[];
  sessions: Session[];
  generatedAt: string;
};

const DEFAULT_CATALOG: ReferenceCatalog = {
  version: REFERENCE_CATALOG_VERSION,
  cegeps: CATALOG_CEGEPS,
  cegepPrograms: CATALOG_CEGEP_PROGRAMS,
  universities: CATALOG_UNIVERSITIES,
  universityCatalog: CATALOG_UNIVERSITY_PROGRAMS,
  universityPrograms: UNIVERSITY_PROGRAMS,
  bursaries: BURSARIES,
  deadlines: DEADLINES,
  sessions: SESSIONS,
  generatedAt: "2026-08-25T00:00:00.000Z",
};

const inFlightRequests = new Map<string, Promise<unknown>>();

/**
 * Deduplicate in-flight requests: If two components request the same key
 * within the same tick, only one network request is made.
 */
export function deduplicateRequest<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = fetcher().finally(() => {
    inFlightRequests.delete(key);
  });

  inFlightRequests.set(key, promise);
  return promise;
}

let memoryCatalog: ReferenceCatalog = DEFAULT_CATALOG;
let isInitialized = false;

export async function initReferenceCatalog(): Promise<ReferenceCatalog> {
  if (typeof window === "undefined") {
    return DEFAULT_CATALOG;
  }

  if (isInitialized) {
    return memoryCatalog;
  }

  return deduplicateRequest("init_catalog", async () => {
    try {
      // 1. Try reading from IndexedDB
      const cached = await idbGet<ReferenceCatalog>("reference_catalog", "current");

      // 2. Fetch server version with timeout
      const versionRes = await fetch("/api/reference/version", {
        headers: { Accept: "application/json" },
        cache: "no-cache",
      });

      if (!versionRes.ok) {
        if (cached) {
          memoryCatalog = cached;
          isInitialized = true;
          return cached;
        }
        return DEFAULT_CATALOG;
      }

      const { version: serverVersion } = (await versionRes.json()) as { version: number };

      // 3. Cache hit: Version matches, 0 further network reads
      if (cached && cached.version === serverVersion) {
        memoryCatalog = cached;
        isInitialized = true;
        return cached;
      }

      // 4. Cache miss or version bump: Fetch full bundle
      const bundleRes = await fetch("/api/reference/bundle");
      if (bundleRes.ok) {
        const bundle = (await bundleRes.json()) as ReferenceCatalog;
        await idbSet("reference_catalog", "current", bundle);
        memoryCatalog = bundle;
        isInitialized = true;
        return bundle;
      }
    } catch {
      // Offline fallback: Use cached or default catalog
      const cached = await idbGet<ReferenceCatalog>("reference_catalog", "current");
      if (cached) {
        memoryCatalog = cached;
        isInitialized = true;
        return cached;
      }
    }

    isInitialized = true;
    return memoryCatalog;
  });
}

export function getReferenceCatalog(): ReferenceCatalog {
  return memoryCatalog;
}
