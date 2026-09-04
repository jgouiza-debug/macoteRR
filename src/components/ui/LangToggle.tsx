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
      className="flex items-center rounded-full bg-ink p-0.5"
    >
      {OPTIONS.map((option) => {
        const active = locale === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            aria-pressed={active}
            // 44px hit area with negative margins, so the capsule itself stays 32px tall.
            className="-my-1.5 flex min-h-[44px] min-w-[44px] items-center justify-center"
          >
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                active ? "bg-paper text-ink" : "text-paper/60 hover:text-paper"
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
