import type { Metadata } from "next";
import { Suspense } from "react";

/**
 * The signed-in app: dashboard, programs, bursaries, profile, counselor prep. Grouped so they
 * share one error boundary and one loading skeleton, and so their pages are kept out of
 * search indexes (they render a student's own data). /programs opts back in via its own
 * layout — it is public, source-stamped fact.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AppGroupLayout({ children }: LayoutProps<"/">) {
  // Client pages under here read the query string (useSearchParams) for edit-mode returns;
  // the boundary keeps the static shell prerenderable.
  return <Suspense fallback={null}>{children}</Suspense>;
}
