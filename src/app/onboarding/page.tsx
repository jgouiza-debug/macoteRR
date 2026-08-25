import { redirect } from "next/navigation";

/**
 * The funnel starts at the cégep, because every later step is scoped by it: the DEC picker
 * lists only what that school offers, and the bursary matcher keys off it.
 */
export default function OnboardingIndex() {
  redirect("/onboarding/cegep");
}
