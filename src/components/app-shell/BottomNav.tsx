"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="fixed bottom-0 z-50 w-full border-t border-ink/10 bg-shell md:hidden">
      {/* Icons only, centred in the whole bar. The label survives as an accessible name, so
          screen readers and the aria-current state are unchanged.

          The height folds half the home-indicator inset into the row rather than hanging it
          underneath as padding. Padding put the entire inset below the icons — 3px of shell
          above them and better than 30px below — which is what made the bar read as thick and
          bottom-heavy. Half the inset still clears the indicator. */}
      <div className="flex h-[calc(1.875rem+env(safe-area-inset-bottom)*0.5)] items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-full w-full items-center justify-center transition-[transform,color] duration-150 active:scale-90 ${
                active ? "text-ultramarine" : "text-secondary hover:text-ink"
              }`}
            >
              <item.icon
                className={`h-6 w-6 transition-transform duration-200 ${
                  active ? "scale-110 stroke-[2.4]" : "stroke-[1.8]"
                }`}
              />
              <span className="sr-only">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
