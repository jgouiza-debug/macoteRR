import { NextResponse } from "next/server";

// Stripe webhook for the premium tier per docs/00-BUILD-PROMPT.md Phase 6. Implemented then.
export async function POST() {
  return NextResponse.json({ error: "Not implemented until Phase 6" }, { status: 501 });
}
