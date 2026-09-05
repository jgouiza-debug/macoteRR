import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";
import { MobileMenu } from "./MobileMenu";
import { mt, localeHref, otherLocaleHref } from "@/lib/i18n/marketing-copy";
import type { Locale, TranslationKey } from "@/lib/i18n/dictionary";

const PRIMARY_NAV: { href: string; labelKey: TranslationKey }[] = [
  { href: "/cote-r", labelKey: "mkt.navCoteR" },
  { href: "/programmes", labelKey: "mkt.navProgrammes" },
  { href: "/bourses", labelKey: "mkt.navBourses" },
];

const SECONDARY_NAV: { href: string; labelKey: TranslationKey }[] = [
  { href: "/pour-les-cegeps", labelKey: "mkt.navCegeps" },
  { href: "/a-propos", labelKey: "mkt.navAbout" },
  { href: "/contact", labelKey: "mkt.navContact" },
];

/** The app is not URL-locale-prefixed; ?lang carries the English site's locale across. */
export function appHref(locale: Locale): string {
  return locale === "en" ? "/app?lang=en" : "/app";
}

export function SiteHeader({ locale, path }: { locale: Locale; path: string }) {
  // The home page's hero is the install card, whose button already says "open the app". A
  // second ultramarine pill 40px above it was the same promise twice; the home header keeps
  // only the logo, the nav and the menu.
  const isHome = path === "/";

  return (
    <header className="w-full bg-chalk pt-safe">
      <div className="mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between gap-4 px-3 md:px-10">
        <Link
          href={localeHref(locale, "/")}
          aria-current={isHome ? "page" : undefined}
          className="-ml-1 flex min-h-[48px] items-center gap-2 px-1 text-ink transition-opacity hover:opacity-90"
        >
          <LogoMark size={22} />
          <span className="font-display text-[19px] font-extrabold tracking-tight text-ink">
            MaCote
          </span>
        </Link>

        <nav
          aria-label={locale === "fr" ? "Navigation principale" : "Main navigation"}
          className="hidden items-center gap-2 text-[14px] font-medium text-secondary md:flex"
        >
          {PRIMARY_NAV.map((item) => {
            const active = item.href === path;
            return (
              <Link
                key={item.href}
                href={localeHref(locale, item.href)}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[48px] items-center px-2 transition-colors hover:text-ink ${
                  active ? "text-ink underline underline-offset-4" : ""
                }`}
              >
                {mt(locale, item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 md:gap-3">
          <Link
            href={otherLocaleHref(locale, path)}
            hrefLang={locale === "fr" ? "en" : "fr"}
            className="hidden min-h-[48px] items-center px-2 text-[13px] font-semibold text-secondary transition-colors hover:text-ink md:flex"
          >
            {mt(locale, "mkt.langSwitch")}
          </Link>
          {!isHome && (
            <Link
              href={appHref(locale)}
              className="flex min-h-[44px] items-center justify-center rounded-full bg-ultramarine px-4 text-[13.5px] font-semibold text-paper transition-colors hover:bg-pressed active:bg-pressed md:min-h-[48px] md:px-5"
            >
              {mt(locale, "mkt.navInstall")}
            </Link>
          )}
          <MobileMenu
            locale={locale}
            path={path}
            groups={[
              { titleKey: "mkt.menuLearn", links: PRIMARY_NAV },
              { titleKey: "mkt.menuSite", links: SECONDARY_NAV },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
