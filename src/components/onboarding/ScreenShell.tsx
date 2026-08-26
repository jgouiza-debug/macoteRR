import type { ReactNode } from "react";
import { OnboardingTopBar } from "./OnboardingTopBar";
import { InAppBrowserBanner } from "@/components/InAppBrowserBanner";

/**
 * Single-column funnel screen. Uses 100dvh rather than 100vh so the layout tracks
 * mobile browser chrome as it collapses, instead of overshooting by the toolbar height.
 */
export function ScreenShell({
  children,
  footer,
  backHref,
  brand = false,
}: {
  children: ReactNode;
  footer?: ReactNode;
  backHref?: string;
  brand?: boolean;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-chalk">
      <InAppBrowserBanner />
      <OnboardingTopBar backHref={backHref} brand={brand} />
      {/* justify-center pulls short funnel screens (two choices, one input) into the optical
          centre instead of stranding them at the top above ~900px of empty chalk. Long
          screens overflow past centre and scroll normally, so this costs them nothing. */}
      <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col justify-center px-5 pt-2">
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
