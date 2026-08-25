"use client";

import { useEffect, useState } from "react";

export type DetectionState =
  | "inapp" // In-app browser or iOS non-Safari
  | "ios_safari"
  | "can_install" // Android / desktop Chromium with a captured beforeinstallprompt
  | "installed" // Already running standalone
  | "desktop_fallback";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const IN_APP_UA = /FBAN|FBAV|Instagram|Line\/|Snapchat|LinkedInApp|musical_ly|BytedanceWebview|Twitter/i;

/**
 * Shared across every page that offers install — the home hero (InstallCard) and the
 * scroll-triggered InstallBar on long content pages. One detection pass, one source of truth.
 */
export function usePlatformDetection() {
  const [detectionState, setDetectionState] = useState<DetectionState>("desktop_fallback");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      const ua = navigator.userAgent;
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true;
      if (!isStandalone && !IN_APP_UA.test(ua)) {
        setDetectionState("can_install");
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const ua = navigator.userAgent || "";
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
    const iosSafari = isIOS && !/CriOS|FxiOS|EdgiOS|OPiOS|mercury/i.test(ua);
    const inAppUA = IN_APP_UA.test(ua);

    const resolved: DetectionState | null = isStandalone
      ? "installed"
      : inAppUA || (isIOS && !iosSafari)
        ? "inapp"
        : isIOS && iosSafari
          ? "ios_safari"
          : null; // stays desktop_fallback until/unless beforeinstallprompt fires above

    // One-time browser-environment read (UA/matchMedia), not a value that changes during
    // the session — there's no external store to subscribe to here, so this can't be
    // expressed as useSyncExternalStore the way LocaleProvider/DistributionCurve do it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (resolved) setDetectionState(resolved);

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") setDetectionState("installed");
      setDeferredPrompt(null);
    } catch (err) {
      console.error("Install prompt failed:", err);
    }
  };

  return { detectionState, install };
}
