"use client";

import { useState } from "react";
import Link from "next/link";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { createClient } from "@/lib/db/client";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AccountPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const isValid = EMAIL_PATTERN.test(email.trim());

  async function submit() {
    if (!isValid || status === "sending") return;
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setStatus(error ? "error" : "sent");
  }

  if (status === "sent") {
    return (
      <ScreenShell backHref="/onboarding/cegep">
        <ScreenHeading
          title={t("account.checkEmailTitle")}
          body={t("account.checkEmailBody").replace("{email}", email.trim())}
        />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell backHref="/onboarding/cegep">
      <ScreenHeading title={t("account.title")} body={t("account.body")} />

      <label
        htmlFor="email-input"
        className="flex cursor-text flex-col gap-1 rounded border border-ink/15 bg-paper px-4 py-3 transition-colors focus-within:border-[1.5px] focus-within:border-ultramarine"
      >
        <span className="text-[11px] font-medium text-ink/50">{t("account.email")}</span>
        <input
          id="email-input"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="jad@exemple.com"
          className="w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-ink/35"
        />
      </label>

      {status === "error" && (
        <p className="mt-2 text-[12.5px] text-ember">{t("account.sendError")}</p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={!isValid || status === "sending"}
        className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98] disabled:opacity-40"
      >
        {status === "sending" ? t("account.sending") : t("account.create")}
      </button>

      <Link
        href="/dashboard"
        className="mt-3 flex h-14 w-full items-center justify-center rounded-full border border-ink/25 text-[15px] font-semibold text-ink transition-transform active:scale-[0.98]"
      >
        {t("account.later")}
      </Link>

      <p className="mt-6 text-center text-[12px] leading-relaxed text-ink/50">
        {t("account.noCard")}
      </p>
      <p className="mt-2 text-center text-[12px] leading-relaxed text-ink/50">
        {t("account.noPassword")}
      </p>
    </ScreenShell>
  );
}
