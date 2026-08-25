import { NextResponse } from "next/server";
import { UNIVERSITY_PROGRAMS, BURSARIES, DEADLINES, SESSIONS } from "@/lib/sample-data";
import {
  CATALOG_CEGEPS,
  CATALOG_CEGEP_PROGRAMS,
  CATALOG_UNIVERSITIES,
  CATALOG_UNIVERSITY_PROGRAMS,
} from "@/lib/data/catalog";
import { REFERENCE_CATALOG_VERSION } from "@/lib/data/version";

/**
 * The reference bundle the local-first store caches in IndexedDB.
 *
 * `universityPrograms` and `universityCatalog` are deliberately separate lists rather than
 * one merged one: the former carries sourced cutoffs and is what the comparison screens read,
 * while the latter is the full scraped directory of program names and links, which has no
 * admission figures at all. Merging them would put a program with no cutoff next to one with
 * a verified cutoff under the same key, and the UI could no longer tell them apart.
 */
export async function GET() {
  const payload = {
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

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: `"macote-ref-v${REFERENCE_CATALOG_VERSION}"`,
    },
  });
}
