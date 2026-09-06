"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAppReady } from "@/lib/boot-ready";

/** The R of the MaCote mark, same path the welcome screen draws. */
const R_PATH_D =
  "M0.0 100.0V0.0H41.5Q48.2 0.0 54.2 1.1Q60.2 2.3 65.1 4.5Q70.0 6.8 73.6 10.3Q77.3 13.8 79.2 18.6Q81.2 23.3 81.2 29.4Q81.2 34.1 79.6 38.3Q78.0 42.4 74.6 45.8Q71.2 49.1 65.8 51.3Q60.5 53.5 53.0 54.4V55.6Q62.7 56.1 68.0 59.4Q73.3 62.7 76.0 67.8Q78.6 72.9 80.0 78.8L85.3 100.0H58.2L54.4 80.2Q53.5 75.0 51.6 71.8Q49.7 68.6 46.2 67.1Q42.7 65.6 37.0 65.6H24.5V100.0ZM24.5 46.7H38.8Q47.1 46.7 51.5 43.5Q55.9 40.3 55.9 33.8Q55.9 26.7 51.8 23.2Q47.7 19.7 39.4 19.7H24.5Z";

/**
 * Where a load counts as the app booting. The marketing pages are a website — someone arriving
 * from a search result wants the page, not a launch sequence in front of it.
 */
const APP_PREFIXES = [
  "/dashboard",
  "/programs",
  "/bursaries",
  "/profile",
  "/counselor-prep",
  "/onboarding",
  "/app",
];

/**
 * Mark in (520ms), dot in (ends at 640ms): the floor lets that finish. After it the splash
 * fades the moment the first real screen has rendered (see ContentTransition); the cap ends
 * it regardless, so a slow reconcile never leaves a logo over a usable app.
 */
const FLOOR_MS = 700;
const CAP_MS = 2600;
const FADE_MS = 320;

/**
 * Survives client-side navigation because the module does. The splash belongs to the boot, so
 * it plays once per document load; moving between tabs afterwards must not replay it.
 */
let hasBooted = false;

/**
 * The mark, animated over the app while it comes up. Rendered in the server HTML so it is on
 * screen at first paint rather than after hydration — which is the whole point of a splash.
 *
 * Two safety nets: the JS cap above, and a CSS fade at 3s that runs even if hydration never
 * happens, so a broken bundle still ends with the app visible instead of a chalk rectangle.
 */
export function BootSplash() {
  const pathname = usePathname();
  const ready = useAppReady();
  const isAppRoute = APP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  // The welcome screen draws this same mark itself; back to back it reads as a stutter.
  const show = isAppRoute && pathname !== "/onboarding/welcome" && !hasBooted;

  const [phase, setPhase] = useState<"in" | "out" | "done">("in");
  const [mountedAt] = useState(() => (typeof performance === "undefined" ? 0 : performance.now()));

  // Leave once ready and past the floor, or at the cap — whichever comes first.
  useEffect(() => {
    if (!show || phase !== "in") return;
    const elapsed = performance.now() - mountedAt;
    const wait = ready ? Math.max(0, FLOOR_MS - elapsed) : Math.max(0, CAP_MS - elapsed);
    const id = window.setTimeout(() => setPhase("out"), wait);
    return () => window.clearTimeout(id);
  }, [show, phase, ready, mountedAt]);

  // Unmount after the fade has played.
  useEffect(() => {
    if (phase !== "out") return;
    const id = window.setTimeout(() => {
      hasBooted = true;
      setPhase("done");
    }, FADE_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  if (!show || phase === "done") return null;

  return (
    <div
      aria-hidden="true"
      className={`boot-splash pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-chalk ${
        phase === "out" ? "boot-splash-out" : ""
      }`}
    >
      {/* Opacity and transform only — nothing else. This plays while the app is parsing and
          hydrating, so the main thread is the busiest it will ever be; the previous version
          animated clip-path, which repaints on the main thread every frame and therefore
          stuttered exactly when it was on screen. These two properties run on the compositor
          and are unaffected by whatever React is doing. */}
      <style>{`
        @keyframes bootMarkIn {
          0% { opacity: 0; transform: scale(0.94); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes bootDotIn {
          0% { opacity: 0; transform: scale(0.4); }
          60% { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes bootSplashOut {
          0% { opacity: 1; }
          100% { opacity: 0; visibility: hidden; }
        }
        .boot-splash {
          animation: bootSplashOut ${FADE_MS}ms ease-out 3000ms forwards;
        }
        .boot-splash-out {
          animation: bootSplashOut ${FADE_MS}ms ease-out 0ms forwards;
        }
        .boot-splash-mark {
          opacity: 0;
          will-change: opacity, transform;
          animation: bootMarkIn 520ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .boot-splash-dot {
          opacity: 0;
          transform-box: fill-box;
          transform-origin: center;
          will-change: opacity, transform;
          animation: bootDotIn 340ms cubic-bezier(0.22, 1, 0.36, 1) 300ms forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .boot-splash-mark, .boot-splash-dot { animation: none; opacity: 1; }
          .boot-splash { animation: bootSplashOut 200ms linear 400ms forwards; }
          .boot-splash-out { animation: bootSplashOut 200ms linear 0ms forwards; }
        }
      `}</style>

      <div className="boot-splash-mark">
        <svg
          width="164"
          height="126"
          viewBox="0 0 130.3 100"
          role="presentation"
          className="overflow-visible"
        >
          <path d={R_PATH_D} fill="var(--color-ink)" />
          <circle
            cx="110.3"
            cy="20.0"
            r="20.0"
            fill="var(--color-ultramarine)"
            className="boot-splash-dot"
          />
        </svg>
      </div>
    </div>
  );
}
