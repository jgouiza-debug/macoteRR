/**
 * Reference catalogue version: a hash of the seed body, written by scripts/data/build-catalog.ts.
 * The bundle the app ships and the rows in Postgres report the same version for the same data;
 * clients re-fetch /api/reference/bundle when this changes (src/lib/data/reference-store.ts).
 */
export const REFERENCE_CATALOG_VERSION = "518f528bc725e92a";
export const REFERENCE_CATALOG_GENERATED_AT = "2026-08-25T00:00:00.000Z";
