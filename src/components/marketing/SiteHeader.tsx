import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";
import { mt, localeHref, otherLocaleHref } from "@/lib/i18n/marketing-copy";
import type { Locale } from "@/lib/i18n/dictionary";

export function SiteHeader({ locale, path }: { locale: Locale; path: string }) {
  const nav = [
    { href: "/cote-r", label: mt(locale, "mkt.navCoteR") },
    { href: "/programmes", label: mt(locale, "mkt.navProgrammes") },
    { href: "/bourses", label: mt(locale, "mkt.navBourses") },
  ];

  return (
    <header className="w-full bg-chalk pt-safe">
      <div className="mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between gap-6 px-5 md:px-10">
        <Link
          href={localeHref(locale, "/")}
          className="flex items-center gap-2 text-ink transition-opacity hover:opacity-90"
        >
          <LogoMark size={22} />
          <span className="font-display text-[19px] font-extrabold tracking-tight text-ink">
            MaCote
          </span>
        </Link>

        <nav aria-label={locale === "fr" ? "Navigation principale" : "Main navigation"} className="hidden items-center gap-6 text-[14px] font-medium text-secondary md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={localeHref(locale, item.href)} className="transition-colors hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href={otherLocaleHref(locale, path)}
            hrefLang={locale === "fr" ? "en" : "fr"}
            className="hidden text-[13px] font-semibold text-secondary transition-colors hover:text-ink sm:inline"
          >
            {mt(locale, "mkt.langSwitch")}
          </Link>
          <Link
            href={localeHref(locale, "/")}
            className="flex h-10 items-center justify-center rounded-full bg-ultramarine px-4 text-[13.5px] font-semibold text-paper transition-colors hover:bg-pressed active:bg-pressed"
          >
            {mt(locale, "mkt.navInstall")}
          </Link>
        </div>
      </div>
    </header>
  );
}
