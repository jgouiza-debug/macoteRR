import type { Metadata } from "next";
import { StartingScreen } from "./StartingScreen";

export const metadata: Metadata = { title: "Je commence le cégep" };

/**
 * Step 3c — no score yet. Server file so the title can be set; the screen lives in
 * StartingScreen (profile store, funnel params, the wipe confirmation sheet).
 */
export default function StartingCegepPage() {
  return <StartingScreen />;
}
