"use client";

import { GoalWizard } from "@/components/onboarding/GoalWizard";

/**
 * Step 2 — which DEC, scoped to the cégep picked in step 1. Shares its implementation with
 * /onboarding/goal; see GoalWizard for why the two halves live in one component.
 */
export default function ProgramPage() {
  return <GoalWizard startStep="program" />;
}
