import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function proxy(request: NextRequest) {
  // No Supabase project configured yet (see docs/SETUP-CLOUD.md) — pass requests
  // through unchanged instead of crashing every route. Safe to fail open TODAY
  // because this proxy only refreshes the session cookie, it doesn't gate access
  // yet. That safety argument stops holding the moment Phase 2 adds real route
  // gating (e.g. `if (!user) redirect(...)`) to this same function -- at that
  // point this early return would silently skip the redirect too. Revisit this
  // branch when that gating logic is added; a deployed environment missing
  // these vars is a misconfiguration worth surfacing loudly, not swallowing.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === "production") {
      console.error("proxy: NEXT_PUBLIC_SUPABASE_URL/ANON_KEY missing in production — see docs/SETUP-CLOUD.md");
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Refreshes the session cookie when expired; do not remove this call even
  // though its return value is unused (Supabase SSR docs are explicit about this).
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|sw.js|manifest.webmanifest).*)"],
};
