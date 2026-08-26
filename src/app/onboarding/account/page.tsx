"use client";

import { useState } from "react";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { createClient } from "@/lib/db/client";
import { authCallbackUrl } from "@/lib/auth/redirect";
import { useOnboardingGuard } from "@/lib/profile/onboarding";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Where to land after sign-in: whatever the proxy asked for, else the dashboard. */
function nextPath(): string {
  const requested = new URLSearchParams(window.location.search).get("next");
  return requested?.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";
}

/** Supabase's own timeout is generous; a student staring at a spinner is not that patient. */
const SEND_TIMEOUT_MS = 15_000;

/**
 * Supabase's email OTP length is a project setting, not a constant — Auth → Providers → Email
 * exposes it and it ranges 6 to 10. Hardcoding 6 truncated longer codes on the way in and made
 * every verification fail with a token the student had copied correctly.
 */
const OTP_MIN_LENGTH = 6;
const OTP_MAX_LENGTH = 10;

const digitsOf = (value: string) => value.replace(/\D/g, "");

export default function AccountPage() {
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  /** The provider's own words. A generic "try again" hides rate limits and misconfiguration. */
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  /** The 6-digit code from the email — the path that works when the link cannot. */
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  // The whole funnel must be behind them: this is where the local profile is attached
  // to a real user, so a half-built one would persist gaps that are hard to spot later.
  useOnboardingGuard("account");

  const isValid = EMAIL_PATTERN.test(email.trim());

  async function submit() {
    if (!isValid || status === "sending") return;

    setStatus("sending");
    setErrorDetail(null);

    // Everything from here runs inside try/finally. This used to be bare `await`s: any throw
    // — `createClient()` hitting a missing NEXT_PUBLIC_SUPABASE_* var, a blocked fetch, a
    // rejected promise — skipped the setStatus below and left the button reading "Envoi…"
    // with no way forward and nothing on screen explaining why.
    try {
      const supabase = createClient();

      // src/proxy.ts appends ?next= when it bounces someone off a gated route, so a student
      // who deep-linked to /bursaries lands back there instead of the dashboard.
      const requested = new URLSearchParams(window.location.search).get("next");

      const send = supabase.auth.signInWithOtp({
        email: email.trim(),
        // Not window.location.origin: inside the native shell that is localhost, which no
        // mail client can reach. See src/lib/auth/redirect.ts.
        options: { emailRedirectTo: authCallbackUrl(requested ?? "/dashboard") },
      });

      // A hung request is indistinguishable from a slow one from the outside, so cap it
      // rather than leaving the student with a spinner that never resolves.
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), SEND_TIMEOUT_MS),
      );

      const { error } = await Promise.race([send, timeout]);

      if (error) {
        setStatus("error");
        setErrorDetail(error.message);
        return;
      }

      setStatus("sent");
    } catch (cause) {
      setStatus("error");
      setErrorDetail(
        cause instanceof Error && cause.message === "timeout"
          ? t("account.sendTimeout")
          : cause instanceof Error
            ? cause.message
            : String(cause),
      );
    }
  }

  /**
   * Completes sign-in with the emailed code instead of the link.
   *
   * This exists because the link cannot work from the native shell. Supabase's PKCE flow
   * stores a code verifier in the client that STARTED the sign-in; the emailed link opens in
   * the system browser, which has no such verifier, so the exchange fails there and the app —
   * a separate WebView with its own storage — never learns anything happened. The student ends
   * up signed in nowhere, having been bounced back through onboarding in a browser that has
   * none of their answers.
   *
   * A typed code has no such hand-off: verification happens in the very client that asked for
   * it, so the session lands where the student actually is. Deep links would also fix this and
   * are worth doing later, but they need domain-association files and native config; this
   * works today and on every platform.
   */
  async function verifyCode() {
    const token = digitsOf(code);
    if (token.length < OTP_MIN_LENGTH || verifying) return;

    setVerifying(true);
    setErrorDetail(null);

    try {
      const supabase = createClient();

      // "email" covers the signup confirmation a first-time address gets; "magiclink" covers a
      // returning one. Which template Supabase sent depends on whether the account already
      // existed, and the client cannot know that, so try both rather than guess.
      let result = await supabase.auth.verifyOtp({ email: email.trim(), token, type: "email" });
      if (result.error) {
        result = await supabase.auth.verifyOtp({ email: email.trim(), token, type: "magiclink" });
      }

      if (result.error) {
        setErrorDetail(result.error.message);
        return;
      }

      // Session is live in this client. Hard-navigate rather than router.push so the proxy
      // re-runs with the new cookie and the app boots as a signed-in student.
      window.location.assign(nextPath());
    } catch (cause) {
      setErrorDetail(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setVerifying(false);
    }
  }

  if (status === "sent") {
    return (
      <ScreenShell backHref="/onboarding/goal">
        <ScreenHeading
          title={t("account.checkEmailTitle")}
          body={t("account.checkEmailBody").replace("{email}", email.trim())}
        />

        {/* The code, not the link, is the primary path here. In the native shell the link
            physically cannot complete sign-in — it opens the system browser, which lacks the
            PKCE verifier this client holds — so leading with it would send most students down
            the one route that fails. */}
        <label
          htmlFor="otp-input"
          className="field-shell mt-6 flex cursor-text flex-col gap-1 rounded border border-ink/15 bg-paper px-4 py-3 transition-colors focus-within:border-[1.5px] focus-within:border-ultramarine"
        >
          <span className="text-[11px] font-medium text-ink/50">{t("account.codeLabel")}</span>
          <input
            id="otp-input"
            value={code}
            onChange={(e) => {
              setCode(digitsOf(e.target.value).slice(0, OTP_MAX_LENGTH));
              if (errorDetail) setErrorDetail(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && void verifyCode()}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••••"
            maxLength={OTP_MAX_LENGTH}
            aria-describedby="otp-error"
            className="w-full bg-transparent font-display text-[28px] font-bold tracking-[0.18em] text-ink outline-none placeholder:text-ink/20 tabular-nums"
          />
        </label>

        {errorDetail && (
          <p id="otp-error" role="alert" className="mt-2 text-[12.5px] text-ember">
            {errorDetail}
          </p>
        )}

        <button
          type="button"
          onClick={() => void verifyCode()}
          disabled={digitsOf(code).length < OTP_MIN_LENGTH || verifying}
          className="mt-3 flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          {verifying ? t("account.verifying") : t("account.verify")}
        </button>

        <div className="mt-5 flex flex-col gap-2.5">
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
    <ScreenShell backHref="/onboarding/goal">
      <ScreenHeading title={t("account.title")} body={t("account.body")} />

      <label
        htmlFor="email-input"
        className="field-shell flex cursor-text flex-col gap-1 rounded border border-ink/15 bg-paper px-4 py-3 transition-colors focus-within:border-[1.5px] focus-within:border-ultramarine"
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
          aria-describedby="email-error"
          className="w-full bg-transparent text-[16px] text-ink outline-none placeholder:text-ink/35"
        />
      </label>

      {status === "error" && (
        <p id="email-error" role="alert" className="mt-2 text-[12.5px] text-ember">
          {t("account.sendError")}
          {errorDetail && <span className="mt-0.5 block text-ink/50">{errorDetail}</span>}
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

      {/* No "Later" escape any more. src/proxy.ts gates /dashboard, /programs, /bursaries,
          /profile and /counselor-prep on a session, so that button led straight into a
          redirect back to this screen — an offer the app could not honour. */}
      <p className="mt-4 text-center text-[12.5px] font-medium text-ink/60">
        {t("account.required")}
      </p>

      <p className="mt-6 text-center text-[12px] leading-relaxed text-ink/50">
        {t("account.noCard")}
      </p>
      <p className="mt-2 text-center text-[12px] leading-relaxed text-ink/50">
        {t("account.noPassword")}
      </p>
    </ScreenShell>
  );
}
