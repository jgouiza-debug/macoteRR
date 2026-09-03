"use client";

import Link from "next/link";
import { Info, TrendingUp } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFormat } from "@/lib/i18n/useFormat";
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

/**
 * The hero card: the student's R-score, or the "pending" placeholder for a first-session
 * student who has none yet.
 *
 * GUARDRAIL #2: an estimate renders with a leading "≈ ", a dashed border and the ESTIMATION
 * badge; a confirmed score never does. Nothing here may blur that line.
 */
export function ScoreCard({
  rScore,
  rScoreStatus,
  cegepName,
  cegepProgramName,
  onOpenBands,
}: {
  rScore: number | null;
  rScoreStatus: "confirmed" | "estimated" | null;
  cegepName: string | null;
  cegepProgramName: string | null;
  onOpenBands: () => void;
}) {
  const { t } = useLocale();
  const f = useFormat();
  const isConfirmed = rScoreStatus === "confirmed";
  const title =
    rScore !== null
      ? t(isConfirmed ? "dash.confirmedTitle" : "dash.estimateTitle")
      : t("dash.pathwayTitle");
  const subtitle = [cegepName, cegepProgramName].filter(Boolean).join(" · ");

  return (
    <section className="flex flex-col items-center gap-1 rounded-xl border border-ink/12 bg-paper px-5 py-6 text-center shadow-card">
      <div className="flex flex-wrap items-center justify-center gap-x-1">
        <h1 className="font-display text-[17px] font-bold text-ink">{title}</h1>
        {rScore !== null && (
          // Negative vertical margin keeps the 48px hit area from pushing the heading row apart.
          <Link
            href={SCORE_EDIT_HREF}
            aria-label={t("dash.editScore")}
            className="-my-3 inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full px-2 text-[12.5px] font-semibold text-ultramarine tap-spring hover:underline"
          >
            {t("common.edit")}
          </Link>
        )}
      </div>
      {subtitle && <p className="text-[12.5px] text-ink/50">{subtitle}</p>}

      {rScore !== null ? (
        <button
          type="button"
          onClick={onOpenBands}
          aria-label={`${title} : ${isConfirmed ? "" : "≈ "}${f.score(rScore, 2)}`}
          className={`mt-4 flex min-w-[180px] flex-col items-center gap-1 rounded-xl border px-5 py-3.5 shadow-sm tap-spring active:scale-[0.97] ${
            isConfirmed ? "border-moss/60 bg-moss/[0.02]" : "border-dashed border-moss/60 bg-paper"
          }`}
        >
          {/* Only the estimate is badged. "CONFIRMÉE" restated the heading directly above it
              and boxed the number in for no gain; "ESTIMATION" earns its place, because an
              estimate must never be mistakable for the cégep's own figure. */}
          {!isConfirmed && (
            <span className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-moss">
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
              {t("dash.estimated")}
            </span>
          )}
          <span className="font-display text-[46px] font-extrabold leading-none tracking-tight text-ultramarine tabular-nums">
            {!isConfirmed && "≈ "}
            {f.score(rScore, 2)}
          </span>
          <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-ink/45">
            <Info className="h-3 w-3" aria-hidden="true" />
            {t("common.seuil")}
          </span>
        </button>
      ) : (
        <div className="mt-3 flex min-w-[200px] flex-col items-center gap-1.5 rounded-xl border border-dashed border-ink/20 bg-chalk/30 px-5 py-4">
          <span className="flex items-center gap-1.5 rounded-full bg-ink/8 px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-ink/60">
            {t("dash.pending")}
          </span>
          <span
            aria-hidden="true"
            className="font-display text-[38px] font-extrabold leading-none tracking-tight text-ink/40 tabular-nums"
          >
            ??
          </span>
          <p className="mt-1 max-w-[260px] text-[11.5px] leading-relaxed text-ink/60">
            {t("dash.pendingBody")}
          </p>
          <Link
            href={SCORE_EDIT_HREF}
            className="mt-1 inline-flex min-h-[48px] items-center justify-center rounded-full px-3 text-[12.5px] font-semibold text-ultramarine tap-spring hover:underline"
          >
            {t("dash.enterScore")}
          </Link>
        </div>
      )}
    </section>
  );
}
