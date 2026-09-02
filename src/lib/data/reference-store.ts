"use client";

/**
 * Local-first reference store.
 *
 * Boots from the shipped catalogue, keeps the last server bundle in IndexedDB, and on each
 * boot asks /api/reference/version whether anything changed. Same version → zero further
 * reads. New version → one bundle fetch. Offline → the cached bundle, else the shipped one.
 *
 * This is what lets a corrected bursary deadline or a re-verified cutoff reach students
 * without a redeploy: the promotion pipeline writes Postgres, /api/reference/bundle overlays
 * it onto the shipped data, and every client picks it up on its next boot.
 */

import { useSyncExternalStore } from "react";
import { idbGet, idbSet } from "./indexed-db";
import { DEFAULT_CATALOG, isReferenceCatalog, type ReferenceCatalog } from "./reference-catalog";

const IDB_KEY = "current";
const listeners = new Set<() => void>();
const inFlightRequests = new Map<string, Promise<unknown>>();

let memoryCatalog: ReferenceCatalog = DEFAULT_CATALOG;
let isInitialized = false;

function publish(next: ReferenceCatalog) {
  memoryCatalog = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Deduplicate in-flight requests: if two components request the same key within the same
 * tick, only one network request is made.
 */
export function deduplicateRequest<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = inFlightRequests.get(key);
  if (existing) return existing as Promise<T>;
  const promise = fetcher().finally(() => {
    inFlightRequests.delete(key);
  });
  inFlightRequests.set(key, promise);
  return promise;
}

async function readCache(): Promise<ReferenceCatalog | null> {
  try {
    const cached = await idbGet<unknown>("reference_catalog", IDB_KEY);
    return isReferenceCatalog(cached) ? cached : null;
  } catch {
    return null;
  }
}

export async function initReferenceCatalog(): Promise<ReferenceCatalog> {
  if (typeof window === "undefined") return DEFAULT_CATALOG;
  if (isInitialized) return memoryCatalog;

  return deduplicateRequest("init_catalog", async () => {
    const cached = await readCache();
    // Whatever happens next, a cached bundle newer than the shipped one is worth showing now.
    if (cached && cached.version !== DEFAULT_CATALOG.version) publish(cached);

    try {
      const versionRes = await fetch("/api/reference/version", {
        headers: { Accept: "application/json" },
        cache: "no-cache",
      });
      if (!versionRes.ok) throw new Error(`version ${versionRes.status}`);
      const { version: serverVersion } = (await versionRes.json()) as { version: string };

      // Cache hit: nothing changed on the server, zero further reads.
      if (cached && cached.version === serverVersion) {
        publish(cached);
        isInitialized = true;
        return cached;
      }
      // The shipped bundle already is the server version: nothing to fetch either.
      if (serverVersion === DEFAULT_CATALOG.version) {
        publish(DEFAULT_CATALOG);
        isInitialized = true;
        return DEFAULT_CATALOG;
      }

      const bundleRes = await fetch("/api/reference/bundle", { headers: { Accept: "application/json" } });
      if (!bundleRes.ok) throw new Error(`bundle ${bundleRes.status}`);
      const bundle: unknown = await bundleRes.json();
      if (!isReferenceCatalog(bundle)) throw new Error("bundle has the wrong shape");
      // A fallback payload is the shipped data under another name; never pin it in the cache.
      if (bundle.source !== "fallback") await idbSet("reference_catalog", IDB_KEY, bundle).catch(() => {});
      publish(bundle);
      isInitialized = true;
      return bundle;
    } catch {
      // Offline or the server misbehaved: the cached bundle if any, else the shipped one.
      const fallback = cached ?? DEFAULT_CATALOG;
      publish(fallback);
      isInitialized = true;
      return fallback;
    }
  });
}

export function getReferenceCatalog(): ReferenceCatalog {
  return memoryCatalog;
}

/** The current catalogue, re-rendering when a newer bundle lands. Server snapshot is the shipped one. */
export function useReferenceCatalog(): ReferenceCatalog {
  return useSyncExternalStore(subscribe, getReferenceCatalog, () => DEFAULT_CATALOG);
}
