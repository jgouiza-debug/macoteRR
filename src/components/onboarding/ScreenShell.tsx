import type { ReactNode } from "react";
import { OnboardingTopBar } from "./OnboardingTopBar";
import type { OnboardingStep } from "@/lib/profile/onboarding";

/**
 * Single-column funnel screen. Uses 100dvh rather than 100vh so the layout tracks
 * mobile browser chrome as it collapses, instead of overshooting by the toolbar height.
 *
 * The in-app-browser banner is rendered by the top bar (see OnboardingTopBar), not here, so
 * the screen has exactly one sticky, safe-area-padded element at the top.
 */
export function ScreenShell({
  children,
  footer,
  backHref,
  onBack,
  brand = false,
  step,
}: {
  children: ReactNode;
  footer?: ReactNode;
  backHref?: string;
  onBack?: () => void;
  brand?: boolean;
  /** Which of the five funnel steps this screen belongs to; drives the "Étape n sur 5" line. */
  step?: OnboardingStep;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-chalk">
      <OnboardingTopBar backHref={backHref} onBack={onBack} brand={brand} step={step} />
      {/* justify-center pulls short funnel screens (two choices, one input) into the optical
          centre instead of stranding them at the top above ~900px of empty chalk. Long
          screens overflow past centre and scroll normally, so this costs them nothing.
          Without a footer the content itself can reach the home indicator, so main carries
          the bottom safe-area inset; with one, the sticky footer already does. */}
      <main
        id="main"
        className={`mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center px-5 pt-2 ${
          footer ? "" : "pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))]"
        }`}
      >
        {children}
      </main>
      {footer && (
        <div className="sticky bottom-0 mx-auto w-full max-w-[430px] bg-chalk/90 px-5 pt-3 backdrop-blur-sm pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:pb-5">
          {footer}
        </div>
      )}
    </div>
  );
}

export function ScreenHeading({ title, body }: { title: string; body?: string }) {
  return (
    <div className="mb-6 flex flex-col gap-2.5 pt-3">
      <h1 className="font-display text-[27px] font-bold leading-[1.15] tracking-tight text-ink">
        {title}
      </h1>
      {body && <p className="text-[15px] leading-relaxed text-ink/60">{body}</p>}
    </div>
  );
}
