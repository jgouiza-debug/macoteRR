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
      <p className="text-[11px] leading-relaxed text-ink/50">{t("dash.unofficial")}</p>
      <div className="mt-3 flex justify-center gap-5 text-[11px] font-medium text-ink/50">
        <Link href="/mentions-legales" className="underline-offset-2 hover:underline">
          {t("dash.legal")}
        </Link>
        <Link href="/methodologie-sources" className="underline-offset-2 hover:underline">
          {t("dash.methodology")}
        </Link>
      </div>
    </footer>
  );
}
