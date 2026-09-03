"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LangToggle } from "@/components/ui/LangToggle";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { firstIncompletePath } from "@/lib/profile/onboarding";
import { useFunnelNav } from "@/lib/profile/funnel-nav";
import { readProfile } from "@/lib/profile/store";

const R_PATH_D =
  "M0.0 100.0V0.0H41.5Q48.2 0.0 54.2 1.1Q60.2 2.3 65.1 4.5Q70.0 6.8 73.6 10.3Q77.3 13.8 79.2 18.6Q81.2 23.3 81.2 29.4Q81.2 34.1 79.6 38.3Q78.0 42.4 74.6 45.8Q71.2 49.1 65.8 51.3Q60.5 53.5 53.0 54.4V55.6Q62.7 56.1 68.0 59.4Q73.3 62.7 76.0 67.8Q78.6 72.9 80.0 78.8L85.3 100.0H58.2L54.4 80.2Q53.5 75.0 51.6 71.8Q49.7 68.6 46.2 67.1Q42.7 65.6 37.0 65.6H24.5V100.0ZM24.5 46.7H38.8Q47.1 46.7 51.5 43.5Q55.9 40.3 55.9 33.8Q55.9 26.7 51.8 23.2Q47.7 19.7 39.4 19.7H24.5Z";

const WELCOME_STORAGE_KEY = "macote.has_seen_welcome";

/**
 * The one screen a student sees exactly once. Its CTA goes to the first unfinished step with
 * the funnel's intent parameters intact (the entry router forwards `?edit` / `?next` here),
 * so a deep link that bounced through the proxy still ends where it was headed.
 */
export function WelcomeScreen() {
  const router = useRouter();
  const { t } = useLocale();
  const { hrefFor } = useFunnelNav();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Subscribed rather than read once: the preference can change mid-session (iOS exposes it
    // in Control Center), and a one-shot read would keep animating for someone who just asked
    // the system to stop. Subscribing is also what the lint rule is asking for — an effect
    // should sync with an external system, not just push a value into state on mount.
    const sync = () => setPrefersReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  function handleStart() {
    try {
      localStorage.setItem(WELCOME_STORAGE_KEY, "1");
    } catch {
      /* ignore storage failure */
    }
    router.push(hrefFor(firstIncompletePath(readProfile())));
  }

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-chalk">
      <style>{`
        @keyframes welcomeMarkDraw {
          0% {
            clip-path: inset(0 100% 0 0);
            opacity: 0.3;
          }
          100% {
            clip-path: inset(0 0% 0 0);
            opacity: 1;
          }
        }
        @keyframes welcomeDotSettle {
          0% {
            opacity: 0;
            transform: scale(0) translate(-8px, -12px);
          }
          70% {
            opacity: 1;
            transform: scale(1.15) translate(0, 0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translate(0, 0);
          }
        }
        @keyframes welcomeContentEnter {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-welcome-mark {
          animation: welcomeMarkDraw 600ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-welcome-dot {
          animation: welcomeDotSettle 220ms cubic-bezier(0.16, 1, 0.3, 1) 480ms forwards;
        }
        .animate-welcome-content {
          animation: welcomeContentEnter 180ms cubic-bezier(0.16, 1, 0.3, 1) 600ms forwards;
        }
      `}</style>

      <header className="pt-safe">
        <div className="mx-auto flex h-14 w-full max-w-[430px] items-center justify-end px-5">
          <LangToggle />
        </div>
      </header>

      <main
        id="main"
        className="flex w-full flex-1 flex-col items-center justify-center px-5 pt-4 text-center pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="flex w-full max-w-[360px] flex-col items-center">
          {/* Large MaCote Mark */}
          <div className="relative mb-6 flex items-center justify-center">
            <svg
              width="88"
              height="68"
              viewBox="0 0 130.3 100"
              role="img"
              aria-label={t("welcome.markAlt")}
              className="overflow-visible"
            >
              <path
                d={R_PATH_D}
                fill="var(--color-ink)"
                className={prefersReducedMotion ? undefined : "animate-welcome-mark"}
              />
              <circle
                cx="110.3"
                cy="20.0"
                r="20.0"
                fill="var(--color-ultramarine)"
                style={prefersReducedMotion ? undefined : { opacity: 0 }}
                className={prefersReducedMotion ? undefined : "animate-welcome-dot"}
              />
            </svg>
          </div>

          {/* Content Section (Staggered entrance after mark draw) */}
          <div
            style={prefersReducedMotion ? undefined : { opacity: 0 }}
            className={`flex w-full flex-col items-center ${
              prefersReducedMotion ? "" : "animate-welcome-content"
            }`}
          >
            <h1 className="font-display text-[24px] font-bold leading-tight tracking-tight text-ink">
              {t("welcome.title")}
            </h1>
            <p className="mt-2 text-[15px] leading-relaxed text-secondary">
              {t("welcome.body")}
            </p>

            <button
              type="button"
              onClick={handleStart}
              className="mt-8 flex h-[52px] w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card tap-spring active:scale-[0.98]"
            >
              {t("welcome.cta")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
