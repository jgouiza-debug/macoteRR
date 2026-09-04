"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFormat } from "@/lib/i18n/useFormat";
import { formatDate } from "@/lib/format";
import { DICTIONARY, type Locale } from "@/lib/i18n/dictionary";

/** "admission.ulaval.ca" for a source URL; null when the URL does not parse. */
export function sourceHost(href: string): string | null {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Guardrail #1 (docs/00-BUILD-PROMPT.md): no figure ships without a source and a
 * verification date. Render this next to every number sourced from collected data.
 * `date` is an ISO string; formatting happens per locale at render time.
 *
 * `locale` forces the stamp's language (the counselor sheet is French on paper whatever the
 * UI locale). `hostAsLabel` prints the source's host name instead of the word "source", so a
 * printed page still says where a number came from once the link is dead ink.
 */
export function SourceStamp({
  date,
  href,
  label,
  className = "",
  locale,
  hostAsLabel = true,
}: {
  date: string;
  href?: string;
  label?: string;
  className?: string;
  locale?: Locale;
  hostAsLabel?: boolean;
}) {
  const { t } = useLocale();
  const f = useFormat();
  const verifiedOn = locale ? DICTIONARY[locale]["common.verifiedOn"] : t("common.verifiedOn");
  const when = locale ? formatDate(date, locale) : f.date(date);
  const fallback = locale ? DICTIONARY[locale]["common.source"] : t("common.source");
  const text = label ?? (hostAsLabel && href ? sourceHost(href) : null) ?? fallback;

  return (
    <p className={`text-[11px] leading-relaxed text-ink/45 ${className}`}>
      {verifiedOn} {when}
      {href && (
        <>
          {" · "}
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="-my-[6px] inline-flex min-h-[44px] items-center py-[6px] align-middle"
          >
            <span className="inline-flex min-h-[32px] items-center rounded-md border border-ink/15 px-2 text-[11.5px] leading-4 text-ink/60 hover:border-ink/40 hover:text-ink"
          >
            {text}
            </span>
          </a>
        </>
      )}
    </p>
  );
}
