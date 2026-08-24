import { NextResponse } from "next/server";

// Confirmed-vs-estimated cote R read/write per docs/01-data-architecture.md. Implemented in Phase 2.
export async function GET() {
  return NextResponse.json({ error: "Not implemented until Phase 2" }, { status: 501 });
}
