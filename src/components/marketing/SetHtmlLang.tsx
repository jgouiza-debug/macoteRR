"use client";

import { useEffect } from "react";

/**
 * The root layout owns the single <html> tag (French, the app's default) and can't be
 * overridden per-route without restructuring the whole app under a [locale] segment —
 * which would also force locale-prefixing onto the app's onboarding/dashboard routes,
 * out of scope here. English marketing pages correct the lang attribute on mount instead;
 * hreflang tags (set per-page in metadata) carry the SEO signal regardless.
 */
export function SetHtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = "fr";
    };
  }, [lang]);
  return null;
}
