"use client";

import { GoalWizard } from "@/components/onboarding/GoalWizard";

/** The goal half of the wizard: specific programs, broad interests, or the quick quiz. */
export function GoalScreen() {
  return <GoalWizard startStep="future" />;
}
