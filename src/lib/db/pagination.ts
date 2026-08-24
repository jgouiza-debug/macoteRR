/**
 * Keyset pagination helper for high-performance PostgreSQL queries.
 * Avoids OFFSET performance degradation by indexing on (created_at, id) or (cutoff, id).
 */

export type KeysetPaginationOptions<T> = {
  cursor?: { value: string | number; id: string } | null;
  limit?: number;
  direction?: "asc" | "desc";
  cursorField?: keyof T;
};

export type PaginatedResult<T> = {
  items: T[];
  nextCursor: { value: string | number; id: string } | null;
  hasMore: boolean;
};

export function paginateByKeyset<T extends { id: string }>(
  items: T[],
  limit = 50,
  cursorExtractor: (item: T) => string | number,
): PaginatedResult<T> {
  const pageItems = items.slice(0, limit);
  const hasMore = items.length > limit;

  const nextCursor = hasMore && pageItems.length > 0
    ? {
        value: cursorExtractor(pageItems[pageItems.length - 1]),
        id: pageItems[pageItems.length - 1].id,
      }
    : null;

  return {
    items: pageItems,
    nextCursor,
    hasMore,
  };
}
