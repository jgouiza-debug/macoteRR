"use client";

import { useEffect } from "react";

/**
 * The root layout owns the single <html> tag (French, the app's default) and can't be
 * overridden per-route without restructuring the whole app under a [locale] segment —
 * which would also force locale-prefixing onto the app's onboarding/dashboard routes,
 * out of scope here. English marketing pages correct the lang attribute on mount instead;
 * hreflang tags (set per-page in metadata) carry the SEO signal regardless.
 *
 * Nothing is reset on unmount: the LocaleProvider owns the attribute from then on, and a
 * cleanup that wrote "fr" back used to clobber the "en" it had just set when the English site
 * handed off into the app.
 */
export function SetHtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return null;
}
