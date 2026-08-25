import type { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";
import { ProfileSyncGate } from "./ProfileSyncGate";

export function AppShell({
  children,
  rScore,
  footer = true,
}: {
  children: ReactNode;
  rScore?: number;
  footer?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-chalk">
      {/* Every gated route renders through this shell, so the post-sign-in reconcile has
          exactly one mount point rather than one per page. */}
      <ProfileSyncGate />
      <TopNav rScore={rScore} />
      <main className="flex-1 pt-16 pb-20 md:pb-0">{children}</main>
      {footer && <Footer stackAboveBottomNav />}
      <BottomNav />
    </div>
  );
}
