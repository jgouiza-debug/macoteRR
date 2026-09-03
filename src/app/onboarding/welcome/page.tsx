import type { Metadata } from "next";
import { WelcomeScreen } from "./WelcomeScreen";

export const metadata: Metadata = {
  title: "Bienvenue",
};

/**
 * First-visit screen. A server file so the title is real metadata; the screen itself is a
 * client component (it reads the profile store and the funnel's search params).
 */
export default function WelcomePage() {
  return <WelcomeScreen />;
}
