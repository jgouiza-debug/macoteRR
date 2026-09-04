"use client";

import { AppShell } from "@/components/app-shell/AppShell";
import { DistributionCurve } from "@/components/rscore/DistributionCurve";
import { ScoreValue } from "@/components/rscore/ScoreValue";
import { SourceStamp } from "@/components/SourceStamp";
import { AddTargetButton } from "./AddTargetButton";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useStudentProfile } from "@/lib/profile/store";
import { useReferenceCatalog } from "@/lib/data/reference-store";
import {
  evaluatePrerequisites,
  findDecCoreCourses,
  resolvePrerequisite,
} from "@/lib/matching/program-eligibility";
import { useFormat } from "@/lib/i18n/useFormat";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { CutoffFigureType, UniversityProgram } from "@/lib/sample-data";
import {
  getCutoffRange,
  formatRangeYears,
  cutoffRangeLabelKey,
  formatCutoffValues,
} from "@/lib/rscore/cutoff-range";
import { R_SCORE_BAND_SOURCE } from "@/lib/rscore/bands";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const FIGURE_TYPE_KEY: Record<CutoffFigureType, TranslationKey> = {
  last_admitted: "cutoff.figureType.last_admitted",
  minimum_required: "cutoff.figureType.minimum_required",
  maximum: "cutoff.figureType.maximum",
  average: "cutoff.figureType.average",
  range_low: "cutoff.figureType.range_low",
  range_high: "cutoff.figureType.range_high",
};

export function ProgramDetail({ program: shipped }: { program: UniversityProgram }) {
  const { t } = useLocale();
  // The student's own score, read here rather than passed in: the route is statically
  // prerendered, so a server-supplied score could only ever be a hardcoded sample one —
  // which is exactly what this page used to show every visitor.
  const { profile, sync } = useStudentProfile();
  // On the server pass and the hydration render the store still holds the empty profile, and
  // on a signed-in student's fresh device it stays empty until the first reconcile lands. In
  // both windows nothing about the student is known yet, so the position block and the
  // prerequisite badges show a neutral skeleton — never the "enter your score" copy for a
  // student who has one, never a curve for one who does not, never badges against no DEC.
  const hydrated = useHydrated();
  const settled = hydrated && sync !== "syncing";
  const score = settled ? profile.rScore : null;
  const isConfirmed = profile.rScoreStatus === "confirmed";
  const f = useFormat();
  // The server page resolved `shipped` from the constant the route was prerendered from
  // (static params, metadata and the 404 all live there). The figures shown come from the
  // live catalogue looked up by that id, so a cutoff re-verified and promoted after the
  // deploy shows here on the next boot; the shipped entry is the fallback when the live
  // bundle does not carry the id.
  const { universityPrograms } = useReferenceCatalog();
  const program = universityPrograms.find((p) => p.id === shipped.id) ?? shipped;
  const range = getCutoffRange(program.cutoffHistory);
  const rangeLabel = range
    ? `${formatCutoffValues(range, (v) => f.score(v))} (${formatRangeYears(range)})`
    : t("cutoff.unverified");
  const prereqKindByName = new Map(
    evaluatePrerequisites(findDecCoreCourses(settled ? profile.cegepProgramId : null), program).reasons
      .filter((r) => r.name)
      .map((r) => [r.name as string, r.kind]),
  );

  return (
    <AppShell
      backHref="/programs"
      rScore={score}
      rScoreStatus={profile.rScoreStatus}
      currentSession={settled ? profile.currentSession : null}
    >
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-4 px-4 py-5">
        <span className="w-fit rounded-full border border-ink/15 bg-paper px-3 py-1 text-[11px] font-semibold text-ink/70">
          {program.institution}
        </span>

        <h1 className="font-display text-[34px] font-extrabold leading-[1.08] tracking-tight text-ink">
          {program.name}
        </h1>

        <p className="text-[13px] leading-relaxed text-ink/60">{program.description}</p>

        {/* The one action this page exists for sits above the fold, not two screens down. */}
        <AddTargetButton programId={program.id} programName={program.name} />

        {/* Admissions distribution */}
        <section className="rounded border border-ink/12 bg-paper p-4 shadow-card">
          <div className="mb-1 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[13px] font-semibold text-ink">
                {t("prog.admissionsRScore")}
              </h2>
              <p className="mt-0.5 text-[11px] leading-snug text-ink/50">
                {program.cohortLabel}
              </p>
              {/* The published range is the figure this page exists to show: as a number, first. */}
              <p className="mt-1 font-display text-[18px] font-bold leading-tight text-ink tabular-nums">
                {range ? `${formatCutoffValues(range, (v) => f.score(v))}` : "—"}
                <span className="ml-1.5 font-sans text-[11px] font-medium text-ink/50">
                  {range ? `${t(cutoffRangeLabelKey(range))} ${formatRangeYears(range)}` : t("cutoff.unverified")}
                </span>
              </p>
            </div>
            <div className="flex flex-col items-end text-right">
              <p className="text-[9.5px] font-semibold uppercase tracking-wider text-ink/50">
                {t("prog.yourPosition")}
              </p>
              {!settled ? (
                <div aria-busy="true" className="mt-1 h-7 w-16 animate-pulse rounded bg-ink/8" />
              ) : score === null ? (
                <p className="font-display text-[26px] font-bold leading-tight text-ultramarine tabular-nums">
                  —
                </p>
              ) : (
                // GUARDRAIL #2 lives in ScoreValue: framed = dashed border + badge for an estimate.
                <ScoreValue
                  value={score}
                  status={profile.rScoreStatus}
                  size="md"
                  framed={!isConfirmed}
                  className="text-ultramarine"
                />
              )}
            </div>
          </div>

          {!settled ? (
            <div aria-busy="true" className="my-2 h-[130px] w-full animate-pulse rounded bg-ink/5" />
          ) : score === null ? (
            <p className="py-6 text-center text-[12.5px] text-ink/50">{t("prog.noScoreYet")}</p>
          ) : (
            // GUARDRAIL #2: the curve's marker label carries the "≈ " of an estimate too.
            <DistributionCurve
              score={score}
              range={range}
              estimated={!isConfirmed}
              youLabel={t("common.toi")}
              rangeLabel={rangeLabel}
            />
          )}
          {score !== null && (
            <p className="mt-2 text-[11px] leading-relaxed text-ink/50">{t("results.curveNote")}</p>
          )}
          <SourceStamp date={program.lastVerifiedAt} href={program.sourceUrl} className="mt-2" />
          {score !== null && (
            <SourceStamp date={R_SCORE_BAND_SOURCE.lastVerifiedAt} href={R_SCORE_BAND_SOURCE.url} className="mt-1" />
          )}
        </section>

        {program.courseFloor && (
          <section className="rounded border border-ink/12 bg-paper p-4 shadow-card">
            <p className="text-[9.5px] font-semibold uppercase tracking-wider text-ink/50">
              {t("prog.subjectFloor")}
            </p>
            <p className="mt-1 font-display text-[24px] font-bold leading-tight text-ink tabular-nums">
              {program.courseFloor.course} {f.score(program.courseFloor.minGrade)}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink/55">
              {program.courseFloor.note}
            </p>
            <SourceStamp
              date={program.lastVerifiedAt}
              href={program.sourceUrl}
              className="mt-2"
            />
          </section>
        )}

        {program.placementRate && (
          // Same register as the other cards: a placement rate is context, and a saturated blue
          // block made it the loudest thing on a page that exists to show the cutoffs.
          <section className="rounded border border-ink/12 bg-paper p-4 shadow-card">
            <p className="text-[9.5px] font-semibold uppercase tracking-wider text-ink/50">
              {t("prog.placementRate")}
            </p>
            <p className="mt-1 font-display text-[28px] font-extrabold leading-none tracking-tight text-ink tabular-nums">
              {program.placementRate.value}%
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-ink/60">
              {program.placementRate.note}
            </p>
            <SourceStamp date={program.lastVerifiedAt} href={program.sourceUrl} hostAsLabel className="mt-2" />
          </section>
        )}

        {program.prerequisites.length > 0 && (
          <section className="rounded border border-ink/12 bg-paper p-4 shadow-card">
            <h2 className="mb-1 text-[14px] font-semibold text-ink">
              {t("prog.prerequisites")}
            </h2>
            {/* Coverage is DERIVED from the student's DEC core, not read from
                `prerequisites[].status` — that field is a hard-coded, student-relative value
                in sample-data tied to no real transcript, so rendering it told every visitor
                the same fictional student's progress. "Pas au tronc commun" is a statement
                about two catalogues, not a claim the student hasn't taken the course. */}
            <ul className="flex flex-col">
              {program.prerequisites.map((req) => {
                const kind = prereqKindByName.get(req.name);
                // "DEC reconnu" is the university asking for the diploma alone. That is a fact
                // about the program, so it is badged for everyone — including a visitor with
                // no DEC on file, for whom the evaluator cannot run at all. Only the two DEC
                // findings that say something get a badge; every other kind (unresearched
                // core, an alternative outside the catalogue, an unmapped name) says nothing
                // about the student and must not look like a warning.
                const decOnly = kind === "dec_only" || resolvePrerequisite(req.name).kind === "dec_only";
                const badge = decOnly
                  ? { label: t("prog.decOnly"), cls: "bg-ink/8 text-ink/70" }
                  : kind === "prereq_covered"
                    ? { label: t("prog.inDecCore"), cls: "bg-moss/10 text-moss" }
                    : kind === "prereq_not_in_core"
                      ? { label: t("prog.notInDecCore"), cls: "bg-ember/10 text-ember" }
                      : null;
                return (
                  <li
                    key={req.name}
                    className="flex items-center justify-between gap-3 border-b border-ink/10 py-2.5 last:border-b-0"
                  >
                    <span className="text-[13.5px] text-ink">{req.name}</span>
                    {badge && (
                      <span
                        className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.cls}`}
                      >
                        {badge.label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section className="rounded border border-ink/12 bg-paper p-4 shadow-card">
          <h2 className="mb-3 text-[14px] font-semibold text-ink">
            {t("prog.cutoffHistory")}
          </h2>
          {program.cutoffHistory.length > 0 ? (
            <ul className="flex flex-col">
              {[...program.cutoffHistory]
                .sort((a, b) => a.year - b.year)
                .map((entry) => (
                  <li
                    key={`${entry.year}-${entry.figureType}`}
                    className="flex items-center justify-between gap-3 border-b border-ink/10 py-2.5 last:border-b-0"
                  >
                    <span className="text-[12.5px] text-ink/60">
                      {entry.year} · {t(FIGURE_TYPE_KEY[entry.figureType])}
                    </span>
                    <span className="text-[13.5px] font-semibold tabular-nums text-ink">
                      {f.score(entry.cutoff)}
                    </span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-[12.5px] leading-relaxed text-ink/50">{t("cutoff.noDataYet")}</p>
          )}
          <SourceStamp
            date={program.lastVerifiedAt}
            href={program.sourceUrl}
            className="mt-3"
          />
        </section>

        {program.professionalOrders && (
          <section className="rounded border border-ink/12 bg-paper p-4 shadow-card">
            <h2 className="text-[14px] font-semibold text-ink">
              {t("prog.professionalOrders")}
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-ink/55">
              {program.professionalOrders.note}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {program.professionalOrders.codes.map((code) => (
                <span
                  key={code}
                  className="rounded-full border border-ink/15 px-3 py-1 text-[11.5px] font-semibold text-ink/75"
                >
                  {code}
                </span>
              ))}
            </div>
          </section>
        )}

        <div className="pb-[env(safe-area-inset-bottom)]" />
      </div>
    </AppShell>
  );
}
