"use client";

import { useState, useEffect, useRef, useMemo, type ReactNode } from "react";

export type VirtualListProps<T> = {
  items: T[];
  /** Fixed pixel height of every row. A row taller than this overlaps the one below it. */
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  overscan?: number;
  className?: string;
  /**
   * "self" (default): the list is its own scroll box and needs a bounded height from `className`.
   * "window": the page scrolls; the list measures where it sits in the viewport and mounts only
   * the rows that intersect it. A list that lives under a header, a search box and a chip row on
   * a phone belongs to the page scroll — a second scroll box inside it is a trap for the thumb.
   */
  scrollParent?: "self" | "window";
};

const DEFAULT_VIEWPORT = 600;

/**
 * High-performance virtualized list renderer:
 * Only mounts DOM nodes for visible items + overscan buffer.
 * Keeps DOM size constant even with 200+ items.
 */
export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  keyExtractor,
  overscan = 5,
  className = "",
  scrollParent = "self",
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(DEFAULT_VIEWPORT);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (scrollParent === "window") {
      // One measurement feeds both numbers, so a resize that also moves the list's offset
      // cannot leave the rendered window a frame out of date. The body observer catches
      // content above the list growing or shrinking without a scroll event (a locale switch,
      // a card that appears after hydration).
      const measure = () => {
        setScrollTop(Math.max(0, -container.getBoundingClientRect().top));
        setViewportHeight(window.innerHeight);
      };
      measure();
      window.addEventListener("scroll", measure, { passive: true });
      window.addEventListener("resize", measure);
      const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
      observer?.observe(document.body);
      return () => {
        window.removeEventListener("scroll", measure);
        window.removeEventListener("resize", measure);
        observer?.disconnect();
      };
    }

    const handleScroll = () => setScrollTop(container.scrollTop);
    const updateHeight = () => setViewportHeight(container.clientHeight || DEFAULT_VIEWPORT);

    updateHeight();
    window.addEventListener("resize", updateHeight);
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", updateHeight);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [scrollParent]);

  const totalHeight = items.length * itemHeight;

  const { startIndex, endIndex } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(viewportHeight / itemHeight);
    const end = Math.min(items.length, start + visibleCount + overscan * 2);
    return { startIndex: start, endIndex: end };
  }, [scrollTop, itemHeight, viewportHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex).map((item, idx) => {
      const realIndex = startIndex + idx;
      return {
        item,
        index: realIndex,
        key: keyExtractor(item, realIndex),
        top: realIndex * itemHeight,
      };
    });
  }, [items, startIndex, endIndex, itemHeight, keyExtractor]);

  const selfScroll = scrollParent === "self";

  return (
    <div
      ref={containerRef}
      className={`${selfScroll ? "overflow-y-auto" : ""} ${className}`}
      style={selfScroll ? { willChange: "scroll-position", WebkitOverflowScrolling: "touch" } : undefined}
    >
      <div style={{ height: `${totalHeight}px`, position: "relative", width: "100%" }}>
        {visibleItems.map(({ item, index, key, top }) => (
          <div
            key={key}
            style={{
              position: "absolute",
              top: `${top}px`,
              left: 0,
              right: 0,
              height: `${itemHeight}px`,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
