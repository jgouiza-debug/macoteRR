import { mt } from "@/lib/i18n/marketing-copy";
import type { Locale } from "@/lib/i18n/dictionary";

/**
 * The one skip-to-content link. Every marketing page used to carry its own copy of the same
 * six-line anchor, and the focused pill measured ~36px — under the 44px target floor.
 */
export function SkipLink({ locale }: { locale: Locale }) {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:inline-flex focus:min-h-[48px] focus:items-center focus:rounded-full focus:bg-ultramarine focus:px-5 focus:text-paper"
    >
      {mt(locale, "mkt.skipToContent")}
    </a>
  );
}
