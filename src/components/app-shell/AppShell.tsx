import type { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";
import { SyncErrorToast } from "./SyncErrorToast";
import { InAppBrowserBanner } from "@/components/InAppBrowserBanner";
import { ContentTransition } from "./ContentTransition";

export function AppShell({
  children,
  rScore,
  rScoreStatus = null,
  currentSession = null,
  backHref,
  footer = true,
  skeleton = false,
}: {
  children: ReactNode;
  rScore?: number | null;
  rScoreStatus?: "confirmed" | "estimated" | null;
  currentSession?: number | null;
  /** When set, the top bar shows a back arrow to this path instead of the logo (detail pages). */
  backHref?: string;
  footer?: boolean;
  /** A placeholder render: animates in like content, but does not tell the boot splash the app is ready. */
  skeleton?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-chalk">
      <InAppBrowserBanner />
      <TopNav rScore={rScore} rScoreStatus={rScoreStatus} currentSession={currentSession} backHref={backHref} />
      <main className="flex-1 pt-[calc(3rem+1px)] pb-[calc(3.0625rem+env(safe-area-inset-bottom)*0.5)] md:pb-0">
        <ContentTransition skeleton={skeleton}>{children}</ContentTransition>
      </main>
      {footer && <Footer stackAboveBottomNav />}
      <BottomNav />
      <SyncErrorToast />
    </div>
  );
}
