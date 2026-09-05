import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";
import { mt, localeHref, otherLocaleHref } from "@/lib/i18n/marketing-copy";
import type { Locale } from "@/lib/i18n/dictionary";

export function SiteFooter({ locale, path = "/" }: { locale: Locale; path?: string }) {
  const columns = [
    {
      title: mt(locale, "mkt.menuLearn"),
      links: [
        { href: "/cote-r", label: mt(locale, "mkt.navCoteR") },
        { href: "/programmes", label: mt(locale, "mkt.navProgrammes") },
        { href: "/bourses", label: mt(locale, "mkt.navBourses") },
      ],
    },
    {
      title: mt(locale, "mkt.menuSite"),
      links: [
        { href: "/pour-les-cegeps", label: mt(locale, "mkt.navCegeps") },
        { href: "/a-propos", label: mt(locale, "mkt.navAbout") },
        { href: "/contact", label: mt(locale, "mkt.navContact") },
      ],
    },
    {
      title: mt(locale, "mkt.menuLegal"),
      links: [
        { href: "/confidentialite", label: mt(locale, "mkt.footerPrivacy") },
        { href: "/conditions", label: mt(locale, "mkt.footerTerms") },
        { href: "/accessibilite", label: mt(locale, "mkt.footerAccessibility") },
      ],
    },
  ];

  return (
    <footer className="w-full border-t border-hairline bg-chalk pb-safe">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-3 py-8 md:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-2 sm:col-span-1">
            <Link
              href={localeHref(locale, "/")}
              className="-ml-1 flex min-h-[48px] items-center gap-2 self-start px-1 text-ink"
            >
              <LogoMark size={20} />
              <span className="font-display text-[16px] font-extrabold tracking-tight">MaCote</span>
            </Link>
            <p className="max-w-[220px] text-[13px] leading-relaxed text-secondary">
              {mt(locale, "mkt.footerTagline")}
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex flex-col">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-secondary">
                {col.title}
              </p>
              {/* 44px rows with no gap: nine adjacent links used to be 20px tall, 10px apart. */}
              {col.links.map((link) => (
                <Link
                  key={link.href}
                  href={localeHref(locale, link.href)}
                  className="flex min-h-[44px] items-center text-[14px] text-ink underline-offset-2 transition-colors hover:text-ultramarine hover:underline"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-hairline pt-4 text-[12px] text-secondary sm:flex-row sm:items-center sm:justify-between">
          <p>{mt(locale, "mkt.footerRights")}</p>
          <div className="flex items-center gap-4">
            <Link
              href={otherLocaleHref(locale, path)}
              hrefLang={locale === "fr" ? "en" : "fr"}
              className="flex min-h-[44px] items-center text-[13px] font-semibold text-ink underline underline-offset-2"
            >
              {mt(locale, "mkt.langSwitch")}
            </Link>
            <p>© {new Date().getFullYear()} MaCote</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
