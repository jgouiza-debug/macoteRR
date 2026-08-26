// Single source of truth for the site's own URL. Never hardcode the domain anywhere else.
//
// This MUST be the canonical host, which is www: the apex 301-redirects to it. That is not
// cosmetic — src/lib/auth/redirect.ts falls back to SITE_URL for the magic-link callback, and
// Supabase rejects any emailRedirectTo that is not on its allow-list character for character.
// An apex URL there is refused outright rather than following the redirect.
export const SITE_URL = "https://www.macote.xyz";

// Bare domain, for display only (install card, QR caption). Keeps the shorter form a person
// would say aloud, which is why it does not carry the www.
export const SITE_DOMAIN = "macote.xyz";
