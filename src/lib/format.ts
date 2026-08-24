import type { Locale } from "@/lib/i18n/dictionary";

const INTL_LOCALE: Record<Locale, string> = { fr: "fr-CA", en: "en-CA" };

/** Cote R, always to a fixed number of decimals so columns stay aligned. */
export function formatScore(value: number, locale: Locale = "fr", decimals = 1): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatSignedScore(value: number, locale: Locale = "fr", decimals = 1): string {
  const formatted = formatScore(Math.abs(value), locale, decimals);
  return value >= 0 ? `+${formatted}` : `−${formatted}`;
}

export function formatAmount(value: number, locale: Locale = "fr"): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);
}

export type DatePrecision = "day" | "month";

/** Dates are stored ISO in the data layer and only formatted at render time. */
export function formatDate(
  iso: string,
  locale: Locale = "fr",
  precision: DatePrecision = "day",
): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;

  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    year: "numeric",
    month: "long",
    ...(precision === "day" ? { day: "numeric" } : {}),
  }).format(date);
}
