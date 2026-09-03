import type { Metadata } from "next";
import { ProgramScreen } from "./ProgramScreen";

export const metadata: Metadata = {
  title: "Ton programme",
};

/**
 * Step 2 — which DEC, scoped to the cégep picked in step 1. A server file so the title is real
 * metadata; the screen itself is a client component. It shares its implementation with
 * /onboarding/goal; see GoalWizard for why the two halves live in one component.
 */
export default function ProgramPage() {
  return <ProgramScreen />;
}
