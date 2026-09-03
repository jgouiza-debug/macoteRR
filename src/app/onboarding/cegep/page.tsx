import type { Metadata } from "next";
import { CegepScreen } from "./CegepScreen";

export const metadata: Metadata = {
  title: "Ton cégep",
};

/**
 * Step 1 of the funnel. A server file so the title is real metadata; the screen itself is a
 * client component (it reads the profile store and the funnel's search params).
 */
export default function CegepPickerPage() {
  return <CegepScreen />;
}
