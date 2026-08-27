"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/ui/Logo";
import { LangToggle } from "@/components/ui/LangToggle";
import { NAV_ITEMS } from "./nav-items";
import { useFormat } from "@/lib/i18n/useFormat";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function TopNav({ rScore }: { rScore?: number }) {
  const pathname = usePathname();
  const { t } = useLocale();
  const f = useFormat();

  return (
    <header className="fixed top-0 z-50 w-full border-b border-ink/10 bg-shell pt-safe">
      <div className="mx-auto flex h-12 w-full max-w-[1200px] items-center justify-between gap-3 px-4 md:px-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <LogoMark size={20} />
          <span className="font-display text-[16px] font-bold tracking-tight text-ultramarine">
            MaCote
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold uppercase tracking-wide transition-colors ${
                  active ? "text-ultramarine" : "text-secondary hover:bg-chalk"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {rScore !== undefined && (
            <span className="text-[13.5px] font-extrabold tracking-tight tabular-nums text-ultramarine">
              R : {f.score(rScore)}
            </span>
          )}
          <LangToggle />
        </div>
      </div>
    </header>
  );
}
