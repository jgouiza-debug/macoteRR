// Integer version bumped whenever reference catalog data changes.
//
// v2: replaced the six stubbed cégeps and five stubbed programs with the real scraped
// Quebec City catalogue (11 cégeps, 150 programs, 7 universities, 198 university programs)
// and added the `universities` / `universityCatalog` keys to the bundle. Clients holding a
// v1 bundle in IndexedDB refetch on next boot.
export const REFERENCE_CATALOG_VERSION = 2;
