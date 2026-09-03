import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safePath } from "@/lib/safe-path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Routes that require a signed-in student. Onboarding itself stays open — the funnel builds
 * the profile that the account is created to hold, so gating it would be circular — and so
 * does /programs: it is public, source-stamped fact about universities, and "je veux juste
 * voir les seuils" has to be a promise the app can keep. Everything personal is behind the
 * session.
 */
const PROTECTED_PREFIXES = ["/dashboard", "/bursaries", "/profile", "/counselor-prep"];

/**
 * Where a signed-out visitor is sent. Deliberately the funnel's entry point, not the sign-up
 * screen: the proxy can only see cookies, so it knows there is no session but not whether the
 * student has picked a cégep yet. /onboarding resolves that client-side and forwards to the
 * first unfinished step, so a cold boot starts at the beginning instead of landing on the
 * last screen of a funnel that was never run.
 */
const ONBOARDING_ENTRY = "/onboarding";
const SIGN_UP_PATH = "/onboarding/account";

/**
 * Local development without a Supabase project (docs/SETUP-CLOUD.md § "Local without
 * Supabase"): serve the protected pages to a guest so the screenshot harness can render them
 * against a seeded profile. `NODE_ENV` is fixed at build time, so this branch does not exist
 * in a production bundle whatever the variable says.
 */
const DEV_AUTH_BYPASS =
  process.env.NODE_ENV !== "production" && process.env.MACOTE_DEV_AUTH_BYPASS === "1";

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (DEV_AUTH_BYPASS) {
    return NextResponse.next();
  }

  // Misconfiguration, not an anonymous visitor. Previously this failed open, which was safe
  // only while the proxy did nothing but refresh a cookie. Now that it gates routes, failing
  // open would silently serve protected pages to everyone, so protected paths bounce to
  // sign-up and public ones still render.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "proxy: NEXT_PUBLIC_SUPABASE_URL/ANON_KEY missing — see docs/SETUP-CLOUD.md",
    );
    if (isProtected(pathname)) {
      return NextResponse.redirect(new URL(ONBOARDING_ENTRY, request.url));
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
    const redirectUrl = new URL(ONBOARDING_ENTRY, request.url);
    // Remember where they were headed so the funnel and the callback can finish the trip.
    redirectUrl.searchParams.set("next", pathname);
    // A locale hand-off (/app?lang=en from the English site) must survive the bounce too.
    const lang = searchParams.get("lang");
    if (lang === "en" || lang === "fr") redirectUrl.searchParams.set("lang", lang);
    return NextResponse.redirect(redirectUrl);
  }

  // A signed-in student landing back on sign-up has already finished the funnel. Honour the
  // destination the funnel was carrying rather than always dropping them on the dashboard.
  if (user && pathname === SIGN_UP_PATH) {
    const next = safePath(searchParams.get("next")) ?? "/dashboard";
    return NextResponse.redirect(new URL(next, request.url));
  }

  return response;
}

export const config = {
  // Static assets, the service worker, the manifest, and the brand/icon folders never need a
  // session lookup; each one that slipped through here cost a Supabase round-trip per request.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|brand/|sw.js|swe-worker|manifest.webmanifest|og.png|qr-code.svg).*)",
  ],
};
