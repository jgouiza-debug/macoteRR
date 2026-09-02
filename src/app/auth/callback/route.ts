import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/server";
import { safePath } from "@/lib/safe-path";

/**
 * Where the magic link lands. Exchanges the one-time code for a session cookie, then hands
 * the student back to wherever they were headed.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // `next` arrives from an email link, so it is attacker-influencable: only same-origin,
  // path-relative destinations are honoured (src/lib/safe-path.ts).
  const next = safePath(searchParams.get("next")) ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Expired or already-used link. Send them back to sign-up to request a fresh one rather
  // than to a dead-end error route.
  const retry = new URL("/onboarding/account", origin);
  retry.searchParams.set("next", next);
  retry.searchParams.set("error", "link");
  return NextResponse.redirect(retry);
}
