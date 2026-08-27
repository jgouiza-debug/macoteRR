"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LangToggle } from "@/components/ui/LangToggle";
import { BottomNav } from "@/components/app-shell/BottomNav";
import { DistributionCurve } from "@/components/rscore/DistributionCurve";
import { SourceStamp } from "@/components/SourceStamp";
import { AddTargetButton } from "./AddTargetButton";
import { useStudentProfile } from "@/lib/profile/store";
import {
  evaluatePrerequisites,
  findDecCoreCourses,
} from "@/lib/matching/program-eligibility";
import { useFormat } from "@/lib/i18n/useFormat";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { CutoffFigureType, UniversityProgram } from "@/lib/sample-data";
import { getCutoffRange, formatRangeYears } from "@/lib/rscore/cutoff-range";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const FIGURE_TYPE_KEY: Record<CutoffFigureType, TranslationKey> = {
  last_admitted: "cutoff.figureType.last_admitted",
  minimum_required: "cutoff.figureType.minimum_required",
  maximum: "cutoff.figureType.maximum",
  average: "cutoff.figureType.average",
  range_low: "cutoff.figureType.range_low",
  range_high: "cutoff.figureType.range_high",
};

export function ProgramDetail({ program }: { program: UniversityProgram }) {
  const { t } = useLocale();
  // The student's own score, read here rather than passed in: the route is statically
  // prerendered, so a server-supplied score could only ever be a hardcoded sample one —
  // which is exactly what this page used to show every visitor.
  const { profile } = useStudentProfile();
  const score = profile.rScore;
  const f = useFormat();
  const range = getCutoffRange(program.cutoffHistory);
  const rangeLabel = range ? `${t("common.seuil")} ${formatRangeYears(range)}` : t("cutoff.unverified");
  const prereqByName = new Map(
    evaluatePrerequisites(findDecCoreCourses(profile.cegepProgramId), program).reasons
      .filter((r) => r.name)
      .map((r) => [r.name as string, r.kind]),
  );

  return (
    <div className="flex min-h-[100dvh] flex-col bg-chalk pb-16 md:pb-0">
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper pt-safe">
        <div className="mx-auto flex h-14 w-full max-w-[480px] items-center justify-between px-4">
          <Link
            href="/programs"
            aria-label={t("common.back")}
            className="-ml-2 flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full text-ink transition-colors active:bg-ink/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <Logo size={20} />
          <LangToggle />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col gap-4 px-4 py-5">
        <span className="w-fit rounded-full border border-ink/15 bg-paper px-3 py-1 text-[11px] font-semibold text-ink/70">
          {program.institution}
        </span>

        <h1 className="font-display text-[34px] font-extrabold leading-[1.08] tracking-tight text-ink">
          {program.name}
        </h1>

        <p className="text-[13px] leading-relaxed text-ink/60">{program.description}</p>

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
            </div>
            <div className="text-right">
              <p className="text-[9.5px] font-semibold uppercase tracking-wider text-ink/50">
                {t("prog.yourPosition")}
              </p>
              <p className="font-display text-[26px] font-bold leading-tight text-ultramarine tabular-nums">
                {score === null ? "—" : f.score(score)}
              </p>
            </div>
          </div>

          {score === null ? (
            <p className="py-6 text-center text-[12.5px] text-ink/50">{t("prog.noScoreYet")}</p>
          ) : (
            <DistributionCurve
              score={score}
              range={range}
              youLabel={t("common.toi")}
              rangeLabel={rangeLabel}
            />
          )}
          <SourceStamp
            date={program.lastVerifiedAt}
            href={program.sourceUrl}
            className="mt-2"
          />
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
          <section className="rounded bg-ultramarine p-4 text-paper">
            <p className="text-[9.5px] font-semibold uppercase tracking-wider text-paper/70">
              {t("prog.placementRate")}
            </p>
            <p className="mt-1 font-display text-[38px] font-extrabold leading-none tracking-tight tabular-nums">
              {program.placementRate.value}%
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-paper/80">
              {program.placementRate.note}
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-paper/60">
              {t("common.verifiedOn")} {f.date(program.lastVerifiedAt)} ·{" "}
              <a
                href={program.sourceUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="underline underline-offset-2"
              >
                {t("common.source")}
              </a>
            </p>
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
                const covered = prereqByName.get(req.name);
                // Only the two states that say something get a badge. The third fired whenever
                // the DEC's core course list has not been researched yet — most programmes —
                // so "À VÉRIFIER" sat next to a plain "DEC reconnu" and read as a warning
                // about the prerequisite rather than an admission about our own catalogue.
                const badge =
                  covered === "prereq_covered"
                    ? { label: t("prog.inDecCore"), cls: "bg-moss/10 text-moss" }
                    : covered === "prereq_not_in_core"
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

        <div className="mt-2">
          <AddTargetButton programId={program.id} />
        </div>

        <footer className="mt-6 flex flex-col items-center gap-2 border-t border-ink/10 pt-6 text-center">
          <span className="font-display text-[17px] font-bold tracking-tight text-ink">
            MaCote
          </span>
          <p className="text-[11px] leading-relaxed text-ink/50">{t("prog.disclaimer")}</p>
          <div className="mt-1 flex flex-wrap justify-center gap-4 text-[11px] font-medium text-ink/50">
            <Link href="/conditions" className="inline-flex min-h-[44px] items-center underline-offset-2 hover:underline">
              {t("prog.terms")}
            </Link>
            <Link href="/confidentialite" className="inline-flex min-h-[44px] items-center underline-offset-2 hover:underline">
              {t("prog.privacy")}
            </Link>
            <Link href="/accessibilite" className="inline-flex min-h-[44px] items-center underline-offset-2 hover:underline">
              {t("prog.dataPolicy")}
            </Link>
          </div>
        </footer>
      </main>

      <BottomNav />
    </div>
  );
}
