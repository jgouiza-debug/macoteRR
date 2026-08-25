import { NextResponse } from "next/server";
import {
  CEGEPS,
  CEGEP_PROGRAMS,
  UNIVERSITY_PROGRAMS,
  BURSARIES,
  DEADLINES,
  SESSIONS,
} from "@/lib/sample-data";
import { REFERENCE_CATALOG_VERSION } from "@/lib/data/version";

export async function GET() {
  const payload = {
    version: REFERENCE_CATALOG_VERSION,
    cegeps: CEGEPS,
    cegepPrograms: CEGEP_PROGRAMS,
    universityPrograms: UNIVERSITY_PROGRAMS,
    bursaries: BURSARIES,
    deadlines: DEADLINES,
    sessions: SESSIONS,
    generatedAt: "2026-08-24T00:00:00.000Z",
  };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: `"macote-ref-v${REFERENCE_CATALOG_VERSION}"`,
    },
  });
}
