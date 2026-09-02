import type { Metadata } from "next";
import { Suspense } from "react";
import OnboardingLoading from "./loading";

/**
 * The funnel. Every step is a client screen that reads `?edit=`, `?next=` and (in the goal
 * wizard) `?step=` through useSearchParams, so the group needs one Suspense boundary or the
 * production build refuses to prerender the steps. Each step's page.tsx sets its own title;
 * none of them should be indexed.
 */
export const metadata: Metadata = {
  title: "Commencer",
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({ children }: LayoutProps<"/onboarding">) {
  return <Suspense fallback={<OnboardingLoading />}>{children}</Suspense>;
}
