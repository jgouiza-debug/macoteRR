"use client";

import Link from "next/link";
import { Check, Info, SlidersHorizontal } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFormat } from "@/lib/i18n/useFormat";
import { ScoreValue } from "@/components/rscore/ScoreValue";
import { withFunnelParams } from "@/lib/profile/funnel-nav";

/**
 * Where both "Entrer ma cote R" and "Modifier" send the student: the score CHOOSER, not the
 * confirm form. A first-session student has no official figure yet and needs the "help me
 * estimate it" branch that only the chooser offers. ?edit=1 gets a signed-in student past the
 * funnel guard; ?next brings them straight back here once the step is done.
 */
export const SCORE_EDIT_HREF = withFunnelParams("/onboarding/score", {
  edit: true,
  next: "/dashboard",
});

/** The card's secondary actions: real pills, so a 48px target looks like one. */
const PILL =
  "inline-flex min-h-[48px] items-center gap-1.5 rounded-full border border-ink/15 bg-paper px-4 text-[12.5px] font-semibold text-ultramarine tap-spring hover:bg-chalk";

/**
 * The hero card: the student's R-score, or the "pending" placeholder for a first-session
 * student who has none yet.
 *
 * GUARDRAIL #2: an estimate renders with a leading "≈ ", a dashed border and the ESTIMATION
 * badge; a confirmed score never does. GUARDRAIL #1 for the student's own figure: the card says
 * where the number came from (the cégep, or the student's grades), which session it belongs
 * to, and when the student entered it. Nothing here may blur those lines.
 */
export function ScoreCard({
  rScore,
  rScoreStatus,
  cegepName,
  cegepProgramName,
  sessionLabel = null,
  enteredOn = null,
  onOpenBands,
  canWhatIf = false,
  onOpenWhatIf,
}: {
  rScore: number | null;
  rScoreStatus: "confirmed" | "estimated" | null;
  cegepName: string | null;
  cegepProgramName: string | null;
  /** "3e session": the session the score is recorded for, in the UI locale. */
  sessionLabel?: string | null;
  /** ISO date the student last entered or changed the score (profile.rScoreUpdatedAt). */
  enteredOn?: string | null;
  onOpenBands: () => void;
  canWhatIf?: boolean;
  onOpenWhatIf?: () => void;
}) {
  const { t } = useLocale();
  const f = useFormat();
  const isConfirmed = rScoreStatus === "confirmed";
  const title =
    rScore !== null
      ? t(isConfirmed ? "dash.confirmedTitle" : "dash.estimateTitle")
      : t("dash.pathwayTitle");
  const subtitle = [cegepName, cegepProgramName].filter(Boolean).join(" · ");
  const provenance = isConfirmed ? t("dash.scoreConfirmedBy") : t("dash.scoreEstimatedFrom");
  const entered = enteredOn
    ? t("dash.scoreEnteredOn").replace("{date}", f.date(enteredOn))
    : t("dash.scoreEntered");

  return (
    <section className="flex flex-col items-center gap-1 rounded-xl border border-ink/12 bg-paper px-5 py-6 text-center shadow-card">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <h1 className="font-display text-[17px] font-bold text-ink">{title}</h1>
        {rScore !== null && (
          // Negative vertical margin keeps the 44px hit area from pushing the heading row apart.
          <Link
            href={SCORE_EDIT_HREF}
            aria-label={t("dash.editScore")}
            className="-my-2 inline-flex min-h-[44px] items-center rounded-full border border-ink/15 px-3 text-[12px] font-semibold text-ultramarine tap-spring hover:bg-chalk"
          >
            {t("common.edit")}
          </Link>
        )}
      </div>
      {subtitle && <p className="text-[12.5px] text-ink/50">{subtitle}</p>}

      {rScore !== null && (
        <div
          className={`mt-4 flex min-w-[200px] flex-col items-center gap-1 rounded-xl border px-5 py-3.5 ${
            isConfirmed ? "border-moss/60 bg-moss/[0.02]" : "border-dashed border-moss/60 bg-paper"
          }`}
        >
          {/* GUARDRAIL #2 lives in ScoreValue: the estimate is badged and "≈"-prefixed, the
              confirmed number is not. A confirmed score gets its own word so the two states are
              told apart by a label as well as by the frame. */}
          {isConfirmed && (
            <span className="flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-wider text-moss">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              {t("nav.confirmedShort")}
            </span>
          )}
          <ScoreValue
            value={rScore}
            status={rScoreStatus}
            size="hero"
            badge={isConfirmed ? "never" : "always"}
            className="text-ultramarine"
          />
          <p className="mt-1 max-w-[260px] text-[11.5px] leading-snug text-ink/60">
            {provenance}, {entered.toLowerCase()}
            {sessionLabel ? ` · ${sessionLabel}` : ""}
          </p>
        </div>
      )}

      {rScore !== null && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={onOpenBands} className={PILL}>
            <Info className="h-4 w-4" aria-hidden="true" />
            {t("dash.seeBands")}
          </button>
          {canWhatIf && onOpenWhatIf && (
            <button type="button" onClick={onOpenWhatIf} className={PILL}>
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              {t("dash.whatIf")}
            </button>
          )}
        </div>
      )}

      {rScore === null && (
        <div className="mt-3 flex min-w-[200px] flex-col items-center gap-1.5 rounded-xl border border-dashed border-ink/20 bg-chalk/30 px-5 py-4">
          <span className="flex items-center gap-1.5 rounded-full bg-ink/8 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-ink/60">
            {t("dash.pending")}
          </span>
          {/* A dash, not "??": the product has nothing to say yet, and says so in words below. */}
          <span
            aria-hidden="true"
            className="font-display text-[38px] font-extrabold leading-none tracking-tight text-ink/30 tabular-nums"
          >
            —
          </span>
          <p className="mt-1 max-w-[260px] text-[11.5px] leading-relaxed text-ink/60">
            {t("dash.pendingBody")}
          </p>
          <Link href={SCORE_EDIT_HREF} className={`mt-1 ${PILL}`}>
            {t("dash.enterScore")}
          </Link>
        </div>
      )}
    </section>
  );
}
