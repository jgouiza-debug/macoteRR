"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFormat } from "@/lib/i18n/useFormat";

/**
 * Guardrail #1 (docs/00-BUILD-PROMPT.md): no figure ships without a source and a
 * verification date. Render this next to every number sourced from collected data.
 * `date` is an ISO string; formatting happens per locale at render time.
 */
export function SourceStamp({
  date,
  href,
  label,
  className = "",
}: {
  date: string;
  href?: string;
  label?: string;
  className?: string;
}) {
  const { t } = useLocale();
  const f = useFormat();

  return (
    <p className={`text-[11px] leading-relaxed text-ink/45 ${className}`}>
      {t("common.verifiedOn")} {f.date(date)}
      {href && (
        <>
          {" · "}
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="underline underline-offset-2 hover:text-ink"
          >
            {label ?? t("common.source")}
          </a>
        </>
      )}
    </p>
  );
}
