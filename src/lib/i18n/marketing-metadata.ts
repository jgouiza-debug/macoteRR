import type { Metadata } from "next";
import { localeHref } from "./marketing-copy";
import type { Locale } from "./dictionary";

/**
 * Marketing page metaTitle strings already carry their own "| MaCote" branding —
 * the root layout's title template ("MaCote - %s") would double-brand them if used
 * as a plain string, so these go through `absolute` to bypass the template entirely.
 */
export function marketingMetadata({
  locale,
  title,
  description,
  path,
}: {
  locale: Locale;
  title: string;
  description: string;
  path: string; // fr path, e.g. "/cote-r"
}): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: localeHref(locale, path),
      languages: { fr: path, en: `/en${path}` },
    },
  };
}
