"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function Header() {
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="w-full bg-chalk pt-safe">
      <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between px-5 md:px-14">
        {/* Brand Logo Lockup */}
        <Link href="/" className="flex items-center gap-2 text-ink hover:opacity-90 transition-opacity">
          <svg width="28" height="22" viewBox="0 0 130.3 100" role="img" aria-label="MaCote logo">
            <path
              d="M0.0 100.0V0.0H41.5Q48.2 0.0 54.2 1.1Q60.2 2.3 65.1 4.5Q70.0 6.8 73.6 10.3Q77.3 13.8 79.2 18.6Q81.2 23.3 81.2 29.4Q81.2 34.1 79.6 38.3Q78.0 42.4 74.6 45.8Q71.2 49.1 65.8 51.3Q60.5 53.5 53.0 54.4V55.6Q62.7 56.1 68.0 59.4Q73.3 62.7 76.0 67.8Q78.6 72.9 80.0 78.8L85.3 100.0H58.2L54.4 80.2Q53.5 75.0 51.6 71.8Q49.7 68.6 46.2 67.1Q42.7 65.6 37.0 65.6H24.5V100.0ZM24.5 46.7H38.8Q47.1 46.7 51.5 43.5Q55.9 40.3 55.9 33.8Q55.9 26.7 51.8 23.2Q47.7 19.7 39.4 19.7H24.5Z"
              fill="#17181A"
            />
            <circle cx="110.3" cy="20.0" r="20.0" fill="#2B4CF5" />
          </svg>
          <span className="font-display text-[20px] font-extrabold tracking-tight text-ink">
            MaCote
          </span>
        </Link>

        {/* Navigation & Language Toggle */}
        <div className="flex items-center gap-6 text-[14px] font-medium text-secondary">
          <div className="hidden sm:flex items-center gap-5">
            <Link href="/confidentialite" className="inline-flex min-h-[48px] items-center hover:text-ink transition-colors">
              {t("prog.privacy")}
            </Link>
            <Link href="/conditions" className="inline-flex min-h-[48px] items-center hover:text-ink transition-colors">
              {t("prog.terms")}
            </Link>
          </div>

          {/* Language Toggle Button */}
          <button
            type="button"
            onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
            className="flex min-h-[48px] items-center justify-center gap-1 text-[13px] font-bold text-ink px-3 py-1.5 rounded-[3px] border border-border bg-paper hover:bg-chalk transition-colors focus-visible:outline-none active:scale-[0.98]"
            aria-label={`Switch language to ${locale === "fr" ? "English" : "Français"}`}
          >
            <span className={locale === "fr" ? "text-ultramarine" : "text-secondary"}>FR</span>
            <span className="text-secondary">/</span>
            <span className={locale === "en" ? "text-ultramarine" : "text-secondary"}>EN</span>
          </button>
        </div>
      </div>
    </header>
  );
}
