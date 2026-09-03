import type { Metadata } from "next";
import { AccountScreen } from "./AccountScreen";

/**
 * Step 5 — the account. Server file so the title can be set; the screen itself is a client
 * component (Supabase auth, sessionStorage draft, funnel params) and lives in AccountScreen.
 */
export const metadata: Metadata = { title: "Ton compte" };

export default function AccountPage() {
  return <AccountScreen />;
}
