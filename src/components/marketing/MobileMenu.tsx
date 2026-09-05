"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { mt, localeHref, otherLocaleHref } from "@/lib/i18n/marketing-copy";
import type { Locale, TranslationKey } from "@/lib/i18n/dictionary";

type MenuLink = { href: string; labelKey: TranslationKey };

/**
 * Phone navigation for the marketing site. Below `md` the header nav is hidden, and until this
 * existed a phone had no way to reach the other pages (or the other language) except the
 * footer, after the whole article. Two short labelled groups instead of one nine-item list.
 */
export function MobileMenu({
  locale,
  path,
  groups,
}: {
  locale: Locale;
  path: string;
  groups: { titleKey: TranslationKey; links: MenuLink[] }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="-mr-2 flex min-h-[48px] min-w-[48px] items-center justify-center gap-1.5 rounded-full px-2 text-[13px] font-semibold text-ink transition-colors active:bg-ink/10 md:hidden"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
        {mt(locale, "mkt.menu")}
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={mt(locale, "mkt.menu")}
        closeLabel={mt(locale, "mkt.installBarDismiss")}
      >
        <nav aria-label={mt(locale, "mkt.menu")} className="flex flex-col gap-4 pb-2">
          {groups.map((group) => (
            <div key={group.titleKey}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
                {mt(locale, group.titleKey)}
              </p>
              <ul className="mt-1 flex list-none flex-col p-0">
                {group.links.map((link) => {
                  const active = link.href === path;
                  return (
                    <li key={link.href}>
                      <Link
                        href={localeHref(locale, link.href)}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className={`flex min-h-[48px] items-center text-[16px] font-medium ${
                          active ? "text-ultramarine" : "text-ink"
                        }`}
                      >
                        {mt(locale, link.labelKey)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <Link
            href={otherLocaleHref(locale, path)}
            hrefLang={locale === "fr" ? "en" : "fr"}
            onClick={() => setOpen(false)}
            className="flex min-h-[48px] items-center border-t border-hairline pt-2 text-[15px] font-semibold text-ultramarine underline underline-offset-2"
          >
            {mt(locale, "mkt.langSwitch")}
          </Link>
        </nav>
      </Sheet>
    </>
  );
}
