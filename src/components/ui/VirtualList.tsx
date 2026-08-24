"use client";

import React, { useState, useEffect, useRef, useMemo, type ReactNode } from "react";

export type VirtualListProps<T> = {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  overscan?: number;
  className?: string;
};

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
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(600);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setScrollTop(containerRef.current.scrollTop);
      }
    };

    const updateHeight = () => {
      if (containerRef.current) {
        setViewportHeight(containerRef.current.clientHeight || 600);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("resize", updateHeight);
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

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

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
      style={{ willChange: "scroll-position", WebkitOverflowScrolling: "touch" }}
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
