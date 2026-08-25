import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Routes that require a signed-in student. Onboarding itself stays open — the funnel builds
 * the profile that the account is created to hold, so gating it would be circular — but
 * everything the funnel leads to is behind the session.
 */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/programs",
  "/bursaries",
  "/profile",
  "/counselor-prep",
];

const SIGN_UP_PATH = "/onboarding/account";

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Misconfiguration, not an anonymous visitor. Previously this failed open, which was safe
  // only while the proxy did nothing but refresh a cookie. Now that it gates routes, failing
  // open would silently serve protected pages to everyone, so protected paths bounce to
  // sign-up and public ones still render.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "proxy: NEXT_PUBLIC_SUPABASE_URL/ANON_KEY missing — see docs/SETUP-CLOUD.md",
    );
    if (isProtected(pathname)) {
      return NextResponse.redirect(new URL(SIGN_UP_PATH, request.url));
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

  // Refreshes the session cookie when expired; do not remove this call even though its
  // return value is only used for the gate below (Supabase SSR docs are explicit about this).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected(pathname)) {
    const redirectUrl = new URL(SIGN_UP_PATH, request.url);
    // Remember where they were headed so the callback can finish the trip after sign-in.
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // A signed-in student landing back on sign-up has already finished the funnel.
  if (user && pathname === SIGN_UP_PATH) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|sw.js|manifest.webmanifest).*)"],
};
