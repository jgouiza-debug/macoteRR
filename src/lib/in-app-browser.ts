"use client";

/**
 * Detecting an in-app browser, and getting out of one.
 *
 * Instagram, Facebook, TikTok and friends open links in an embedded WebView rather than the
 * real browser. That breaks this app in two specific ways:
 *
 *   - the magic-link session cookie is set in the WebView's cookie jar, which is discarded
 *     when the student leaves the post, so they sign in and are immediately signed out again;
 *   - "Add to Home Screen" does not exist there, so the PWA can never be installed.
 *
 * WHAT CAN AND CANNOT BE DONE — read before "improving" this:
 *
 *   Android: `intent://` URLs hand off to a real browser and work from most WebViews,
 *   Instagram's included. This is a genuine, one-tap escape.
 *
 *   iOS: there is no API that forces a WebView to hand a URL to Safari. `x-safari-https://`
 *   works in a few Google apps and is explicitly blocked by Meta's WebViews, which is where
 *   this actually matters. Anything that claims otherwise is doing a redirect that silently
 *   fails and leaves the student staring at an unchanged screen. So on iOS the honest move is
 *   to hand them the link and the two taps that do it — not to pretend a button can.
 */

const IN_APP_UA =
  /FBAN|FBAV|FB_IAB|Instagram|Line\/|Snapchat|LinkedInApp|musical_ly|BytedanceWebview|Twitter|Pinterest|WhatsApp|Threads/i;

export type InAppBrowser = {
  /** True when the page is inside a social app's embedded WebView. */
  isInApp: boolean;
  platform: "ios" | "android" | "other";
  /** Only Android can actually be escaped programmatically. */
  canEscapeProgrammatically: boolean;
};

export function detectInAppBrowser(): InAppBrowser {
  if (typeof navigator === "undefined") {
    return { isInApp: false, platform: "other", canEscapeProgrammatically: false };
  }

  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
  const isAndroid = /Android/i.test(ua);
  const platform: InAppBrowser["platform"] = isIOS ? "ios" : isAndroid ? "android" : "other";

  // Meta's iOS WebView does not always announce itself in the UA, but it never exposes a real
  // Safari build either. Treat an iOS WebView that is not Safari and not a known third-party
  // browser as in-app: the cost of a false positive is one dismissible banner, the cost of a
  // false negative is a student who cannot stay signed in.
  const isThirdPartyIosBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(ua);
  const looksLikeIosWebView = isIOS && !isThirdPartyIosBrowser && !/Safari/i.test(ua);

  const isInApp = IN_APP_UA.test(ua) || looksLikeIosWebView;

  return { isInApp, platform, canEscapeProgrammatically: isInApp && isAndroid };
}

/**
 * Hands the current URL to a real browser on Android. Returns false when that is not possible
 * (iOS, or not in an in-app browser), so the caller can fall back to instructions rather than
 * firing a navigation that goes nowhere.
 */
export function escapeToRealBrowser(url: string = window.location.href): boolean {
  const { canEscapeProgrammatically } = detectInAppBrowser();
  if (!canEscapeProgrammatically) return false;

  const stripped = url.replace(/^https?:\/\//, "");
  // `S.browser_fallback_url` is what runs if Chrome is absent — without it the tap is a no-op
  // on a device that uses a different default browser.
  const intent =
    `intent://${stripped}#Intent;scheme=https;package=com.android.chrome;` +
    `S.browser_fallback_url=${encodeURIComponent(url)};end`;

  window.location.href = intent;
  return true;
}
