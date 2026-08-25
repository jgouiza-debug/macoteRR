"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, CalendarDays, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell/AppShell";
import { AxisRow } from "@/components/rscore/AxisRow";
import { SourceStamp } from "@/components/SourceStamp";
import { CEGEPS, CEGEP_PROGRAMS, UNIVERSITY_PROGRAMS, DEADLINES } from "@/lib/sample-data";
import { useStudentProfile } from "@/lib/profile/store";
import {
  getCutoffRange,
  compareToCutoffRange,
  formatRangeYears,
  CUTOFF_STATUS_LABEL_KEY,
  CUTOFF_STATUS_COLOR_CLASS,
} from "@/lib/rscore/cutoff-range";
import { useFormat } from "@/lib/i18n/useFormat";
import { useLocale } from "@/lib/i18n/LocaleProvider";

/** Highlight a deadline in ember only when it's genuinely imminent. */
const URGENT_WITHIN_DAYS = 14;

/** Whole days from today to an ISO date, comparing calendar days in local time. */
function daysUntil(iso: string): number | null {
  const target = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export default function DashboardPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const f = useFormat();
  const { profile } = useStudentProfile();

  // useSyncExternalStore's first client render matches the server snapshot (rScore: null)
  // before correcting to the real localStorage value on hydration — wait for that correction
  // so the redirect below reacts to the real value, not the transient server one.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // No score means onboarding was never completed on this device — nothing real to show.
  useEffect(() => {
    if (hydrated && profile.rScore === null) router.replace("/onboarding");
  }, [hydrated, profile.rScore, router]);

  if (!hydrated || profile.rScore === null) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-4 px-4 py-16 text-center">
          <p className="text-[14px] text-ink/60">{t("dash.noEstimate")}</p>
          <Link
            href="/onboarding"
            className="flex h-12 items-center justify-center rounded-full bg-ultramarine px-6 text-[14px] font-semibold text-paper shadow-card"
          >
            {t("dash.startOnboarding")}
          </Link>
        </div>
      </AppShell>
    );
  }

  const isConfirmed = profile.rScoreStatus === "confirmed";
  const cegep = CEGEPS.find((c) => c.id === profile.cegepId);
  const cegepProgram = CEGEP_PROGRAMS.find((p) => p.id === profile.cegepProgramId);
  const targets = UNIVERSITY_PROGRAMS.filter((p) => profile.targetUniversityProgramIds.includes(p.id));

  return (
    <AppShell rScore={profile.rScore}>
      <div className="mx-auto flex w-full max-w-[480px] flex-col gap-7 px-4 py-6">
        <section className="flex flex-col items-center gap-1 rounded border border-ink/12 bg-paper px-5 py-6 text-center shadow-card">
          <h1 className="font-display text-[17px] font-bold text-ink">
            {/* The heading has to track the actual status: it read "Estimation actuelle"
                above a badge saying CONFIRMÉE, which is exactly the confirmed-vs-estimated
                ambiguity this product treats as non-negotiable. */}
            {t(isConfirmed ? "dash.confirmedTitle" : "dash.estimateTitle")}
          </h1>
          {(cegep || cegepProgram) && (
            <p className="text-[12.5px] text-ink/50">
              {[cegep?.name, cegepProgram?.name].filter(Boolean).join(" · ")}
            </p>
          )}
          {/* Dashed frame + ≈ + trending icon are the "this is an estimate" tell. A
              confirmed score is a fact from the student's cégep and gets a solid frame and a
              check, so the two can never be mistaken for each other at a glance. */}
          <div
            className={`mt-4 flex min-w-[180px] flex-col items-center gap-1 rounded border px-5 py-3 ${
              isConfirmed ? "border-moss/60" : "border-dashed border-moss/60"
            }`}
          >
            <span className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-moss">
              {isConfirmed ? (
                <BadgeCheck className="h-3.5 w-3.5" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5" />
              )}
              {t(isConfirmed ? "dash.confirmed" : "dash.estimated")}
            </span>
            <span className="font-display text-[40px] font-extrabold leading-none tracking-tight text-ultramarine tabular-nums">
              {!isConfirmed && "≈ "}
              {f.score(profile.rScore, 2)}
            </span>
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded border border-ink/12 bg-paper p-4 shadow-card">
          <h2 className="font-display text-[17px] font-bold text-ink">
            {t("dash.programGoal")}
          </h2>

          {targets.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <p className="text-[13px] text-ink/55">{t("dash.noGoals")}</p>
              <Link href="/programs" className="text-[13.5px] font-semibold text-ultramarine">
                {t("dash.addGoal")}
              </Link>
            </div>
          ) : (
            targets.map((program) => {
              const range = getCutoffRange(program.cutoffHistory);
              const status = compareToCutoffRange(profile.rScore as number, range);
              const goalName = program.name;
              return (
                <div key={program.id} className="flex flex-col gap-2 border-t border-ink/10 pt-4 first:border-t-0 first:pt-0">
                  <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
                    <span className="font-semibold text-ink">
                      {goalName} · {program.institution}
                    </span>
                    <span className="text-ink/55 tabular-nums">
                      {range
                        ? `${t("cutoff.publishedRange")} ${formatRangeYears(range)} : ${f.score(range.low)}–${f.score(range.high)}`
                        : t("cutoff.unverified")}
                    </span>
                  </div>

                  {/* Position on the distribution, never a progress bar: a cote R is a rank in a
                      cohort, and a bar would read the gap as a failure to fill. */}
                  <AxisRow score={profile.rScore as number} range={range} />

                  <div className="flex justify-between text-[11.5px] text-ink/55 tabular-nums">
                    <span>
                      {t(isConfirmed ? "dash.yourScore" : "dash.yourEst")} : {!isConfirmed && "≈ "}
                      {f.score(profile.rScore as number)}
                    </span>
                    <span className={`font-semibold ${CUTOFF_STATUS_COLOR_CLASS[status]}`}>
                      {t(CUTOFF_STATUS_LABEL_KEY[status])}
                    </span>
                  </div>
                  <SourceStamp date={program.lastVerifiedAt} href={program.sourceUrl} />
                </div>
              );
            })
          )}
        </section>

        <section className="flex flex-col gap-4 rounded border border-ink/12 bg-paper p-4 shadow-card">
          <h2 className="flex items-center gap-2 font-display text-[17px] font-bold text-ink">
            <CalendarDays className="h-[18px] w-[18px]" />
            {t("dash.importantDates")}
          </h2>
          <ul className="relative flex flex-col gap-5 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-ink/12">
            {DEADLINES.map((d) => {
              // Urgency is DERIVED from today's date, not read from a hardcoded `urgent`
              // flag — that flag was rendering "13 novembre — DEMAIN" in August. Telling a
              // student a deadline is tomorrow when it is months away is worse than silence.
              const days = daysUntil(d.dateIso);
              const isSoon = days !== null && days >= 0 && days <= URGENT_WITHIN_DAYS;
              const relative =
                days === null || !isSoon
                  ? null
                  : days === 0
                    ? t("dash.today")
                    : days === 1
                      ? t("dash.tomorrow")
                      : t("dash.inDays").replace("{n}", String(days));
              return (
              <li key={d.id} className="relative pl-6">
                <span
                  className={`absolute left-0 top-1 h-2.5 w-2.5 rounded-full ring-4 ring-paper ${
                    isSoon ? "bg-ember" : "bg-ultramarine"
                  }`}
                />
                <div
                  className={`text-[11.5px] font-semibold ${
                    isSoon ? "text-ember" : "text-ink/50"
                  }`}
                >
                  {f.date(d.dateIso)}
                  {relative && ` — ${relative}`}
                </div>
                <div className="mt-0.5 text-[14px] font-semibold text-ink">
                  {locale === "fr" ? d.titleFr : d.titleEn}
                </div>
                <div className="text-[12.5px] leading-relaxed text-ink/55">
                  {locale === "fr" ? d.detailFr : d.detailEn}
                </div>
                <SourceStamp
                  date={d.lastVerifiedAt}
                  href={d.sourceUrl}
                  className="mt-1"
                />
              </li>
              );
            })}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
