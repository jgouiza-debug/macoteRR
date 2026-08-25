"use client";

import { useRouter } from "next/navigation";
import { InstallCard } from "@/components/InstallCard";
import { SiteHeader } from "./SiteHeader";
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
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ultramarine focus:px-4 focus:py-2 focus:text-paper"
      >
        {mt(locale, "mkt.skipToContent")}
      </a>
      <SiteHeader locale={locale} path="/" />

      <main
        id="main"
        className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col items-start justify-between gap-8 px-5 py-6 md:flex-row md:gap-12 md:px-10 md:py-10"
      >
        <div className="flex max-w-[560px] flex-1 flex-col">
          <h1 className="font-display text-[34px] font-extrabold leading-[1.1] tracking-[-0.04em] text-ink sm:text-[42px] md:text-[48px]">
            {mt(locale, "install.heading")}
          </h1>

          <p className="mt-4 text-[17px] font-normal leading-relaxed text-secondary sm:text-[18px]">
            {mt(locale, "install.sub")}
          </p>

          <ul className="mt-6 flex flex-col gap-3">
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

        <div className="flex w-full shrink-0 justify-center lg:w-auto lg:justify-end">
          <InstallCard
            state={detectionState}
            locale={locale}
            onInstallClick={install}
            onContinueInBrowser={() => {
              // /app is the interactive app itself, not a marketing page — it isn't
              // URL-locale-prefixed, it uses its own client-side language toggle.
              router.push("/app");
            }}
          />
        </div>
      </main>

      <SiteFooter locale={locale} />
    </div>
  );
}
