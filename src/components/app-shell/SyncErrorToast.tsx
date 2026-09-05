"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { subscribeProfileError } from "@/lib/profile/store";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const AUTO_HIDE_MS = 8_000;

/**
 * The only subscriber to the profile store's error channel. Until it existed, a mutation that
 * failed five times was silently rolled back: the student's own edit vanished with no message,
 * which is the one outcome a local-first store must never produce.
 */
export function SyncErrorToast() {
  const { t } = useLocale();
  const [messageKey, setMessageKey] = useState<TranslationKey | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeProfileError((key) => setMessageKey(key));
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!messageKey) return;
    const timer = window.setTimeout(() => setMessageKey(null), AUTO_HIDE_MS);
    return () => window.clearTimeout(timer);
  }, [messageKey]);

  if (!messageKey) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-[70] mx-auto flex w-[calc(100%-2rem)] max-w-[420px] items-start gap-3 rounded-xl border border-ember/30 bg-paper px-4 py-3 shadow-overlay md:bottom-6"
    >
      <p className="flex-1 text-[13px] leading-relaxed text-ink">{t(messageKey)}</p>
      <button
        type="button"
        onClick={() => setMessageKey(null)}
        aria-label={t("common.close")}
        className="-mr-3 -mt-2 flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center rounded-full text-ink/50 active:bg-ink/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
