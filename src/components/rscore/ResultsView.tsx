"use client";

import Link from "next/link";
import { ArrowRight, ChevronLeft, Info } from "lucide-react";
import { useState } from "react";
import { DistributionCurve } from "@/components/rscore/DistributionCurve";
import { ScoreValue } from "@/components/rscore/ScoreValue";
import { RScoreBandSheet } from "@/components/rscore/RScoreBandSheet";
import { bandForScore, bandLabel, R_SCORE_BAND_SOURCE } from "@/lib/rscore/bands";
import { AxisRow } from "@/components/rscore/AxisRow";
import { SourceStamp } from "@/components/SourceStamp";
import { Logo } from "@/components/ui/Logo";
import { LangToggle } from "@/components/ui/LangToggle";
import { useReferenceCatalog } from "@/lib/data/reference-store";
import {
  formatRangeYears,
  CUTOFF_STATUS_LABEL_KEY,
  CUTOFF_STATUS_COLOR_CLASS,
  cutoffStatusLabelKey,
  cutoffRangeLabelKey,
} from "@/lib/rscore/cutoff-range";
import {
  rankProgramsForStudent,
  PREREQUISITE_STATUS_COLOR_CLASS,
  type PrerequisiteCoverage,
} from "@/lib/matching/program-eligibility";
import { useStudentProfile } from "@/lib/profile/store";
import { useFunnelNav } from "@/lib/profile/funnel-nav";
import { useFormat } from "@/lib/i18n/useFormat";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const PREREQ_LABEL_KEY: Record<PrerequisiteCoverage, TranslationKey> = {
  prerequisites_met: "prereq.met",
  prerequisites_partial: "prereq.partial",
  prerequisites_unknown: "prereq.unknown",
};

/**
 * "Ta cote de 28,4 dépasse le seuil publié dans 3 programmes" — one key per
 * status × plural form, so neither language has to fake agreement with string surgery.
 */
const HEADLINE_KEY: Record<"confirmed" | "estimated", { one: TranslationKey; many: TranslationKey }> = {
  confirmed: { one: "results.headlineConfirmedOne", many: "results.headlineConfirmed" },
  estimated: { one: "results.headlineEstimatedOne", many: "results.headlineEstimated" },
};

export function ResultsView({
  score,
  status,
}: {
  score: number;
  status: "confirmed" | "estimated";
}) {
  const { t, locale } = useLocale();
  const f = useFormat();
  const { profile } = useStudentProfile();
  const { universityPrograms } = useReferenceCatalog();
  // Every link between funnel steps carries ?edit= / ?next= through here, so a student who
  // came from the profile to redo their score returns there, not to the goal step.
  const { hrefFor } = useFunnelNav();
  // "What does 28,4 actually mean?" — the question every student asks the moment they see
  // their number, and the one this screen previously left unanswered.
  const [bandOpen, setBandOpen] = useState(false);
  const band = bandForScore(score);
  const isEstimated = status === "estimated";

  // Two independent dimensions — the published-cutoff range and whether this student's DEC
  // core covers the program's recorded prerequisites — ranked together but never blended
  // into one "match score". See src/lib/matching/program-eligibility.ts.
  const ranked = rankProgramsForStudent({
    decProgramCode: profile.cegepProgramId,
    rScore: score,
    universityPrograms,
  }).map((row) => ({
    program: row.program,
    range: row.cutoff.range,
    cutoffStatus: row.cutoff.status,
    prereq: row.prerequisites,
  }));

  const cleared = ranked.filter((r) => r.cutoffStatus === "above").length;
  // Four rows from four institutions where possible: four programmes of one university with
  // one shared cutoff read as mock data, and tell the student one thing four times.
  const shown: typeof ranked = [];
  for (const row of ranked) {
    if (shown.length === 4) break;
    if (!shown.some((s) => s.program.institution === row.program.institution)) shown.push(row);
  }
  for (const row of ranked) {
    if (shown.length === 4) break;
    if (!shown.includes(row)) shown.push(row);
  }
  // The catalogue's own stamp: the most recent verification across the programmes compared.
  const catalogVerifiedAt = universityPrograms.reduce(
    (max, p) => (p.lastVerifiedAt > max ? p.lastVerifiedAt : max),
    "",
  );
  // Anchors the hero chart on the first program with a verified range, so the headline
  // visual never fabricates a cross-program "average cutoff" from mismatched figure types.
  const hero = ranked.find((r) => r.range) ?? ranked[0];
  const heroRangeLabel = hero?.range
    ? `${f.score(hero.range.low)}–${f.score(hero.range.high)} (${formatRangeYears(hero.range)})`
    : t("cutoff.unverified");

  // The score in the headline goes through ScoreValue too, so an estimate carries its "≈"
  // there as much as on the card (guardrail #2). Split the copy on {score} and drop the
  // renderer in between.
  const [headBefore, headAfter = ""] = t(HEADLINE_KEY[status][cleared === 1 ? "one" : "many"])
    .replace("{n}", String(cleared))
    .split("{score}");

  return (
    <div className="flex min-h-[100dvh] flex-col bg-chalk">
      <header className="sticky top-0 z-50 bg-chalk/90 backdrop-blur-sm pt-safe">
        <div className="mx-auto flex h-14 w-full max-w-[430px] items-center justify-between px-5">
          <div className="flex items-center gap-1">
            <Link
              href={hrefFor("/onboarding/score")}
              aria-label={t("common.back")}
              className="-ml-2 flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-ink transition-colors active:bg-ink/10"
            >
              <ChevronLeft className="h-6 w-6" />
            </Link>
            <Logo size={22} />
          </div>
          <LangToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[430px] flex-1 flex-col gap-5 px-5 pt-3 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]">
        <h1 className="font-display text-[24px] font-bold leading-[1.18] tracking-tight text-ink">
          {headBefore}
          <ScoreValue value={score} status={status} size="inline" />
          {headAfter}
        </h1>
        {catalogVerifiedAt && (
          <SourceStamp
            date={catalogVerifiedAt}
            label={t("results.catalogStamp").replace("{n}", String(universityPrograms.length))}
            className="-mt-3"
          />
        )}

        {/* Dashed accent border + ESTIMATION badge on an estimate, matching the dashboard,
            so the two kinds of number never look alike (guardrail #2). */}
        <section className="rounded border border-ink/12 bg-paper p-4 shadow-card">
          <div className="mb-1 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] text-ink/50">{t("entry.label")}</p>
              {/* GUARDRAIL #2 lives in ScoreValue: framed = dashed border + badge for an estimate. */}
              <div className="mt-1">
                <ScoreValue value={score} status={status} size="md" framed={isEstimated} className="text-ultramarine" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-ink/50">{hero?.range ? t(cutoffRangeLabelKey(hero.range)) : t("cutoff.publishedRange")}</p>
              <p className="font-display text-[18px] font-bold leading-tight text-ink tabular-nums">
                {hero?.range ? `${f.score(hero.range.low)}–${f.score(hero.range.high)}` : "—"}
              </p>
              {hero && (
                <p className="mt-0.5 max-w-[180px] text-[10.5px] leading-snug text-ink/50">{hero.program.name}</p>
              )}
            </div>
          </div>
          {/* GUARDRAIL #1: the range on the right is the hero programme's, and says so. */}
          {hero?.range && (
            <SourceStamp date={hero.program.lastVerifiedAt} href={hero.program.sourceUrl} hostAsLabel className="mb-2 text-right" />
          )}
          <DistributionCurve
            score={score}
            range={hero?.range ?? null}
            estimated={isEstimated}
            youLabel={t("common.toi")}
            rangeLabel={heroRangeLabel}
          />
          {/* The bell is a drawing of the BCI scale, not this programme's statistics: it says so,
              and it carries the scale's source like every other figure (guardrail #1). */}
          <p className="mt-2 text-[11px] leading-relaxed text-ink/50">{t("results.curveNote")}</p>
          <SourceStamp date={R_SCORE_BAND_SOURCE.lastVerifiedAt} href={R_SCORE_BAND_SOURCE.url} hostAsLabel />

          {/* The band (sourced and disclaimed in src/lib/rscore/bands.ts) is the only
              interpretation this screen offers — no percentiles, nothing unsourced. */}
          <button
            type="button"
            onClick={() => setBandOpen(true)}
            className="mt-2 flex min-h-[48px] w-full items-center justify-center gap-1.5 rounded border border-ink/15 px-3 py-2.5 text-[13px] font-semibold text-ink/70 transition-transform active:scale-[0.99]"
          >
            <Info className="h-4 w-4 text-ink/45" />
            {bandLabel(band, locale)} · {t("results.whatItMeans")}
          </button>
        </section>

        <p className="-mb-3 text-[11px] text-ink/45">{t("dash.axisLegend")}</p>
        <div className="overflow-hidden rounded border border-ink/12 bg-paper shadow-card">
          {shown.map(({ program, range, cutoffStatus, prereq }) => (
            // SourceStamp renders its own <a>, so it stays a sibling of the row link —
            // an anchor inside an anchor is invalid HTML and breaks hydration.
            <div key={program.id} className="border-b border-ink/10 last:border-b-0">
              <Link
                href={`/programs/${program.id}`}
                className="flex flex-col gap-2.5 px-4 pb-2 pt-4 active:bg-chalk/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h2 className="text-[13.5px] font-semibold leading-snug text-ink">
                      {program.name}
                    </h2>
                    <p className="mt-0.5 text-[11.5px] text-ink/50">
                      {program.institution} ·{" "}
                      {range
                        ? `${t(cutoffRangeLabelKey(range))} ${formatRangeYears(range)} : ${f.score(range.low)}–${f.score(range.high)}`
                        : t("cutoff.unverified")}
                    </p>
                  </div>
                  <span className={`text-[12px] font-bold uppercase tracking-wide ${CUTOFF_STATUS_COLOR_CLASS[cutoffStatus]}`}>
                    {t(cutoffStatusLabelKey(cutoffStatus, range))}
                  </span>
                </div>
                <AxisRow score={score} range={range} />
                {/* Second, independent dimension — never blended with the cutoff status
                    above. "unknown" means nobody has recorded this program's prerequisites,
                    which is the current reality for most of them, and must never read as
                    "you qualify". */}
                <p
                  className={`text-[11px] font-semibold ${PREREQUISITE_STATUS_COLOR_CLASS[prereq.status]}`}
                >
                  {t(PREREQ_LABEL_KEY[prereq.status])}
                </p>
              </Link>
              <SourceStamp
                date={program.lastVerifiedAt}
                href={program.sourceUrl}
                className="px-4 pb-3"
              />
            </div>
          ))}
        </div>

        {/* The cégep was chosen in step 1, so the next thing the funnel owes the student is
            the goal step — where they're headed, or the quiz if they don't yet know. */}
        <Link
          href={hrefFor("/onboarding/goal")}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98]"
        >
          {t("common.continue")}
          <ArrowRight className="h-[18px] w-[18px]" />
        </Link>
      </main>

      <RScoreBandSheet score={score} open={bandOpen} onClose={() => setBandOpen(false)} />
    </div>
  );
}
