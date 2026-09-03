import type { Metadata } from "next";
import { EstimateScoreScreen } from "./EstimateScoreScreen";

export const metadata: Metadata = { title: "Estimer ta cote R" };

/**
 * Step 3b — the estimate. Server file so the title can be set; the estimator lives in
 * EstimateScoreScreen (profile store, funnel params, sessionStorage draft).
 */
export default function EstimateScorePage() {
  return <EstimateScoreScreen />;
}
