"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function Footer({ stackAboveBottomNav = false }: { stackAboveBottomNav?: boolean }) {
  const { t } = useLocale();

  return (
    <footer
      className={`mt-auto w-full border-t border-ink/10 bg-shell px-5 py-7 text-center ${
        stackAboveBottomNav ? "mb-16 md:mb-0" : ""
      }`}
    >
      <p className="mx-auto max-w-[62ch] text-[12px] leading-relaxed text-ink/65">{t("dash.unofficial")}</p>
      {/* 44px rows, underlined at rest: these were 12px text with no padding, and only looked
          like links on hover — which never fires on a phone. */}
      <div className="mt-2 flex flex-wrap justify-center gap-x-2 text-[13px] font-medium text-ink/75">
        <Link href="/mentions-legales" className="inline-flex min-h-[44px] items-center px-2 underline underline-offset-2 hover:text-ink">
          {t("dash.legal")}
        </Link>
        <Link href="/methodologie-sources" className="inline-flex min-h-[44px] items-center px-2 underline underline-offset-2 hover:text-ink">
          {t("dash.methodology")}
        </Link>
      </div>
    </footer>
  );
}
