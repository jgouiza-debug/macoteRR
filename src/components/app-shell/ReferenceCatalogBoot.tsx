"use client";

import { useEffect } from "react";
import { initReferenceCatalog } from "@/lib/data/reference-store";

/**
 * Kicks off the reference catalogue boot (src/lib/data/reference-store.ts) once per page
 * load. Renders nothing. Mounted from the (app) and onboarding layouts so every consumer of
 * `useReferenceCatalog()` sees a newer server bundle without doing anything itself.
 */
export function ReferenceCatalogBoot() {
  useEffect(() => {
    initReferenceCatalog().catch(() => {});
  }, []);
  return null;
}
