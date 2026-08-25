import { redirect } from "next/navigation";

/** The funnel now starts at the cégep, which every later step filters on. */
export default function OnboardingIndex() {
  redirect("/onboarding/cegep");
}
