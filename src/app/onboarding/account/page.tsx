"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AccountPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [email, setEmail] = useState("");

  const isValid = EMAIL_PATTERN.test(email.trim());

  // TODO(phase-2): swap for supabase.auth.signInWithOtp once a project is linked
  // (docs/SETUP-CLOUD.md). Until then this mirrors the rest of the sample-data prototype.
  function submit() {
    if (!isValid) return;
    router.push("/dashboard");
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

      <button
        type="button"
        onClick={submit}
        disabled={!isValid}
        className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98] disabled:opacity-40"
      >
        {t("account.create")}
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

      <p className="mt-auto py-8 text-center text-[13px] text-ink/60">
        {t("account.haveAccount")}{" "}
        <Link href="/dashboard" className="font-semibold text-ultramarine">
          {t("account.signIn")}
        </Link>
      </p>
    </ScreenShell>
  );
}
