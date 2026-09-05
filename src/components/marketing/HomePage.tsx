"use client";

import { useRouter } from "next/navigation";
import { InstallCard } from "@/components/InstallCard";
import { SiteHeader } from "./SiteHeader";
import { SkipLink } from "./SkipLink";
import { SiteFooter } from "./SiteFooter";
import { SetHtmlLang } from "./SetHtmlLang";
import { usePlatformDetection } from "@/lib/platform-detect";
import { mt } from "@/lib/i18n/marketing-copy";
import type { Locale } from "@/lib/i18n/dictionary";

export function HomePage({ locale }: { locale: Locale }) {
  const { detectionState, install } = usePlatformDetection();
  const router = useRouter();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-chalk text-ink">
      {locale === "en" && <SetHtmlLang lang="en" />}
      <SkipLink locale={locale} />
      <SiteHeader locale={locale} path="/" />

      {/* One column on phones in reading order: headline, the install card (the page's one
          action, within the first screen), then the three facts. Two columns from md up, with
          the card spanning both rows on the right. */}
      <main
        id="main"
        className="mx-auto grid w-full max-w-[1120px] flex-1 grid-cols-1 items-start gap-8 px-3 py-6 md:grid-cols-[minmax(0,1fr)_auto] md:grid-rows-[auto_1fr] md:gap-x-12 md:gap-y-6 md:px-10 md:py-10"
      >
        <div className="flex max-w-[560px] flex-col">
          <h1 className="font-display text-[34px] font-extrabold leading-[1.1] tracking-[-0.04em] text-ink sm:text-[42px] md:text-[48px]">
            {mt(locale, "install.heading")}
          </h1>

          <p className="mt-4 text-[17px] font-normal leading-relaxed text-secondary sm:text-[18px]">
            {mt(locale, "install.sub")}
          </p>
        </div>

        <div className="flex w-full justify-center md:row-span-2 md:w-auto md:justify-end">
          <InstallCard
            state={detectionState}
            locale={locale}
            onInstallClick={install}
            onContinueInBrowser={() => {
              // /app is the interactive app itself, not a marketing page — it isn't
              // URL-locale-prefixed, it uses its own client-side language toggle. The
              // English site hands its locale across that boundary with ?lang (the proxy
              // carries it through the sign-in bounce, the LocaleProvider consumes it), so
              // an English visitor is not dropped into a French funnel.
              router.push(locale === "en" ? "/app?lang=en" : "/app");
            }}
          />
        </div>

        <div className="flex max-w-[560px] flex-col">
          <ul className="flex flex-col gap-3">
            {(["install.fact1", "install.fact2", "install.fact3"] as const).map((key) => (
              <li key={key} className="flex items-start gap-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="#12795A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-1 shrink-0"
                  aria-hidden="true"
                >
                  <polyline points="4 10 8 14 16 5" />
                </svg>
                <span className="text-[15px] font-medium leading-snug text-ink sm:text-[16px]">
                  {mt(locale, key)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <SiteFooter locale={locale} path="/" />
      {/* The iOS "add to home screen" sheet is not mounted here on purpose. On iOS Safari the
          install card already shows the same three steps; in an iOS in-app browser the sheet's
          instructions do not apply. Either way it was a second modal over the card, 1.2s in. */}
    </div>
  );
}
