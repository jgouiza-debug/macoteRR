"use client";

import { useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { ChevronRight, TriangleAlert } from "lucide-react";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { Sheet } from "@/components/ui/Sheet";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useStudentProfile } from "@/lib/profile/store";
import { useOnboardingGuard } from "@/lib/profile/onboarding";
import { useFunnelNav } from "@/lib/profile/funnel-nav";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { SESSIONS } from "@/lib/sample-data";

const SESSION_PROMPT_ID = "session-prompt";

/**
 * Step 3 of the funnel: does the student know their cote R?
 *
 * The session chip is local state only. It used to write to the profile on every tap, which
 * meant a student who poked at the chips and then left had a session on record they never
 * confirmed. Now the session is persisted with the path that needs it — "Oui" and the
 * estimator both save it as they leave; "Je commence" resets it to 1 on its own screen.
 */
export function ScoreScreen() {
  const { t } = useLocale();
  const { profile, update, sync } = useStudentProfile();
  const { hrefFor, goTo } = useFunnelNav();
  const hydrated = useHydrated();
  // "Help me estimate it" does not go straight to the estimator: an estimate is the one
  // number in this product that cannot be sourced, so the student reads why before they see
  // a figure they might otherwise take as fact.
  const [warningOpen, setWarningOpen] = useState(false);
  /** The chip just tapped; null until then, so the highlight falls back to the saved session. */
  const [tapped, setTapped] = useState<number | null>(null);
  /** A path was tapped before a session was picked: the prompt turns ember and takes focus. */
  const [needSession, setNeedSession] = useState(false);

  // Needs a cégep and a DEC before a score means anything.
  useOnboardingGuard("score");

  // The store's hydration snapshot is the empty profile, and a signed-in student's first
  // reconcile may still be pulling the server copy. Until both settle, `profile.currentSession`
  // is not the student's real answer, so the chips show a skeleton and the three paths — each
  // of which reads the session on the way out — wait. Hooks all sit above this.
  const ready = hydrated && sync !== "syncing";
  // null until the student picks one: nothing is chosen on their behalf.
  const currentSession = tapped ?? profile.currentSession;

  function askForSession() {
    setNeedSession(true);
    document.querySelector<HTMLElement>(`[data-session="1"]`)?.focus();
  }

  function leaveForConfirm() {
    if (currentSession === null) return askForSession();
    setWarningOpen(false);
    update({ currentSession });
    goTo("/onboarding/score/confirm");
  }

  function leaveForEstimate() {
    if (currentSession === null) return askForSession();
    setWarningOpen(false);
    update({ currentSession });
    goTo("/onboarding/score/estimate");
  }

  function leaveForStarting() {
    goTo("/onboarding/score/starting");
  }

  // Radiogroup keyboard contract: arrows move the checked chip (and focus) within the group.
  function handleChipKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const delta =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (delta === 0) return;
    event.preventDefault();
    const index = SESSIONS.findIndex((s) => s.id === currentSession);
    const next = SESSIONS[(index + delta + SESSIONS.length) % SESSIONS.length];
    setTapped(next.id);
    event.currentTarget.querySelector<HTMLElement>(`[data-session="${next.id}"]`)?.focus();
  }

  const chipLabel = (n: number) => t("bif.sessionChip").replace("{n}", String(n));

  return (
    <ScreenShell backHref={hrefFor("/onboarding/program")} step="score">
      <ScreenHeading title={t("bif.title")} body={t("bif.body")} />

      {/* Session selector */}
      <div className="mb-5 flex flex-col gap-2">
        <p id={SESSION_PROMPT_ID} className="text-[12px] font-semibold uppercase tracking-wider text-ink/50">
          {t("bif.sessionPrompt")}
        </p>
        {ready ? (
          <div
            role="radiogroup"
            aria-labelledby={SESSION_PROMPT_ID}
            onKeyDown={handleChipKeyDown}
            className="grid grid-cols-3 gap-2.5 sm:grid-cols-6"
          >
            {SESSIONS.map((s) => {
              const isSelected = currentSession === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  data-session={s.id}
                  onClick={() => setTapped(s.id)}
                  className={`flex min-h-[48px] items-center justify-center rounded-full border text-[12.5px] font-semibold transition-all active:scale-[0.97] ${
                    isSelected
                      ? "border-ultramarine bg-ultramarine text-paper shadow-sm"
                      : "border-ink/15 bg-paper text-ink/70 hover:border-ink/30"
                  }`}
                >
                  {chipLabel(s.id)}
                </button>
              );
            })}
          </div>
        ) : null}
        {ready && currentSession === null && (
          <p aria-live="polite" className={`text-[12px] ${needSession ? "font-semibold text-ember" : "text-ink/50"}`}>
            {t("bif.pickSessionFirst")}
          </p>
        )}
        {!ready && (
          <div aria-hidden className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
            {SESSIONS.map((s) => (
              <div key={s.id} className="min-h-[48px] animate-pulse rounded-full bg-ink/[0.06]" />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={leaveForConfirm}
          disabled={!ready}
          // The one solid row: three differently dressed rows read as three recommendations.
          className="flex min-h-[58px] items-center justify-between gap-3 rounded-xl bg-ultramarine px-4 py-3 text-left text-[14.5px] font-semibold text-paper shadow-card transition-transform active:scale-[0.99] disabled:opacity-40"
        >
          {t("bif.yes")}
          <ChevronRight className="h-5 w-5 flex-shrink-0" aria-hidden />
        </button>

        <button
          type="button"
          onClick={() => (currentSession === null ? askForSession() : setWarningOpen(true))}
          disabled={!ready}
          className="flex min-h-[58px] items-center justify-between gap-3 rounded-xl border border-ink/15 bg-paper px-4 py-3 text-left text-ink transition-transform active:scale-[0.99] disabled:opacity-40"
        >
          <span className="block">
            <span className="block text-[14.5px] font-semibold">{t("bif.no")}</span>
            {/* GUARDRAIL #2, one line early: the student knows what an estimate is before choosing it. */}
            <span className="block text-[12px] font-normal text-ink/60">{t("bif.estimateSub")}</span>
          </span>
          <ChevronRight className="h-5 w-5 flex-shrink-0 text-ink/40" aria-hidden />
        </button>

        <button
          type="button"
          onClick={leaveForStarting}
          disabled={!ready}
          className="flex min-h-[58px] items-center justify-between gap-3 rounded-xl border border-ink/15 bg-paper px-4 py-3 text-left text-ink transition-transform active:scale-[0.99] disabled:opacity-40"
        >
          <span className="block">
            <span className="block text-[14.5px] font-semibold">
              {t("bif.startingCegep")}
            </span>
            <span className="block text-[12px] font-normal text-ink/60">
              {t("bif.startingCegepSub")}
            </span>
          </span>
          <ChevronRight className="h-5 w-5 flex-shrink-0 text-ink/40" aria-hidden />
        </button>
      </div>

      <Sheet
        open={warningOpen}
        onClose={() => setWarningOpen(false)}
        title={t("warn.estTitle")}
        footer={
          <>
            <button
              type="button"
              onClick={leaveForEstimate}
              className="flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98]"
            >
              {t("warn.estCta")}
            </button>
            <button
              type="button"
              onClick={leaveForConfirm}
              className="flex h-12 w-full items-center justify-center rounded-full text-[14px] font-semibold text-ink/60"
            >
              {t("warn.estBack")}
            </button>
          </>
        }
      >
        <div className="flex items-start gap-3 rounded bg-ember/[0.08] p-3.5">
          <TriangleAlert className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-ember" aria-hidden />
          <p className="text-[13.5px] leading-relaxed text-ink/80">{t("warn.estBody")}</p>
        </div>
        <p className="mt-3.5 text-[13.5px] leading-relaxed text-ink/65">{t("warn.estBody2")}</p>
      </Sheet>

      {/* /programs is public: this is an exit from the funnel, not a step in it. */}
      <div className="flex justify-center pt-6">
        <Link
          href="/programs"
          // A text link, not a fourth pill: it leaves the funnel and should look subordinate.
          className="inline-flex min-h-[48px] items-center px-3 text-center text-[13.5px] font-semibold leading-snug text-ultramarine underline underline-offset-2 hover:text-pressed"
        >
          {t("bif.justSeuils")}
        </Link>
      </div>
    </ScreenShell>
  );
}
