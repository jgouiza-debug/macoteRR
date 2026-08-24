import { NextResponse } from "next/server";
import { REFERENCE_CATALOG_VERSION } from "@/lib/data/version";

export async function GET() {
  return NextResponse.json(
    { version: REFERENCE_CATALOG_VERSION },
    {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}
