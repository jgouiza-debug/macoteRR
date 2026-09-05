import { Fragment, type ReactNode } from "react";
import { SITE_CONFIG, type SiteConfig } from "@/lib/site-config";
import type { Locale } from "@/lib/i18n/dictionary";

type PendingKind = "text" | "email";

const CHIP_LABEL: Record<Locale, string> = { fr: "à confirmer", en: "to be confirmed" };
// What assistive tech reads for the chip. A bare <span> has the generic role, which cannot take
// aria-label, so this is rendered as real (visually hidden) text rather than an attribute.
const CHIP_ACCESSIBLE_NAME: Record<Locale, string> = {
  fr: "valeur à confirmer avant le lancement",
  en: "value to be confirmed before launch",
};

/**
 * A single value from SITE_CONFIG. Renders the value itself (a mailto: link for `kind="email"`)
 * or, while it is still `null`, a small dashed "à confirmer" chip — deliberately visible, so a
 * page that ships before the value is set says so instead of showing an invented name,
 * address or region.
 */
export function PendingValue({
  value,
  locale,
  kind = "text",
}: {
  value: string | null;
  locale: Locale;
  kind?: PendingKind;
}) {
  if (value === null) {
    // `data-pending-value` lets a build check find every chip still rendering on a page.
    return (
      <span
        title={CHIP_ACCESSIBLE_NAME[locale]}
        data-pending-value="true"
        className="inline-flex rounded-full border border-dashed border-ember/50 bg-ember/[0.06] px-2 py-0.5 align-baseline text-[12px] font-semibold leading-tight text-ember"
      >
        <span aria-hidden="true">{CHIP_LABEL[locale]}</span>
        <span className="sr-only">{CHIP_ACCESSIBLE_NAME[locale]}</span>
      </span>
    );
  }
  if (kind === "email") {
    return (
      <a
        href={`mailto:${value}`}
        // Underlined at rest (it sits mid-paragraph, where colour alone does not read as a link)
        // and padded vertically without shifting the line box, for a taller thumb target.
        className="-my-2 inline-block py-2 font-semibold text-ultramarine underline underline-offset-2 transition-colors hover:text-pressed"
      >
        {value}
      </a>
    );
  }
  return <>{value}</>;
}

const TOKEN_KIND: Record<keyof SiteConfig, PendingKind> = {
  contactEmail: "email",
  pilotEmail: "email",
  privacyOfficer: "text",
  dataRegion: "text",
  founderName: "text",
  founderCegep: "text",
};

// One capturing group so String.split keeps the token names at every odd index.
const TOKEN_RE = /\{(contactEmail|pilotEmail|privacyOfficer|dataRegion|founderName|founderCegep)\}/;

/**
 * Splits a content string on the {contactEmail} {pilotEmail} {privacyOfficer} {dataRegion}
 * {founderName} {founderCegep} tokens and renders a PendingValue for each. Any other text,
 * braces included, passes through untouched. Safe in both server and client components.
 */
export function renderTemplate(text: string, locale: Locale): ReactNode {
  if (!text.includes("{")) return text;
  const parts = text.split(TOKEN_RE);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>;
    const key = part as keyof SiteConfig;
    return <PendingValue key={i} value={SITE_CONFIG[key]} locale={locale} kind={TOKEN_KIND[key]} />;
  });
}
