import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";
import { mt, localeHref } from "@/lib/i18n/marketing-copy";
import type { Locale } from "@/lib/i18n/dictionary";

export function SiteFooter({ locale }: { locale: Locale }) {
  const columns = [
    {
      title: mt(locale, "mkt.navCoteR"),
      links: [
        { href: "/cote-r", label: mt(locale, "mkt.navCoteR") },
        { href: "/programmes", label: mt(locale, "mkt.navProgrammes") },
        { href: "/bourses", label: mt(locale, "mkt.navBourses") },
      ],
    },
    {
      title: locale === "fr" ? "MaCote" : "MaCote",
      links: [
        { href: "/pour-les-cegeps", label: mt(locale, "mkt.navCegeps") },
        { href: "/a-propos", label: mt(locale, "mkt.navAbout") },
        { href: "/contact", label: mt(locale, "mkt.navContact") },
      ],
    },
    {
      title: locale === "fr" ? "Légal" : "Legal",
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
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-2.5 sm:col-span-1">
            <Link href={localeHref(locale, "/")} className="flex items-center gap-2 text-ink">
              <LogoMark size={20} />
              <span className="font-display text-[16px] font-extrabold tracking-tight">MaCote</span>
            </Link>
            <p className="max-w-[220px] text-[13px] leading-relaxed text-secondary">
              {mt(locale, "mkt.footerTagline")}
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="flex flex-col gap-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
                {col.title}
              </p>
              {col.links.map((link) => (
                <Link
                  key={link.href}
                  href={localeHref(locale, link.href)}
                  className="text-[13.5px] text-ink transition-colors hover:text-ultramarine"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-1 border-t border-hairline pt-4 text-[12px] text-secondary sm:flex-row sm:items-center sm:justify-between">
          <p>{mt(locale, "mkt.footerRights")}</p>
          <p>© {new Date().getFullYear()} MaCote</p>
        </div>
      </div>
    </footer>
  );
}
