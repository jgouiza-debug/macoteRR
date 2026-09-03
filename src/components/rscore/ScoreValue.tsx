"use client";

import { TrendingUp } from "lucide-react";
import { formatScore } from "@/lib/format";
import { useFormat } from "@/lib/i18n/useFormat";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/dictionary";

type Size = "hero" | "lg" | "md" | "sm" | "inline";

const SIZE_CLASSES: Record<Size, string> = {
  hero: "text-[46px]",
  lg: "text-[32px]",
  md: "text-[20px]",
  sm: "text-[14px]",
  inline: "",
};

/**
 * The one place a cote R number is rendered.
 *
 * GUARDRAIL #2 lives here so no screen can get it wrong: an estimate always carries the
 * leading "≈ " (and a screen-reader prefix), and when `framed` it also gets the dashed border
 * and the ESTIMATION badge; a confirmed score never does. Every screen that shows a score
 * (dashboard card, target rows, profile, programme list and detail, counselor sheet, results,
 * top chip, what-if sheet) renders through this component.
 *
 * `status` null is a number whose provenance is unknown (a profile written before statuses
 * existed): it is rendered as an estimate, never as confirmed.
 */
export function ScoreValue({
  value,
  status,
  size = "md",
  framed = false,
  badge = "auto",
  decimals,
  locale,
  className = "",
}: {
  value: number;
  status: "confirmed" | "estimated" | null;
  size?: Size;
  /** Dashed box (estimate) or solid box (confirmed) around the number, with the badge. */
  framed?: boolean;
  /** "auto" shows the ESTIMATION badge only when framed; "always" / "never" override. */
  badge?: "auto" | "always" | "never";
  decimals?: number;
  /** Force a number locale (the counselor sheet is fr-CA on paper whatever the UI locale). */
  locale?: Locale;
  className?: string;
}) {
  const f = useFormat();
  const { t } = useLocale();
  const estimated = status !== "confirmed";
  const showBadge = estimated && (badge === "always" || (badge === "auto" && framed));

  const number = (
    <span
      className={`font-display font-extrabold leading-none tabular-nums ${SIZE_CLASSES[size]} ${className}`}
    >
      {estimated && (
        <>
          <span className="sr-only">{t("dash.estimated")} </span>
          <span aria-hidden="true">≈ </span>
        </>
      )}
      {locale ? formatScore(value, locale, decimals) : f.score(value, decimals)}
    </span>
  );

  if (!framed) return number;

  return (
    <span
      className={`inline-flex flex-col items-center gap-1 rounded-xl border px-4 py-2.5 ${
        estimated ? "border-dashed border-moss/60 bg-paper" : "border-moss/60 bg-moss/[0.02]"
      }`}
    >
      {showBadge && (
        <span className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-moss">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
          {t("dash.estimated")}
        </span>
      )}
      {number}
    </span>
  );
}
