"use client";

import { useState } from "react";
import { MailCheck, ShieldCheck } from "lucide-react";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { StepProgress } from "@/components/onboarding/StepProgress";
import { createClient } from "@/lib/db/client";
import { findCegep, findCegepProgram } from "@/lib/data/catalog";
import { useStudentProfile } from "@/lib/profile/store";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFormat } from "@/lib/i18n/useFormat";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Step 5, and the funnel's only hard gate. There is no "Later" here any more: the profile
 * built over the previous four steps lives in localStorage until a session exists to attach
 * it to, and src/proxy.ts refuses the app's routes without one.
 *
 * Passwordless by design — a magic link is one fewer secret for a seventeen-year-old to
 * reuse from another site, and the account exists to persist a cote R, not to guard anything
 * sensitive (guardrail #3: no financial data is collected anywhere in this product).
 */
export default function AccountPage() {
  const { t, locale } = useLocale();
  const f = useFormat();
  const { profile } = useStudentProfile();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isValid = EMAIL_PATTERN.test(email.trim());

  const cegep = findCegep(profile.cegepId);
  const program = findCegepProgram(profile.cegepProgramId);

  const recap = [
    cegep && { label: t("prof.cegep"), value: cegep.name },
    program && { label: t("prof.program"), value: program.name },
    profile.rScore !== null && {
      label: t("entry.label"),
      value: `${profile.rScoreStatus === "estimated" ? "≈ " : ""}${f.score(profile.rScore)}`,
    },
    profile.targetUniversityProgramIds.length > 0 && {
      label: locale === "fr" ? "Cibles" : "Targets",
      value: String(profile.targetUniversityProgramIds.length),
    },
  ].filter(Boolean) as { label: string; value: string }[];

  async function submit() {
    if (!isValid || status === "sending") return;

    setStatus("sending");
    setErrorMessage(null);

    // src/proxy.ts appends `?next=` when it bounces someone off a protected route, so a
    // student who deep-linked to /bursaries lands back there instead of the dashboard. Read
    // it off the URL rather than via useSearchParams, which would force this whole screen to
    // opt out of static rendering for one query parameter.
    const requestedNext = new URLSearchParams(window.location.search).get("next");
    const next = requestedNext?.startsWith("/") ? requestedNext : "/dashboard";

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        // The link has to come back through the code-exchange route, which is what actually
        // sets the session cookie the proxy reads.
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <ScreenShell backHref="/onboarding/quiz">
        <StepProgress step="account" />

        <div className="flex flex-col items-center gap-4 pt-10 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ultramarine/10">
            <MailCheck className="h-7 w-7 text-ultramarine" />
          </span>
          <h1 className="font-display text-[25px] font-bold leading-[1.15] tracking-tight text-ink">
            {t("account.sentTitle")}
          </h1>
          <p className="max-w-[320px] text-[15px] leading-relaxed text-ink/60">
            {t("account.sentBody").replace("{email}", email.trim())}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => void submit()}
            className="flex h-12 w-full items-center justify-center rounded-full border border-ink/25 text-[14px] font-semibold text-ink transition-transform active:scale-[0.98]"
          >
            {t("account.resend")}
          </button>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="flex h-12 w-full items-center justify-center rounded-full text-[14px] font-semibold text-ink/60"
          >
            {t("account.changeEmail")}
          </button>
        </div>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell backHref="/onboarding/quiz">
      <StepProgress step="account" />
      <ScreenHeading title={t("account.title")} body={t("account.body")} />

      {recap.length > 0 && (
        <div className="mb-5 overflow-hidden rounded border border-ink/12 bg-paper">
          <p className="border-b border-ink/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-ink/45">
            {t("account.recapTitle")}
          </p>
          {recap.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 border-b border-ink/10 px-4 py-3 last:border-b-0"
            >
              <span className="text-[12px] font-semibold text-ink/50">{row.label}</span>
              <span className="wrap-fr text-right text-[13.5px] font-semibold text-ink">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      )}

      <label
        htmlFor="email-input"
        className="field-shell flex cursor-text flex-col gap-1 rounded border-[1.5px] border-ink/20 bg-paper px-4 py-3 transition-colors focus-within:border-ultramarine"
      >
        <span className="text-[11px] font-medium text-ink/50">{t("account.email")}</span>
        <input
          id="email-input"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          onKeyDown={(e) => e.key === "Enter" && void submit()}
          placeholder="jad@exemple.com"
          aria-invalid={status === "error"}
          aria-describedby="email-help"
          className="w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-ink/35 focus:outline-none focus-visible:outline-none"
        />
      </label>

      {status === "error" && (
        <p id="email-help" className="mt-2 text-[13px] font-medium text-ember">
          {errorMessage ?? t("account.error")}
        </p>
      )}

      <button
        type="button"
        onClick={() => void submit()}
        disabled={!isValid || status === "sending"}
        className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98] disabled:opacity-40"
      >
        {status === "sending" ? t("account.sending") : t("account.create")}
      </button>

      <div className="mt-5 flex items-start gap-3 rounded bg-ink/[0.04] p-3.5">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-ink/45" />
        <div className="flex flex-col gap-1">
          <p className="text-[12px] leading-relaxed text-ink/60">{t("account.noCard")}</p>
          <p className="text-[12px] leading-relaxed text-ink/60">{t("account.noPassword")}</p>
        </div>
      </div>

      <p className="mt-auto py-8 text-center text-[13px] text-ink/60">{t("account.required")}</p>
    </ScreenShell>
  );
}
