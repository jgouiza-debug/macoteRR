import type { Metadata } from "next";
import { ScoreScreen } from "./ScoreScreen";

export const metadata: Metadata = { title: "Ta cote R" };

/**
 * Step 3 of the funnel — the chooser between "I know my score", "estimate it" and "I'm just
 * starting". A server file so the title is real metadata; the screen itself is a client
 * component (profile store, funnel params, the estimate warning sheet).
 */
export default function KnowYourScorePage() {
  return <ScoreScreen />;
}
