import { NextResponse } from "next/server";
import { DEFAULT_CATALOG } from "@/lib/data/reference-catalog";
import { loadCatalogVersion } from "@/lib/data/reference-server";

/** Cheap boot check: which catalogue version the server currently holds. */
export async function GET() {
  try {
    const db = await loadCatalogVersion();
    const info = db ?? { version: DEFAULT_CATALOG.version, generatedAt: DEFAULT_CATALOG.generatedAt, source: "bundle" as const };
    return NextResponse.json(info, {
      headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=600", "X-Catalog-Source": info.source },
    });
  } catch (error) {
    console.error("reference version: falling back to the shipped catalogue", error);
    return NextResponse.json(
      { version: DEFAULT_CATALOG.version, generatedAt: DEFAULT_CATALOG.generatedAt, source: "fallback" },
      { headers: { "Cache-Control": "no-store", "X-Catalog-Source": "fallback" } },
    );
  }
}
