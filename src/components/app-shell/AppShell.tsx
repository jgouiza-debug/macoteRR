import type { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";
import { InAppBrowserBanner } from "@/components/InAppBrowserBanner";

export function AppShell({
  children,
  rScore,
  footer = true,
}: {
  children: ReactNode;
  rScore?: number | null;
  footer?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-chalk">
      <InAppBrowserBanner />
      <TopNav rScore={rScore} />
      <main className="flex-1 pt-13 pb-20 md:pb-0">{children}</main>
      {footer && <Footer stackAboveBottomNav />}
      <BottomNav />
    </div>
  );
}
