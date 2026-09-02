import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_CATALOG } from "@/lib/data/reference-catalog";
import { loadCatalogFromDb } from "@/lib/data/reference-server";

/**
 * The full reference catalogue. From Postgres when a project is configured and seeded
 * (X-Catalog-Source: db), otherwise the shipped data (bundle). A database error answers with
 * the shipped data too, but marked `fallback` and `no-store`, so a transient outage can
 * never pin stale data in a cache for an hour.
 *
 * The ETag is the catalogue version, so a client that already holds it gets a 304.
 */
export async function GET(request: NextRequest) {
  const ifNoneMatch = request.headers.get("if-none-match");
  try {
    const db = await loadCatalogFromDb();
    const catalog = db?.catalog ?? DEFAULT_CATALOG;
    const etag = `W/"${catalog.version}"`;
    if (ifNoneMatch === etag) return new NextResponse(null, { status: 304, headers: { ETag: etag } });
    const headers: Record<string, string> = {
      ETag: etag,
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      "X-Catalog-Source": catalog.source,
    };
    if (db && db.stale.length > 0) headers["X-Catalog-Stale"] = db.stale.join(",");
    return NextResponse.json(catalog, { headers });
  } catch (error) {
    console.error("reference bundle: falling back to the shipped catalogue", error);
    return NextResponse.json(
      { ...DEFAULT_CATALOG, source: "fallback" },
      { headers: { "Cache-Control": "no-store", "X-Catalog-Source": "fallback" } },
    );
  }
}
