import { DICTIONARY, type Locale, type TranslationKey } from "./dictionary";

/**
 * Marketing pages get their locale from the URL (FR unprefixed, EN under /en), not from
 * the client-side LocaleProvider toggle used by the app — so they read DICTIONARY
 * directly instead of going through useLocale(). Correct at build time, no hydration flash.
 */
export function mt(locale: Locale, key: TranslationKey): string {
  return DICTIONARY[locale][key];
}

/** FR path stays bare ("/cote-r"); EN gets the /en prefix ("/en/cote-r"). */
export function localeHref(locale: Locale, path: string): string {
  return locale === "en" ? `/en${path}` : path;
}

/** The other locale's version of the current path, for the language switch link. */
export function otherLocaleHref(locale: Locale, path: string): string {
  return locale === "en" ? path : `/en${path}`;
}
