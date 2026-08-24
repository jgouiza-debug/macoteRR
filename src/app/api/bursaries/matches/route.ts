import { NextResponse } from "next/server";

// Three-tier bursary matching (Matched/Close/Explore) per docs/03-bursary-matching-system.md.
// Implemented in Phase 4.
export async function GET() {
  return NextResponse.json({ error: "Not implemented until Phase 4" }, { status: 501 });
}
