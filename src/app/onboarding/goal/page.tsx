import type { Metadata } from "next";
import { GoalScreen } from "./GoalScreen";

export const metadata: Metadata = {
  title: "Ton objectif",
};

/**
 * Step 4 — where the student is headed, and the interest quiz for those who do not yet know.
 * Runs after the results screen so the quiz lands once the student has seen what their score
 * already opens, rather than asking them to plan before they have any picture of it. A server
 * file so the title is real metadata; the screen itself is a client component.
 */
export default function GoalPage() {
  return <GoalScreen />;
}
