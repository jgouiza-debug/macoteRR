"use client";

import { useMemo } from "react";
import { useLocale } from "./LocaleProvider";
import {
  formatAmount,
  formatDate,
  formatScore,
  formatSignedScore,
  type DatePrecision,
} from "@/lib/format";

/** Locale-bound formatters, so components never have to thread `locale` through by hand. */
export function useFormat() {
  const { locale } = useLocale();

  return useMemo(
    () => ({
      locale,
      score: (value: number, decimals = 1) => formatScore(value, locale, decimals),
      signedScore: (value: number, decimals = 1) => formatSignedScore(value, locale, decimals),
      amount: (value: number) => formatAmount(value, locale),
      date: (iso: string, precision: DatePrecision = "day") => formatDate(iso, locale, precision),
    }),
    [locale],
  );
}
