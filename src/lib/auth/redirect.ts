"use client";

import { SITE_URL } from "@/lib/site-config";
import { safePath } from "@/lib/safe-path";

/**
 * Where a magic link should send the student back to.
 *
 * This cannot be `window.location.origin`. Inside the native shell that origin is
 * `http://localhost:3000` (capacitor.config.ts points `server.url` there), so the link baked
 * into the email pointed at the phone's own localhost — which is nothing. Tapping it opened a
 * browser and failed, instead of returning to the app.
 *
 * The rule: a real, publicly reachable origin is used as-is (deployed web, and localhost
 * during actual desktop development, where localhost genuinely is the app). Anything else —
 * the Capacitor shell, a `capacitor://` or `file://` origin — falls back to SITE_URL, which is
 * reachable from a phone's mail client.
 *
 * NOTE: this makes the link *work*; it does not make it reopen the native app. That needs
 * Universal Links / App Links associating the domain with the bundle id, plus a Capacitor
 * `appUrlOpen` listener. Until that exists the link completes sign-in in the browser, and the
 * app picks the session up on next launch only if it shares a cookie jar — which the localhost
 * shell does not. See docs/SETUP-CLOUD.md.
 */
export function authRedirectOrigin(): string {
  if (typeof window === "undefined") return SITE_URL;

  const { origin, protocol, hostname } = window.location;

  // A Capacitor/WebView origin is not something an email client can reach.
  if (protocol !== "http:" && protocol !== "https:") return SITE_URL;

  // Localhost is only a real destination when the developer is on this machine. The native
  // shell also reports localhost, so treat it as usable only when not running under Capacitor.
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const isNativeShell =
    typeof (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform ===
    "function";

  if (isLocalhost && isNativeShell) return SITE_URL;

  return origin;
}

/** Full callback URL for `signInWithOtp`, carrying where to land after the exchange. */
export function authCallbackUrl(next: string): string {
  const safeNext = safePath(next) ?? "/dashboard";
  return `${authRedirectOrigin()}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}
