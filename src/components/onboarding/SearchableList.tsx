"use client";

import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { Search, Check } from "lucide-react";
import { matchesQuery } from "@/lib/data/catalog";

export type ListOption = {
  id: string;
  label: string;
  /** Second line — a ministerial code, a campus, a program type. */
  detail?: string;
  /** Optional grouping key; rows sharing one render under a single sticky header. */
  group?: string;
};

/**
 * The picker shared by the cégep and program steps.
 *
 * Search is deferred rather than debounced: with 150 rows the filter itself is trivial, and
 * useDeferredValue keeps the input's own keystrokes at the top priority without inventing a
 * delay the student can feel.
 */
export function SearchableList({
  options,
  selectedId,
  onSelect,
  searchLabel,
  emptyLabel,
  groupLabels,
  footerNote,
}: {
  options: ListOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchLabel: string;
  emptyLabel: string;
  /** Display names for the `group` keys, in render order. Ungrouped lists may omit this. */
  groupLabels?: { key: string; label: string }[];
  footerNote?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(
    () =>
      options.filter(
        (option) =>
          matchesQuery(option.label, deferredQuery) ||
          (option.detail ? matchesQuery(option.detail, deferredQuery) : false),
      ),
    [options, deferredQuery],
  );

  const sections = useMemo(() => {
    if (!groupLabels) return [{ key: "", label: null as string | null, rows: filtered }];
    return groupLabels
      .map(({ key, label }) => ({
        key,
        label: label as string | null,
        rows: filtered.filter((option) => option.group === key),
      }))
      .filter((section) => section.rows.length > 0);
  }, [filtered, groupLabels]);

  return (
    <>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          type="search"
          aria-label={searchLabel}
          placeholder={searchLabel}
          autoComplete="off"
          className="h-[52px] w-full rounded border border-ink/15 bg-paper pl-11 pr-4 text-[15px] text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-[1.5px] focus:border-ultramarine"
        />
      </div>

      {footerNote && <p className="mb-3 text-[12px] text-ink/45">{footerNote}</p>}

      <div role="listbox" aria-label={searchLabel} className="flex flex-col gap-2.5 pb-4">
        {sections.map((section) => (
          <div key={section.key} className="flex flex-col gap-2.5">
            {section.label && (
              <h2 className="sticky top-14 z-10 -mx-1 bg-chalk/95 px-1 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-ink/45 backdrop-blur-sm">
                {section.label}
              </h2>
            )}
            {section.rows.map((option) => {
              const isSelected = selectedId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => onSelect(option.id)}
                  className={`flex min-h-[56px] items-center justify-between gap-3 rounded px-4 py-3 text-left transition-transform transition-colors active:scale-[0.99] ${
                    isSelected
                      ? "border-[1.5px] border-ultramarine bg-ultramarine/[0.07] text-ultramarine"
                      : "border border-ink/15 bg-paper text-ink"
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-[15px] leading-snug wrap-fr ${isSelected ? "font-semibold" : ""}`}
                    >
                      {option.label}
                    </span>
                    {option.detail && (
                      <span
                        className={`mt-0.5 block text-[12px] ${isSelected ? "text-ultramarine/70" : "text-ink/45"}`}
                      >
                        {option.detail}
                      </span>
                    )}
                  </span>
                  {isSelected && <Check className="h-5 w-5 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="py-8 text-center text-[14px] text-ink/50">{emptyLabel}</p>
        )}
      </div>
    </>
  );
}
