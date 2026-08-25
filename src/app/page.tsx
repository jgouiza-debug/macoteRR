"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { InstallCard, type DetectionState } from "@/components/InstallCard";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function Home() {
  const { t } = useLocale();
  const [detectionState, setDetectionState] = useState<DetectionState>("desktop_fallback");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Capture beforeinstallprompt event if fired (Chromium / Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      // If we captured prompt and we are not in an in-app browser or already installed, set state 4
      const ua = navigator.userAgent;
      const inAppUA = /FBAN|FBAV|Instagram|Line\/|Snapchat|LinkedInApp|musical_ly|BytedanceWebview|Twitter/i.test(ua);
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;

      if (!isStandalone && !inAppUA) {
        setDetectionState("can_install");
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Platform detection logic in priority order
    const detectEnvironment = () => {
      const ua = navigator.userAgent || "";
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true;
      const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
      const iosSafari = isIOS && !/CriOS|FxiOS|EdgiOS|OPiOS|mercury/i.test(ua);
      const inAppUA = /FBAN|FBAV|Instagram|Line\/|Snapchat|LinkedInApp|musical_ly|BytedanceWebview|Twitter/i.test(ua);

      // 1. Check if already installed
      if (isStandalone) {
        setDetectionState("installed");
        return;
      }

      // 2. Check if in-app browser OR iOS non-Safari
      if (inAppUA || (isIOS && !iosSafari)) {
        setDetectionState("inapp");
        return;
      }

      // 3. Check if iOS Safari
      if (isIOS && iosSafari) {
        setDetectionState("ios_safari");
        return;
      }

      // 4. Check if install prompt is already captured
      if (deferredPrompt) {
        setDetectionState("can_install");
        return;
      }

      // 5. Default fallback (Desktop or waiting for prompt)
      setDetectionState("desktop_fallback");
    };

    detectEnvironment();

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setDetectionState("installed");
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error("Install prompt failed:", err);
    }
  };

  const handleContinueInBrowser = () => {
    window.location.href = "/app";
  };

  return (
    <div className="min-h-screen flex flex-col bg-chalk text-ink">
      {/* Top Header */}
      <Header />

      {/* Main Single Page Content */}
      <main className="flex-1 w-full max-w-[1120px] mx-auto px-5 md:px-14 py-8 md:py-16 flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-16">
        {/* Left Column: Typography & Facts */}
        <div className="flex-1 flex flex-col max-w-[560px]">
          <h1 className="font-display text-[36px] sm:text-[44px] md:text-[52px] font-extrabold leading-[1.08] tracking-[-0.04em] text-ink">
            {t("install.heading")}
          </h1>

          <p className="mt-5 text-[17px] sm:text-[18px] leading-relaxed text-secondary font-normal">
            {t("install.sub")}
          </p>

          {/* Fact list with green #12795A moss check icons */}
          <div className="mt-8 sm:mt-10 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="#12795A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 mt-1"
                aria-hidden="true"
              >
                <polyline points="4 10 8 14 16 5" />
              </svg>
              <span className="text-[15px] sm:text-[16px] font-medium text-ink leading-snug">
                {t("install.fact1")}
              </span>
            </div>

            <div className="flex items-start gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="#12795A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 mt-1"
                aria-hidden="true"
              >
                <polyline points="4 10 8 14 16 5" />
              </svg>
              <span className="text-[15px] sm:text-[16px] font-medium text-ink leading-snug">
                {t("install.fact2")}
              </span>
            </div>

            <div className="flex items-start gap-3">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="#12795A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 mt-1"
                aria-hidden="true"
              >
                <polyline points="4 10 8 14 16 5" />
              </svg>
              <span className="text-[15px] sm:text-[16px] font-medium text-ink leading-snug">
                {t("install.fact3")}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Platform Detection Card */}
        <div className="w-full lg:w-auto shrink-0 flex justify-center lg:justify-end">
          <InstallCard
            state={detectionState}
            onInstallClick={handleInstallClick}
            onContinueInBrowser={handleContinueInBrowser}
          />
        </div>
      </main>
    </div>
  );
}
