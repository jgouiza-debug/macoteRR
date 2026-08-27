"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    // Half the home-indicator inset, not the whole of it. The full inset hung roughly 34px of
    // empty shell beneath the row, and that gap — not the row — is what made the bar read as
    // thick. Half of it still clears the indicator.
    <nav className="fixed bottom-0 z-50 w-full border-t border-ink/10 bg-shell pb-[calc(env(safe-area-inset-bottom)*0.5)] md:hidden">
      <div className="flex h-[40px] items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-full w-full flex-col items-center justify-center gap-[3px] text-[9px] uppercase tracking-wide transition-[transform,color] duration-150 active:scale-90 ${
                active ? "text-ultramarine" : "text-secondary hover:text-ink"
              }`}
            >
              <item.icon
                className={`h-[22px] w-[22px] transition-transform duration-200 ${
                  active ? "scale-110 stroke-[2.4]" : "stroke-[1.8]"
                }`}
              />
              <span className={`leading-none ${active ? "font-bold" : "font-semibold"}`}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
