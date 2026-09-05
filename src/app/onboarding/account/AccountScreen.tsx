"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { createClient } from "@/lib/db/client";
import { authCallbackUrl } from "@/lib/auth/redirect";
import { useOnboardingGuard } from "@/lib/profile/onboarding";
import { useFunnelNav } from "@/lib/profile/funnel-nav";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

/**
 * Where the email and the "code is in your inbox" state survive a refresh.
 *
 * sessionStorage, not localStorage: it is scoped to this tab and dies with it, which is the
 * right lifetime for a half-finished sign-in. Before this, reloading the page while the code
 * was still in the inbox reset the screen to an empty email field, and the only way forward
 * was to type the address again and request a second code — which also invalidated the first.
 */
const ACCOUNT_STORAGE_KEY = "macote.account";

type AccountDraft = { email: string; status: "idle" | "sent" };

function readDraft(): AccountDraft | null {
  try {
    const raw = window.sessionStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { email, status } = parsed as { email?: unknown; status?: unknown };
    if (typeof email !== "string") return null;
    // A "sent" state only means something with an address a code can be resent to.
    const sent = status === "sent" && EMAIL_PATTERN.test(email.trim());
    return { email, status: sent ? "sent" : "idle" };
  } catch {
    // Storage blocked or corrupt: the student just types the address again.
    return null;
  }
}

function writeDraft(draft: AccountDraft) {
  try {
    window.sessionStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* storage blocked — the screen simply will not survive a refresh */
  }
}

function clearDraft() {
  try {
    window.sessionStorage.removeItem(ACCOUNT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function AccountScreen() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  // `funnelReturn` is `?next=` (set by src/proxy.ts on a bounced deep link, carried through
  // every step by hrefFor) or /dashboard. It goes into the email link AND the post-OTP
  // navigation so both paths land on the same page.
  const { hrefFor, funnelReturn } = useFunnelNav();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  /** The provider's own words. A generic "try again" hides rate limits and misconfiguration. */
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  /** The emailed code (6 to 10 digits) — the path that works when the link cannot. */
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  // The whole funnel must be behind them: this is where the local profile is attached
  // to a real user, so a half-built one would persist gaps that are hard to spot later.
  useOnboardingGuard("account");

  // src/app/auth/callback/route.ts sends an expired or already-used magic link back here with
  // ?error=link. Say so, rather than showing a blank sign-up form to someone who just tapped
  // a link and expected to be signed in.
  const linkExpired = searchParams.get("error") === "link";

  // Restore the draft (email + whether a code is already in the inbox) after a refresh.
  useEffect(() => {
    const draft = readDraft();
    if (!draft) return;
    // One-time sessionStorage read on mount, not a subscription to an external store.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEmail(draft.email);
    if (draft.status === "sent") setStatus("sent");
  }, []);

  // Fix backtrack bug: when user swipes back or returns from OAuth redirect / bfcache,
  // ensure the status immediately resets from "sending" to "idle" so buttons are never stuck.
  // Only "sending" is reset: pageshow also fires on the initial load, so a blanket reset would
  // wipe the "sent" state restored from sessionStorage a moment earlier.
  useEffect(() => {
    const unstick = () => {
      setStatus((prev) => (prev === "sending" ? "idle" : prev));
    };

    const handlePageShow = () => {
      unstick();
      setVerifying(false);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") unstick();
    };

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", unstick);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", unstick);
    };
  }, []);

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

      const send = supabase.auth.signInWithOtp({
        email: email.trim(),
        // Not window.location.origin: inside the native shell that is localhost, which no
        // mail client can reach. See src/lib/auth/redirect.ts.
        options: { emailRedirectTo: authCallbackUrl(funnelReturn) },
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
      writeDraft({ email, status: "sent" });
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

      // Signed in: the draft has done its job, and must not greet a later visitor to this tab
      // with someone else's address in the "sent" state.
      clearDraft();

      // Session is live in this client. Hard-navigate rather than router.push so the proxy
      // re-runs with the new cookie and the app boots as a signed-in student.
      window.location.assign(funnelReturn);
    } catch (cause) {
      setErrorDetail(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setVerifying(false);
    }
  }

  function changeEmail() {
    setStatus("idle");
    setCode("");
    setErrorDetail(null);
    writeDraft({ email, status: "idle" });
  }

  const linkExpiredAlert = linkExpired && (
    <p
      role="alert"
      className="mb-4 rounded border border-ember/30 bg-paper px-4 py-3 text-[13px] leading-relaxed text-ember"
    >
      {t("account.linkExpired")}
    </p>
  );

  if (status === "sent") {
    return (
      <ScreenShell backHref={hrefFor("/onboarding/goal")} step="account">
        <ScreenHeading
          title={t("account.checkEmailTitle")}
          body={t("account.checkEmailBody").replace("{email}", email.trim())}
        />

        {linkExpiredAlert}

        {/* The code, not the link, is the primary path here. In the native shell the link
            physically cannot complete sign-in — it opens the system browser, which lacks the
            PKCE verifier this client holds — so leading with it would send most students down
            the one route that fails. */}
        {/* A form, so Enter submits and the keyboard shows "go"; the code field takes focus
            on arrival so iOS offers the mailed code without a tap. */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void verifyCode();
          }}
          noValidate
        >
        <label
          htmlFor="otp-input"
          className="field-shell mt-6 flex cursor-text flex-col gap-1 rounded border border-ink/15 bg-paper px-4 py-3 transition-colors focus-within:border-[1.5px] focus-within:border-ultramarine"
        >
          <span className="text-[11px] font-medium text-ink/50">{t("account.codeLabel")}</span>
          <input
            id="otp-input"
            name="otp"
            autoFocus
            value={code}
            onChange={(e) => {
              setCode(digitsOf(e.target.value).slice(0, OTP_MAX_LENGTH));
              if (errorDetail) setErrorDetail(null);
            }}
            inputMode="numeric"
            enterKeyHint="go"
            autoComplete="one-time-code"
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
          type="submit"
          disabled={digitsOf(code).length < OTP_MIN_LENGTH || verifying}
          className="mt-3 flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          {verifying ? t("account.verifying") : t("account.verify")}
        </button>
        </form>

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
            onClick={changeEmail}
            className="flex h-12 w-full items-center justify-center rounded-full text-[14px] font-semibold text-ink/60"
          >
            {t("account.changeEmail")}
          </button>
        </div>
      </ScreenShell>
    );
  }

  async function signInWithOAuth(provider: "google") {
    setStatus("sending");
    setErrorDetail(null);

    // Safety timeout: if OAuth doesn't navigate away within 8 seconds, unlock the button
    const safetyTimer = setTimeout(() => {
      setStatus((prev) => (prev === "sending" ? "idle" : prev));
    }, 8000);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: authCallbackUrl(funnelReturn),
        },
      });
      if (error) {
        clearTimeout(safetyTimer);
        setStatus("error");
        setErrorDetail(error.message);
      }
    } catch (cause) {
      clearTimeout(safetyTimer);
      setStatus("error");
      setErrorDetail(
        cause instanceof Error ? cause.message : String(cause),
      );
    }
  }

  return (
    <ScreenShell backHref={hrefFor("/onboarding/goal")} step="account">
      <ScreenHeading title={t("account.title")} body={t("account.body")} />

      {linkExpiredAlert}

      {/*
        Google only. Sign in with Apple needs a paid Apple Developer account, which this
        product does not have, so an Apple button could never do anything but error. It was
        removed rather than left disabled: a sign-in option that cannot sign anyone in is worse
        than one fewer option.

        If a native iOS build ever happens, App Store guideline 4.8 makes Sign in with Apple
        mandatory alongside any other third-party sign-in — so shipping natively means buying
        the account and restoring this, not shipping Google alone.
      */}
      <div className="flex flex-col gap-2.5">
        {/* Google Button */}
        <button
          type="button"
          onClick={() => void signInWithOAuth("google")}
          disabled={status === "sending"}
          className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-full border border-ink/15 bg-paper text-[15px] font-semibold text-ink shadow-card tap-spring hover:bg-chalk/30 active:scale-[0.98] disabled:opacity-40"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {t("account.continueWithGoogle")}
        </button>
      </div>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-ink/15" />
        <span className="text-[12px] font-medium text-ink/45">{t("account.orWithEmail")}</span>
        <div className="h-px flex-1 bg-ink/15" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        noValidate
      >
      <label
        htmlFor="email-input"
        className="field-shell flex cursor-text flex-col gap-1 rounded border border-ink/15 bg-paper px-4 py-3 transition-colors focus-within:border-[1.5px] focus-within:border-ultramarine"
      >
        <span className="text-[11px] font-medium text-ink/50">{t("account.email")}</span>
        <input
          id="email-input"
          name="email"
          type="email"
          inputMode="email"
          enterKeyHint="send"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
            writeDraft({ email: e.target.value, status: "idle" });
          }}
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
        type="submit"
        disabled={!isValid || status === "sending"}
        className="mt-4 flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card tap-spring active:scale-[0.98] disabled:opacity-40"
      >
        {status === "sending" ? t("account.sending") : t("account.create")}
      </button>
      </form>

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
