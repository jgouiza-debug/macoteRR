"use client";

import { GoalWizard } from "@/components/onboarding/GoalWizard";

/** The DEC picker (and, for Sciences humaines / de la nature, its profile picker). */
export function ProgramScreen() {
  return <GoalWizard startStep="program" />;
}
