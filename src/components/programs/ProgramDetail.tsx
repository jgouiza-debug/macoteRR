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
import { useFormat } from "@/lib/i18n/useFormat";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { PrerequisiteStatus, UniversityProgram } from "@/lib/sample-data";
import type { TranslationKey } from "@/lib/i18n/dictionary";

const STATUS: Record<PrerequisiteStatus, { key: TranslationKey; className: string }> = {
  met: { key: "prog.met", className: "bg-moss/10 text-moss" },
  missing: { key: "prog.missing", className: "bg-ember/10 text-ember" },
  in_progress: { key: "prog.inProgress", className: "bg-ink/8 text-ink/60" },
};

export function ProgramDetail({ program }: { program: UniversityProgram }) {
  const { t } = useLocale();
  const f = useFormat();
  const { profile } = useStudentProfile();
  const score = profile.rScore ?? 0;
  const clears = score >= program.overallCutoff;

  return (
    <div className="flex min-h-[100dvh] flex-col bg-chalk pb-16 md:pb-0">
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper pt-safe">
        <div className="mx-auto flex h-14 w-full max-w-[480px] items-center justify-between px-4">
          <Link
            href="/programs"
            aria-label={t("common.back")}
            className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors active:bg-ink/10"
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
                {f.score(score)}
              </p>
            </div>
          </div>

          <DistributionCurve
            score={score}
            cutoff={program.overallCutoff}
            clears={clears}
            youLabel={t("common.toi")}
            cutoffLabel={t("common.seuil")}
          />
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
            <ul className="flex flex-col">
              {program.prerequisites.map((req) => {
                const status = STATUS[req.status];
                return (
                  <li
                    key={req.name}
                    className="flex items-center justify-between gap-3 border-b border-ink/10 py-2.5 last:border-b-0"
                  >
                    <span className="text-[13.5px] text-ink">{req.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${status.className}`}
                    >
                      {t(status.key)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {program.cutoffHistory.length > 0 && (
          <section className="rounded border border-ink/12 bg-paper p-4 shadow-card">
            <h2 className="mb-3 text-[14px] font-semibold text-ink">
              {t("prog.cutoffHistory")}
            </h2>
            <div className="flex items-center justify-between">
              {program.cutoffHistory.map((entry, i) => {
                const isLast = i === program.cutoffHistory.length - 1;
                return (
                  <div key={entry.year} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center">
                      <span
                        className={`text-[11.5px] ${isLast ? "font-bold text-ultramarine" : "text-ink/50"}`}
                      >
                        {entry.year}
                      </span>
                      <span
                        className={`text-[13.5px] font-semibold tabular-nums ${
                          isLast ? "text-ultramarine" : "text-ink"
                        }`}
                      >
                        {f.score(entry.cutoff)}
                      </span>
                    </div>
                    {!isLast && <div className="mx-2 h-px flex-1 bg-ink/12" />}
                  </div>
                );
              })}
            </div>
            <SourceStamp
              date={program.lastVerifiedAt}
              href={program.sourceUrl}
              className="mt-3"
            />
          </section>
        )}

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
            <a href="#" className="underline-offset-2 hover:underline">
              {t("prog.terms")}
            </a>
            <a href="#" className="underline-offset-2 hover:underline">
              {t("prog.privacy")}
            </a>
            <a href="#" className="underline-offset-2 hover:underline">
              {t("prog.dataPolicy")}
            </a>
          </div>
        </footer>
      </main>

      <BottomNav />
    </div>
  );
}
