"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="fixed bottom-0 z-50 w-full border-t border-ink/10 bg-shell pb-safe md:hidden">
      {/* Icons only. Stacking a caption under the icon is what forced the bar wide — at a
          height that reads as thin, the text lands around 8px, which is decoration rather
          than something anyone reads. The label survives as an accessible name, so screen
          readers and the aria-current state are unchanged. */}
      <div className="flex h-[34px] items-center justify-around px-2">
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
