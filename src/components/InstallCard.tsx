"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { mt } from "@/lib/i18n/marketing-copy";
import type { Locale, TranslationKey } from "@/lib/i18n/dictionary";
import { CopyLinkControl } from "./CopyLinkControl";
import { SITE_DOMAIN } from "@/lib/site-config";

export type DetectionState =
  | "inapp" // State 1 & 3: In-app browser or iOS non-Safari
  | "ios_safari" // State 2: iOS Safari
  | "can_install" // State 4: Android / Desktop Chromium with prompt
  | "installed" // State 5: Standalone already installed
  | "desktop_fallback"; // Desktop standard fallback with QR code

interface InstallCardProps {
  state: DetectionState;
  /** Marketing pages pass their URL-driven locale here instead of relying on the app's
   *  client-side toggle, so /en never shows French install copy. */
  locale?: Locale;
  onInstallClick?: () => void;
  onContinueInBrowser?: () => void;
}

export function InstallCard({ state, locale, onInstallClick, onContinueInBrowser }: InstallCardProps) {
  const { t: contextT } = useLocale();
  const t = (key: TranslationKey) => (locale ? mt(locale, key) : contextT(key));

  return (
    <div className="w-full max-w-[440px] rounded-[3px] border border-border bg-paper p-6 md:p-8 shadow-card flex flex-col gap-6">
      {/* STATE 1 & 3: In-App Browser / iOS Non-Safari */}
      {(state === "inapp") && (
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-[24px] font-bold leading-tight text-ink">
            {t("install.inAppHeading")}
          </h2>
          <p className="text-[15px] leading-relaxed text-secondary">
            {t("install.inAppBody")}
          </p>
          <div className="mt-2">
            <CopyLinkControl locale={locale} onContinueWithoutInstall={onContinueInBrowser} showNoteCaption={true} />
          </div>
        </div>
      )}

      {/* STATE 2: iOS Safari Manual 3 Steps */}
      {state === "ios_safari" && (
        <div className="flex flex-col gap-5">
          <h2 className="font-display text-[24px] font-bold leading-tight text-ink">
            {t("install.iosHeading")}
          </h2>

          {/* Real ordered list in markup as required */}
          <ol className="flex flex-col gap-4 list-none p-0 m-0">
            <li className="flex items-start gap-3.5 text-[15px] leading-snug text-ink">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-chalk text-[13px] font-bold text-ink border border-border">
                1
              </span>
              <div className="flex items-center gap-2 pt-0.5">
                <span>{t("install.iosStep1")}</span>
                {/* Drawn Share SVG Icon on 24px grid */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2B4CF5"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 inline-block"
                  aria-hidden="true"
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </div>
            </li>

            <li className="flex items-start gap-3.5 text-[15px] leading-snug text-ink">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-chalk text-[13px] font-bold text-ink border border-border">
                2
              </span>
              <span className="pt-0.5">{t("install.iosStep2")}</span>
            </li>

            <li className="flex items-start gap-3.5 text-[15px] leading-snug text-ink">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-chalk text-[13px] font-bold text-ink border border-border">
                3
              </span>
              <span className="pt-0.5">{t("install.iosStep3")}</span>
            </li>
          </ol>

          {/* iOS Caveat Notice */}
          <div className="rounded-[3px] bg-chalk p-3.5 text-[13px] leading-relaxed text-secondary border border-border">
            {t("install.iosCaveat")}
          </div>

          {/* Secondary Browser Access */}
          <a
            href="/app"
            onClick={(e) => {
              if (onContinueInBrowser) {
                e.preventDefault();
                onContinueInBrowser();
              }
            }}
            className="w-full text-center text-ultramarine font-semibold text-[15px] hover:underline pt-1 focus-visible:outline-none"
          >
            {t("install.secondary")}
          </a>
        </div>
      )}

      {/* STATE 4: Android & Desktop Chromium Programmatic Install Button */}
      {state === "can_install" && (
        <div className="flex flex-col gap-5">
          <h2 className="font-display text-[24px] font-bold leading-tight text-ink">
            {t("install.heading")}
          </h2>
          <p className="text-[15px] leading-relaxed text-secondary">
            {t("install.sub")}
          </p>

          <button
            type="button"
            onClick={onInstallClick}
            className="w-full h-14 rounded-full bg-ultramarine hover:bg-pressed active:bg-pressed text-paper text-[16px] font-semibold transition-colors shadow-card flex items-center justify-center focus-visible:outline-none"
          >
            {t("install.btnAndroid")}
          </button>

          <a
            href="/app"
            onClick={(e) => {
              if (onContinueInBrowser) {
                e.preventDefault();
                onContinueInBrowser();
              }
            }}
            className="w-full text-center text-ultramarine font-semibold text-[15px] hover:underline focus-visible:outline-none"
          >
            {t("install.secondary")}
          </a>
        </div>
      )}

      {/* STATE 5: Already Installed */}
      {state === "installed" && (
        <div className="flex flex-col gap-5 text-center py-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-chalk border border-border text-moss">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#12795A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="font-display text-[24px] font-bold leading-tight text-ink">
            {t("install.installedHeading")}
          </h2>
          <a
            href="/app"
            onClick={(e) => {
              if (onContinueInBrowser) {
                e.preventDefault();
                onContinueInBrowser();
              }
            }}
            className="w-full h-14 rounded-full bg-ultramarine hover:bg-pressed active:bg-pressed text-paper text-[16px] font-semibold transition-colors shadow-card flex items-center justify-center focus-visible:outline-none"
          >
            {t("install.installedButton")}
          </a>
        </div>
      )}

      {/* DESKTOP FALLBACK: Build-time Generated QR Code */}
      {state === "desktop_fallback" && (
        <div className="flex flex-col gap-5">
          <h2 className="font-display text-[22px] font-bold leading-tight text-ink">
            {t("install.desktopTitle")}
          </h2>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 bg-chalk rounded-[3px] border border-border">
            <div className="w-48 h-48 bg-paper p-2 rounded-[3px] border border-hairline flex items-center justify-center">
              {/* Build-time generated SVG QR Code */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/qr-code.svg" alt={`QR code vers ${SITE_DOMAIN}`} className="w-full h-full object-contain" />
            </div>
            <p className="mt-3 text-[13px] text-center text-secondary font-medium">
              {t("install.desktopQRCaption")}
            </p>
          </div>

          <div className="border-t border-hairline pt-4 flex flex-col gap-4">
            <a
              href="/app"
              onClick={(e) => {
                if (onContinueInBrowser) {
                  e.preventDefault();
                  onContinueInBrowser();
                }
              }}
              className="w-full h-14 rounded-full border border-ink bg-transparent hover:bg-chalk text-ink text-[16px] font-semibold transition-colors flex items-center justify-center focus-visible:outline-none"
            >
              {t("install.desktopOpen")}
            </a>

            <p className="text-[12px] leading-relaxed text-secondary">
              {t("install.desktopNote")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
