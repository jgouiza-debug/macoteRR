"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/dictionary";

const OPTIONS: Locale[] = ["fr", "en"];

export function LangToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div
      role="group"
      aria-label="Langue / Language"
      className="flex items-center gap-0.5 rounded-full border border-ink/20 bg-paper p-0.5"
    >
      {OPTIONS.map((option) => {
        const active = locale === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            aria-pressed={active}
            // Each option is a full 44px target; the gap keeps the two from sharing an edge.
            className="flex min-h-[44px] min-w-[44px] items-center justify-center"
          >
            <span
              className={`flex min-h-[44px] items-center rounded-full px-2.5 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                active ? "bg-ink text-paper" : "text-ink/55 hover:text-ink"
              }`}
            >
              {option}
            </span>
          </button>
        );
      })}
    </div>
  );
}
