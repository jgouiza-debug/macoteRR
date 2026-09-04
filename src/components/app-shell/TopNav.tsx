"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronLeft } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { LangToggle } from "@/components/ui/LangToggle";
import { NotificationInboxSheet } from "@/components/notifications/NotificationInboxSheet";
import { useInbox } from "@/lib/notifications/inbox";
import { NAV_ITEMS } from "./nav-items";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function TopNav({
  rScore,
  currentSession = null,
  backHref,
}: {
  rScore?: number | null;
  rScoreStatus?: "confirmed" | "estimated" | null;
  currentSession?: number | null;
  backHref?: string;
}) {
  const pathname = usePathname();
  const { unread } = useInbox();
  const [inboxOpen, setInboxOpen] = useState(false);
  const { t } = useLocale();
  const hasScore = rScore !== undefined && rScore !== null;

  return (
    <header className="fixed top-0 z-50 w-full border-b border-ink/10 bg-shell pt-safe">
      <div className="mx-auto flex h-12 w-full max-w-[1200px] items-center justify-between gap-3 px-4 md:px-8">
        {backHref ? (
          <Link
            href={backHref}
            aria-label={t("common.back")}
            className="-ml-2 flex min-h-[48px] min-w-[48px] items-center gap-1 rounded-full pl-1 pr-2 text-ink transition-colors active:bg-ink/10"
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
          {/* The score lives on the dashboard, not in the top bar. First-session students with no
              score yet still get one honest chip, so an empty session never reads as a missing figure. */}
          {!hasScore && currentSession === 1 ? (
            <span className="rounded-full bg-ink/8 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-ink/60">
              {t("nav.firstSession")}
            </span>
          ) : null}

          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={inboxOpen}
            aria-label={unread > 0 ? t("nav.inboxUnread").replace("{n}", String(unread)) : t("nav.inbox")}
            onClick={() => setInboxOpen(true)}
            className="relative flex min-h-[48px] min-w-[48px] items-center justify-center text-ink"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 bg-paper transition-colors active:bg-ink/10">
              <Bell className="h-5 w-5" aria-hidden="true" />
            </span>
            {unread > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-1.5 top-1.5 h-4 min-w-[16px] rounded-full bg-ember px-1 text-[10px] font-bold leading-4 text-paper tabular-nums"
              >
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>

          <LangToggle />
        </div>
      </div>
      <NotificationInboxSheet open={inboxOpen} onClose={() => setInboxOpen(false)} />
    </header>
  );
}
