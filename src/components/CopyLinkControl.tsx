"use client";

import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { mt } from "@/lib/i18n/marketing-copy";
import type { Locale, TranslationKey } from "@/lib/i18n/dictionary";
import { SITE_URL, SITE_DOMAIN } from "@/lib/site-config";

interface CopyLinkControlProps {
  locale?: Locale;
  onContinueWithoutInstall?: () => void;
  showNoteCaption?: boolean;
}

export function CopyLinkControl({ locale, onContinueWithoutInstall, showNoteCaption = true }: CopyLinkControlProps) {
  const { t: contextT } = useLocale();
  const t = (key: TranslationKey) => (locale ? mt(locale, key) : contextT(key));
  const [copied, setCopied] = useState(false);
  const displayUrl = SITE_DOMAIN;
  const fullUrl = SITE_URL;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        // Fallback for environments without Clipboard API
        const input = document.createElement("input");
        input.value = fullUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error("Failed to copy link:", e);
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* URL Display Field with inline Copy Action */}
      <div className="w-full flex items-center justify-between px-3.5 py-3 rounded-[3px] border border-border bg-paper text-ink text-[15px] font-medium shadow-sm">
        <span className="truncate select-all text-ink font-mono text-[14px]">{displayUrl}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="text-ultramarine font-semibold text-[14px] hover:underline focus-visible:outline-none ml-2 shrink-0 min-h-[44px] inline-flex items-center active:scale-[0.98]"
        >
          {copied ? t("install.copied") : t("install.copyShort")}
        </button>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={handleCopy}
        className="w-full h-14 rounded-full bg-ultramarine hover:bg-pressed active:bg-pressed text-paper text-[16px] font-semibold tap-spring shadow-card flex items-center justify-center gap-2 focus-visible:outline-none"
      >
        {copied ? (
          <>
            <svg className="animate-pop-in" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="animate-pop-in">{t("install.copied")}</span>
          </>
        ) : (
          <span>{t("install.inAppButton")}</span>
        )}
      </button>

      {/* Secondary Action: Continue in browser without installing */}
      <a
        href="/app"
        onClick={(e) => {
          if (onContinueWithoutInstall) {
            e.preventDefault();
            onContinueWithoutInstall();
          }
        }}
        className="text-ultramarine font-semibold text-[15px] hover:underline transition-colors py-2 text-center focus-visible:outline-none min-h-[48px] inline-flex items-center justify-center active:scale-[0.99]"
      >
        {t("install.inAppSecondary")}
      </a>

      {/* Caption at bottom if in-app */}
      {showNoteCaption && (
        <p className="mt-6 text-[12px] leading-relaxed text-secondary text-left w-full border-t border-hairline pt-4">
          {t("install.inAppCardNote")}
        </p>
      )}
    </div>
  );
}
