"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="fixed bottom-0 z-50 w-full border-t border-ink/10 bg-paper pb-safe md:hidden">
      <div className="flex h-12 items-stretch justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex w-full flex-col items-center justify-center gap-0.5 text-[10px] font-semibold uppercase tracking-wide transition-transform active:scale-95 ${
                active ? "text-ultramarine" : "text-ink/45"
              }`}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
