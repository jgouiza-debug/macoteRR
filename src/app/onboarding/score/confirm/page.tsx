import type { Metadata } from "next";
import { ConfirmScoreScreen } from "./ConfirmScoreScreen";

export const metadata: Metadata = { title: "Entre ta cote R" };

/**
 * Step 3a — the confirmed score. Server file so the title can be set; the form lives in
 * ConfirmScoreScreen (profile store, funnel params, focus management).
 */
export default function ConfirmScorePage() {
  return <ConfirmScoreScreen />;
}
