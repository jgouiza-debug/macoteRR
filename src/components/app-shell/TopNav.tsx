"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { LangToggle } from "@/components/ui/LangToggle";
import { NAV_ITEMS } from "./nav-items";
import { useFormat } from "@/lib/i18n/useFormat";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function TopNav({
  rScore,
  rScoreStatus = null,
  currentSession = null,
  backHref,
}: {
  rScore?: number | null;
  rScoreStatus?: "confirmed" | "estimated" | null;
  currentSession?: number | null;
  backHref?: string;
}) {
  const pathname = usePathname();
  const { t } = useLocale();
  const f = useFormat();
  const hasScore = rScore !== undefined && rScore !== null;

  return (
    <header className="fixed top-0 z-50 w-full border-b border-ink/10 bg-shell pt-safe">
      <div className="mx-auto flex h-10 w-full max-w-[1200px] items-center justify-between gap-3 px-4 md:px-8">
        {backHref ? (
          <Link
            href={backHref}
            aria-label={t("common.back")}
            className="-ml-2 -my-1 flex min-h-[48px] min-w-[48px] items-center gap-1 rounded-full pl-1 pr-2 text-ink transition-colors active:bg-ink/10"
          >
            <ChevronLeft className="h-5 w-5" />
            <LogoMark size={16} />
          </Link>
        ) : (
          <Link href="/dashboard" className="flex items-center gap-2">
            <LogoMark size={18} />
            <span className="font-display text-[15px] font-bold tracking-tight text-ultramarine">
              MaCote
            </span>
          </Link>
        )}

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold uppercase tracking-wide transition-colors ${
                  active ? "text-ultramarine" : "text-secondary hover:bg-chalk"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {/* The score chip only exists when there is a score. "R : ??" told every first-session
              student, on every page, that something was missing — it was the app that had
              nothing to say. A first session gets its own honest chip instead. */}
          {hasScore ? (
            <span
              className={`text-[13.5px] font-extrabold tracking-tight tabular-nums ${
                rScoreStatus === "estimated" ? "text-moss" : "text-ultramarine"
              }`}
              aria-label={rScoreStatus === "estimated" ? t("dash.estimateTitle") : t("dash.confirmedTitle")}
            >
              {rScoreStatus === "estimated" && "≈ "}R : {f.score(rScore)}
            </span>
          ) : currentSession === 1 ? (
            <span className="rounded-full bg-ink/8 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-ink/60">
              {t("nav.firstSession")}
            </span>
          ) : null}
          <LangToggle />
        </div>
      </div>
    </header>
  );
}
