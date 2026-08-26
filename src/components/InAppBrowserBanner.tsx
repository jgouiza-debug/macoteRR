"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Copy, Check, X } from "lucide-react";
import { detectInAppBrowser, escapeToRealBrowser, type InAppBrowser } from "@/lib/in-app-browser";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * Shown when the app is running inside a social app's WebView.
 *
 * It is not decoration: a magic-link sign-in completed in Instagram's browser writes its
 * session cookie into a jar that is thrown away when the student leaves the post, so they
 * appear to sign in and are signed out again moments later. Getting them into a real browser
 * before they reach sign-up is the difference between the account working and not.
 *
 * Android gets a button that genuinely works. iOS gets the link and the two taps that do it,
 * because no API can force a Meta WebView to hand off to Safari — see lib/in-app-browser.ts.
 */
export function InAppBrowserBanner() {
  const { t } = useLocale();
  const [info, setInfo] = useState<InAppBrowser | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const detected = detectInAppBrowser();
    // A one-time read of the user agent, not a value that changes during the session — there
    // is no external store to subscribe to, so this cannot be a useSyncExternalStore. Same
    // shape, and the same exemption, as the detection in src/lib/platform-detect.ts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (detected.isInApp) setInfo(detected);
  }, []);

  if (!info || dismissed) return null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is permission-gated and unavailable in some WebViews. The URL is still on
      // screen in the address bar, so failing quietly beats an error the student cannot act on.
    }
  }

  return (
    <div
      role="region"
      aria-label={t("inapp.title")}
      className="sticky top-0 z-[60] border-b border-ink/10 bg-ember/[0.07] px-4 py-3 backdrop-blur-sm pt-safe"
    >
      <div className="mx-auto flex w-full max-w-[430px] items-start gap-3">
        <ExternalLink className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-ember" />

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-snug text-ink">{t("inapp.title")}</p>
          <p className="mt-0.5 text-[12px] leading-relaxed text-ink/65">{t("inapp.why")}</p>

          {info.canEscapeProgrammatically ? (
            <button
              type="button"
              onClick={() => escapeToRealBrowser()}
              className="mt-2.5 flex min-h-[48px] items-center justify-center rounded-full bg-ink px-4 text-[13px] font-semibold text-paper transition-transform active:scale-[0.98]"
            >
              {t("inapp.openAndroid")}
            </button>
          ) : (
            <>
              {/* iOS: no button can do this, so name the taps precisely instead. */}
              <p className="mt-2 text-[12px] leading-relaxed text-ink/75">{t("inapp.stepsIos")}</p>
              <button
                type="button"
                onClick={copyLink}
                className="mt-2.5 flex min-h-[48px] items-center gap-1.5 rounded-full border border-ink/25 px-4 text-[13px] font-semibold text-ink transition-transform active:scale-[0.98]"
              >
                {copied ? <Check className="h-4 w-4 text-moss" /> : <Copy className="h-4 w-4" />}
                {copied ? t("inapp.copied") : t("inapp.copyLink")}
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label={t("common.close")}
          className="-mr-1 -mt-1 flex min-h-[48px] min-w-[48px] flex-shrink-0 items-center justify-center rounded-full text-ink/40 transition-colors active:bg-ink/10"
        >
          <X className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );
}
