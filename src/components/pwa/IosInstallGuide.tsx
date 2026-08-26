"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Capacitor } from "@capacitor/core";
import { Share, PlusSquare, Check, X } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const DISMISSED_KEY = "macote.ios_install_guide_dismissed";

export function IosInstallGuide() {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only run in client browser
    if (typeof window === "undefined") return;

    // Already the native app shell — "add to home screen" makes no sense here.
    if (Capacitor.isNativePlatform()) return;

    // Check if running on iOS (iPhone / iPad / iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(userAgent);

    // Check if already in standalone mode (already installed as PWA)
    const isStandalone =
      ("standalone" in window.navigator && (window.navigator as unknown as { standalone: boolean }).standalone === true) ||
      window.matchMedia("(display-mode: standalone)").matches;

    // Check if student has already dismissed the guide
    const isDismissed = window.localStorage.getItem(DISMISSED_KEY) === "1";

    if (isIos && !isStandalone && !isDismissed) {
      // Pop up with a gentle delay so initial page paints first
      const timer = window.setTimeout(() => {
        setIsOpen(true);
      }, 1200);

      return () => window.clearTimeout(timer);
    }
  }, []);

  function handleDismiss() {
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      /* ignore */
    }
    setIsOpen(false);
  }

  function handleTemporaryClose() {
    setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm transition-opacity sm:items-center sm:p-4"
    >
      <div
        className="flex max-h-[90vh] w-full max-w-[440px] flex-col overflow-y-auto rounded-t-2xl border border-ink/12 bg-paper p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] shadow-overlay transition-transform duration-250 ease-arrival sm:p-6 sm:rounded-2xl"
      >
        {/* Header with App Icon and Close button */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-ink/10 bg-chalk shadow-card">
              <Image
                src="/icons/icon-192.png"
                alt="MaCote App"
                width={48}
                height={48}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div>
              <h2
                id="ios-install-title"
                className="font-display text-[18px] font-bold leading-tight text-ink"
              >
                {t("pwa.installTitle")}
              </h2>
              <p className="mt-0.5 text-[11.5px] font-medium text-ultramarine">
                Application Web (PWA)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleTemporaryClose}
            aria-label={t("common.back")}
            className="-mr-1 -mt-1 flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-ink/40 transition-colors hover:text-ink active:bg-ink/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-ink/65">
          {t("pwa.installSubtitle")}
        </p>

        {/* 3 Step Instruction Cards */}
        <div className="mt-5 flex flex-col gap-3">
          {/* Step 1 */}
          <div className="flex items-start gap-3.5 rounded-xl border border-ink/10 bg-chalk/40 p-3.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-ultramarine text-paper">
              <Share className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-[13.5px] font-semibold leading-snug text-ink">
                1. {t("pwa.step1")}
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-ink/55">
                {t("pwa.step1Detail")}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3.5 rounded-xl border border-ink/10 bg-chalk/40 p-3.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-ultramarine text-paper">
              <PlusSquare className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-[13.5px] font-semibold leading-snug text-ink">
                2. {t("pwa.step2")}
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-ink/55">
                {t("pwa.step2Detail")}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3.5 rounded-xl border border-ink/10 bg-chalk/40 p-3.5">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-moss text-paper">
              <Check className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div className="flex-1">
              <p className="text-[13.5px] font-semibold leading-snug text-ink">
                3. {t("pwa.step3")}
              </p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-ink/55">
                {t("pwa.step3Detail")}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex h-12 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98]"
          >
            {t("pwa.dismiss")}
          </button>
          <button
            type="button"
            onClick={handleTemporaryClose}
            className="flex min-h-[48px] w-full items-center justify-center text-[13px] font-medium text-ink/50 transition-colors hover:text-ink active:scale-[0.99]"
          >
            {t("pwa.later")}
          </button>
        </div>
      </div>
    </div>
  );
}
