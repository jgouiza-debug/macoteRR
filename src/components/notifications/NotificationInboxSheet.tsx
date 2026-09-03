"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/Sheet";
import { EmptyState } from "@/components/ui/EmptyState";
import { SourceStamp } from "@/components/SourceStamp";
import { formatNotificationCopy } from "@/lib/notifications/service";
import { useInbox, markRead, refreshInbox } from "@/lib/notifications/inbox";
import { useStudentProfile } from "@/lib/profile/store";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/**
 * The notification inbox. Rows are built only from formatNotificationCopy over catalogue data,
 * so nothing ranks or recommends (guardrail #5); every row that carries a date or figure shows
 * its SourceStamp (guardrail #1). Tapping a row marks it read and follows its deep link.
 */
export function NotificationInboxSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const { items } = useInbox();
  const { sync } = useStudentProfile();

  // Reopening refreshes so day counts and other-device read marks are current.
  useEffect(() => {
    if (open) refreshInbox().catch(() => {});
  }, [open]);

  return (
    <Sheet open={open} onClose={onClose} title={t("inbox.title")}>
      {sync === "guest" && (
        <p className="mb-2 text-[12.5px] text-ink/55">{t("sync.guestNotice")}</p>
      )}

      {items.length === 0 ? (
        <EmptyState compact title={t("inbox.empty")} />
      ) : (
        <ul className="flex flex-col divide-y divide-ink/10 pb-[env(safe-area-inset-bottom)]">
          {items.map((item) => {
            const copy = formatNotificationCopy(item.category, item.payload, locale);
            const unread = item.readAt === null;
            const stampDate = typeof item.payload.lastVerifiedAt === "string" ? item.payload.lastVerifiedAt : null;
            const stampHref = typeof item.payload.sourceUrl === "string" ? item.payload.sourceUrl : undefined;
            return (
              <li key={item.dedupeKey} className="flex flex-col py-1">
                <a
                  href={item.deepLink}
                  onClick={(e) => {
                    e.preventDefault();
                    void markRead(item.dedupeKey);
                    onClose();
                    router.push(item.deepLink);
                  }}
                  className="flex min-h-[56px] items-start gap-3 py-2 tap-spring active:scale-[0.99]"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-[7px] h-2 w-2 flex-shrink-0 rounded-full ${unread ? "bg-ultramarine" : "bg-transparent"}`}
                  />
                  {unread && <span className="sr-only">{t("inbox.unread")}</span>}
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className={`text-[14px] ${unread ? "font-bold text-ink" : "font-semibold text-ink/75"}`}>
                      {copy.title}
                    </span>
                    <span className={`text-[13px] leading-snug ${unread ? "text-ink/80" : "text-ink/55"}`}>
                      {copy.body}
                    </span>
                  </span>
                </a>
                {stampDate && <SourceStamp date={stampDate} href={stampHref} className="pl-5 pb-2" />}
              </li>
            );
          })}
        </ul>
      )}
    </Sheet>
  );
}
