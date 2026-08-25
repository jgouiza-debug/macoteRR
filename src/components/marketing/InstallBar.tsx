"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePlatformDetection } from "@/lib/platform-detect";
import { mt, localeHref } from "@/lib/i18n/marketing-copy";
import type { Locale } from "@/lib/i18n/dictionary";

const DISMISS_KEY = "macote.install_bar_dismissed";

/**
 * Persistent, quiet install prompt for long content pages (cote-r, programmes, bourses,
 * pour-les-cegeps, a-propos) — most visitors land here from search, not the home page, so
 * every long page carries the install path itself. Appears after 40% scroll, dismissible
 * for the session. Home's InstallCard already covers full platform-detection UI; this bar
 * just links back to it rather than duplicating every state's markup.
 */
export function InstallBar({ locale }: { locale: Locale }) {
  const { detectionState } = usePlatformDetection();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      // One-time sessionStorage read on mount, not a subscription to an external store.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (window.sessionStorage.getItem(DISMISS_KEY) === "1") setDismissed(true);
    } catch {
      /* storage blocked — bar just won't remember a dismissal */
    }

    const onScroll = () => {
      const scrolled = window.scrollY;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0 && scrolled / scrollable >= 0.4) setVisible(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (dismissed || detectionState === "installed") return null;

  function dismiss() {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      role="complementary"
      aria-label={mt(locale, "mkt.installBarHeading")}
      className={`fixed inset-x-0 bottom-0 z-40 pb-safe transition-transform duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[720px] items-center justify-between gap-4 border-t border-hairline bg-paper px-5 py-3.5 shadow-card">
        <p className="text-[13.5px] font-semibold text-ink">{mt(locale, "mkt.installBarHeading")}</p>
        <div className="flex items-center gap-3">
          <Link
            href={localeHref(locale, "/")}
            className="flex h-10 items-center justify-center rounded-full bg-ultramarine px-4 text-[13px] font-semibold text-paper transition-colors hover:bg-pressed active:bg-pressed"
          >
            {mt(locale, "mkt.installBarCta")}
          </Link>
          <button
            type="button"
            onClick={dismiss}
            aria-label={mt(locale, "mkt.installBarDismiss")}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-secondary transition-colors hover:text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
