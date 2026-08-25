"use client";

import { GoalWizard } from "@/components/onboarding/GoalWizard";

/**
 * Step 4 — where the student is headed, and the interest quiz for those who do not yet know.
 * Runs after the results screen so the quiz lands once the student has seen what their score
 * already opens, rather than asking them to plan before they have any picture of it.
 */
export default function GoalPage() {
  return <GoalWizard startStep="future" />;
}
