// Single source of truth for the site's own URL. Never hardcode the domain anywhere else.
//
// This MUST be the canonical host, which is www: the apex 301-redirects to it. That is not
// cosmetic — src/lib/auth/redirect.ts falls back to SITE_URL for the magic-link callback, and
// Supabase rejects any emailRedirectTo that is not on its allow-list character for character.
// An apex URL there is refused outright rather than following the redirect.
//
// NEXT_PUBLIC_SITE_URL overrides the default (local dev, a preview deploy). Every
// process.env.NEXT_PUBLIC_* read in this file is written out as a literal member access on
// purpose: Next.js inlines them at build time only in that exact form, never through a loop
// or a computed key.
const DEFAULT_SITE_URL = "https://www.macote.xyz";

/** Trimmed env value, or null when the variable is unset, empty or whitespace. */
function envValue(raw: string | undefined): string | null {
  const value = raw?.trim() ?? "";
  return value === "" ? null : value;
}

export const SITE_URL = (envValue(process.env.NEXT_PUBLIC_SITE_URL) ?? DEFAULT_SITE_URL).replace(/\/+$/, "");

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    // A malformed override still yields something displayable rather than crashing the build.
    return url.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "").split("/")[0] ?? url;
  }
}

// Bare domain, for display only (install card, QR caption). Keeps the shorter form a person
// would say aloud, which is why it does not carry the www.
export const SITE_DOMAIN = hostOf(SITE_URL).replace(/^www\./i, "");

/**
 * Published page text that must not be invented: a real contact address, the named person
 * responsible for personal information (Loi 25), where the data physically lives, and who
 * built the site. Each is `null` until its NEXT_PUBLIC_ variable is set, and the marketing
 * pages render a visible "à confirmer" chip in its place (see PendingValue.tsx) — never a
 * made-up value. They are NEXT_PUBLIC_ on purpose: they are page text rendered by client
 * components, not secrets.
 */
export type SiteConfig = {
  /** Address for general, privacy and accessibility requests — /contact, /confidentialite, /accessibilite. */
  contactEmail: string | null;
  /** Address the /pour-les-cegeps pilot form mails to. */
  pilotEmail: string | null;
  /** Name (and title) of the person responsible for the protection of personal information. */
  privacyOfficer: string | null;
  /** Where student data is hosted (e.g. the Supabase region) — /confidentialite. */
  dataRegion: string | null;
  /** Founder's name — /a-propos identity card. */
  founderName: string | null;
  /** Founder's cégep — /a-propos identity card. */
  founderCegep: string | null;
};

export const SITE_CONFIG: SiteConfig = {
  contactEmail: envValue(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
  pilotEmail: envValue(process.env.NEXT_PUBLIC_PILOT_EMAIL),
  privacyOfficer: envValue(process.env.NEXT_PUBLIC_PRIVACY_OFFICER),
  dataRegion: envValue(process.env.NEXT_PUBLIC_DATA_REGION),
  founderName: envValue(process.env.NEXT_PUBLIC_FOUNDER_NAME),
  founderCegep: envValue(process.env.NEXT_PUBLIC_FOUNDER_CEGEP),
};
