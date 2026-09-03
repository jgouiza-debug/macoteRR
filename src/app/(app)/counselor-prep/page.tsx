"use client";

/**
 * FRENCH-ONLY BODY, ON PURPOSE.
 *
 * This is the one page a student prints and hands to a Quebec guidance counsellor. The sheet
 * itself (headings, field labels, the score caption, the risk sentences, the footer
 * disclaimer, fr-CA number formatting) is deliberately written as French literals rather than
 * routed through t(): its reader is the counsellor, not the student, and the counsellor's
 * working language is French whatever the student picked in the app. Only the chrome that
 * exists on screen and never reaches paper — the back link, the print button, the bottom nav,
 * the empty state — follows the UI locale through t(). The cutoff status labels go through
 * the shared CUTOFF_STATUS_LABEL_KEY vocabulary so this sheet can never drift from the app's
 * "Au-dessus / Dans la fourchette / En dessous / Pas encore vérifié" wording.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, TriangleAlert, CheckCircle2, Printer } from "lucide-react";
import { SourceStamp } from "@/components/SourceStamp";
import { EmptyState } from "@/components/ui/EmptyState";
import { BottomNav } from "@/components/app-shell/BottomNav";
import { useReferenceCatalog } from "@/lib/data/reference-store";
import { resolveCegepName, resolveDecName } from "@/lib/data/resolve-names";
import { useStudentProfile } from "@/lib/profile/store";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { formatScore } from "@/lib/format";
import {
  getCutoffRange,
  compareToCutoffRange,
  formatRangeYears,
  CUTOFF_STATUS_LABEL_KEY,
  CUTOFF_STATUS_COLOR_CLASS,
  type CutoffStatus,
} from "@/lib/rscore/cutoff-range";
import { evaluatePrerequisites, findDecCoreCourses } from "@/lib/matching/program-eligibility";

/** Same clearance AppShell gives its <main> so the fixed BottomNav never covers the footer. */
const BOTTOM_NAV_CLEARANCE = "pb-[calc(3.125rem+env(safe-area-inset-bottom)*0.5)] md:pb-0 print:pb-0";

/**
 * The one page a student PRINTS and hands to a guidance counsellor. It used to render
 * STUDENT_SAMPLE throughout — a fabricated cégep, program, session, score, confirmed-session
 * history and target list — so every student handed their counsellor the same fictional
 * person. Everything here now comes from the student's own profile, and anything the product
 * does not actually know is stated as unknown rather than filled in.
 */
export default function CounselorPrepPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { profile, sync } = useStudentProfile();
  const hydrated = useHydrated();
  const { sessions, universityPrograms } = useReferenceCatalog();

  // Nothing below may be decided on the hydration snapshot (an empty profile) or while a
  // signed-in student's first reconcile is still pulling their real profile onto this device.
  const settled = hydrated && sync !== "syncing";

  // Gated on the cégep, NOT on the score. Since 0ea3aa4 a first-session student deliberately
  // has no cote R — the ministry has not computed one yet — so gating here on `rScore === null`
  // threw exactly the cohort this page is most useful to straight back into onboarding, and
  // "Préparer ma rencontre" did nothing but eject them from the app. A missing score is
  // something the document reports as unknown, which is what the rest of it already does.
  useEffect(() => {
    if (settled && profile.cegepId === null) router.replace("/onboarding");
  }, [settled, profile.cegepId, router]);

  if (!settled) {
    return (
      <div className={`min-h-screen bg-chalk ${BOTTOM_NAV_CLEARANCE}`}>
        <div
          className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 md:px-8"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="h-12 w-40 animate-pulse rounded-full bg-ink/8" />
          <div className="flex flex-col gap-6 rounded-xl bg-paper px-4 py-7 shadow-card sm:px-6 sm:py-10 md:px-12">
            <div className="h-10 w-56 animate-pulse rounded bg-ink/8" />
            <div className="h-16 animate-pulse rounded bg-ink/8" />
            <div className="h-24 animate-pulse rounded bg-ink/8" />
            <div className="h-40 animate-pulse rounded bg-ink/8" />
          </div>
        </div>
        <div className="print:hidden">
          <BottomNav />
        </div>
      </div>
    );
  }

  // The effect above is already sending this student to onboarding; until it lands (and in
  // case it never does), the page names the next action instead of a bare loading line.
  if (profile.cegepId === null) {
    return (
      <div className={`min-h-screen bg-chalk ${BOTTOM_NAV_CLEARANCE}`}>
        <EmptyState
          title={t("prep.emptyTitle")}
          body={t("prep.emptyBody")}
          action={{ href: "/onboarding", label: t("dash.startOnboarding") }}
        />
        <div className="print:hidden">
          <BottomNav />
        </div>
      </div>
    );
  }

  const score = profile.rScore;
  const isConfirmed = profile.rScoreStatus === "confirmed";
  // The sheet is French, so the DEC name is resolved in French whatever the UI locale.
  const cegepName = resolveCegepName(profile.cegepId);
  const cegepProgramName = resolveDecName(profile.cegepProgramId, "fr");
  const session = sessions.find((s) => s.id === profile.currentSession);
  const targets = universityPrograms.filter((p) =>
    profile.targetUniversityProgramIds.includes(p.id),
  );
  const dec = findDecCoreCourses(profile.cegepProgramId);

  // Risks are DERIVED, never asserted. `UniversityProgram.prerequisites[].status` is a
  // hard-coded student-relative value in sample-data that is not tied to any real transcript
  // — using it would print "prerequisite not completed" about a student nobody has assessed.
  // program-eligibility deliberately ignores that field, and so does this page: a flag is
  // raised only when a prerequisite resolves to a course absent from a VERIFIED DEC core,
  // which is a statement about two catalogues, phrased as such.
  //
  // Only `prereq_not_in_core` is a talking point. `dec_only` (the programme asks for the DEC
  // itself, no specific course) and `prereq_outside_catalogue` (an accepted alternative this
  // product cannot see) are NOT gaps and must never be printed as one.
  const risks = targets.flatMap((program) => {
    const flags: { program: string; text: string; date: string; href: string }[] = [];
    const stamp = { date: program.lastVerifiedAt, href: program.sourceUrl };
    if (program.courseFloor) {
      flags.push({
        program: program.name,
        text: `${program.courseFloor.course} : seuil de ${formatScore(program.courseFloor.minGrade, "fr")}`,
        ...stamp,
      });
    }
    for (const reason of evaluatePrerequisites(dec, program).reasons) {
      if (reason.kind !== "prereq_not_in_core" || !reason.name) continue;
      flags.push({
        program: program.name,
        text: `${reason.name} ne fait pas partie du tronc commun de ton programme — à confirmer avec ton cégep.`,
        ...stamp,
      });
    }
    return flags;
  });

  // Derived once: the phone renders these as cards and everything wider renders them as table
  // rows, and the two must never disagree about a student's standing.
  const targetRows = targets.map((program) => {
    const range = getCutoffRange(program.cutoffHistory);
    const status: CutoffStatus =
      score === null ? "unknown" : compareToCutoffRange(score, range);
    return {
      program,
      status,
      label: t(CUTOFF_STATUS_LABEL_KEY[status]),
      color: CUTOFF_STATUS_COLOR_CLASS[status],
      rangeLabel: range
        ? `${formatScore(range.low, "fr")}–${formatScore(range.high, "fr")} (${formatRangeYears(range)})`
        : "—",
    };
  });

  return (
    <div className={`min-h-screen bg-chalk ${BOTTOM_NAV_CLEARANCE}`}>
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 print:hidden md:px-8">
        <Link
          href="/profile"
          className="flex min-h-[48px] items-center gap-1.5 text-[13px] font-semibold text-ink/60 hover:text-ink"
        >
          <ChevronLeft className="h-5 w-5" />
          {t("prep.backToProfile")}
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-ultramarine px-6 text-sm font-semibold text-paper shadow-card transition-colors hover:bg-ink"
        >
          <Printer className="h-[18px] w-[18px]" />
          {t("prep.print")}
        </button>
      </div>

      <main className="mx-auto flex max-w-3xl flex-col gap-6 bg-paper px-4 py-7 shadow-card print:shadow-none sm:gap-8 sm:px-6 sm:py-10 md:px-12">
        <header className="flex flex-col gap-2 border-b border-ink/10 pb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:pb-6">
          <div>
            <span className="font-display text-[20px] font-bold tracking-tight text-ink">
              MaCote
            </span>
            <p className="mt-1 text-[12.5px] leading-snug text-ink/60 sm:text-[13px]">
              Préparation de rencontre — conseiller d&rsquo;orientation
            </p>
          </div>
          <p className="text-[11px] text-ink/50 sm:text-right">
            Généré le{" "}
            {new Date().toLocaleDateString("fr-CA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </header>

        <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 sm:gap-4">
          <Field label="Cégep" value={cegepName ?? "Non précisé"} />
          <Field
            label="Programme"
            value={
              cegepProgramName
                ? `${cegepProgramName}${profile.cegepProgramId ? ` (${profile.cegepProgramId})` : ""}`
                : "Non précisé"
            }
          />
          <Field label="Session" value={session?.labelFr ?? "Non précisée"} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[17px] font-bold text-ink">Cote R</h2>
          {/* Guardrail #2: an estimate is never mistakable for the cégep's own figure — it
              carries the "≈ " prefix, the dashed border and the ESTIMATION caption; a confirmed
              score carries none of them. */}
          <div
            className={
              score !== null && !isConfirmed
                ? "self-start rounded-lg border border-dashed border-moss/60 px-3 py-2"
                : ""
            }
          >
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink/50">
              {session ? `${session.labelFr} · ` : ""}
              {score === null
                ? "pas encore calculée"
                : isConfirmed
                  ? "confirmée par le cégep"
                  : "estimation non officielle"}
            </p>
            <p className="font-display text-[24px] font-bold text-ink tabular-nums">
              {score === null ? "—" : `${isConfirmed ? "" : "≈ "}${formatScore(score, "fr", 2)}`}
            </p>
          </div>
          {score === null && (
            <p className="text-[12px] leading-relaxed text-ink/55">
              L&rsquo;étudiant·e n&rsquo;a pas encore de cote R : elle est calculée par le
              ministère après la transmission des notes de groupe de la première session. Les
              programmes ciblés ci-dessous sont donc listés avec leurs cotes publiées, sans
              comparaison.
            </p>
          )}
          {score !== null && !isConfirmed && (
            <p className="text-[12px] leading-relaxed text-ink/55">
              Cette cote est une estimation calculée à partir des notes saisies par
              l&rsquo;étudiant·e, et non un chiffre transmis par le cégep.
            </p>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[17px] font-bold text-ink">Programmes ciblés</h2>
          {targetRows.length === 0 ? (
            <p className="text-[13px] text-ink/60">
              Aucun programme ciblé pour l&rsquo;instant.
            </p>
          ) : (
            <>
              {/* Cards on a phone, the table from sm up. Three columns cannot hold a programme
                  name, a published range and a status inside 375px without every cell wrapping
                  to three lines and the rows losing their alignment. Paper is always at least
                  letter width, so what prints is still the table. */}
              <ul className="flex flex-col gap-2.5 sm:hidden print:hidden">
                {targetRows.map(({ program, rangeLabel, status, label, color }) => (
                  <li
                    key={program.id}
                    className="flex flex-col gap-2 rounded-lg border border-ink/12 p-3"
                  >
                    <div>
                      <p className="text-[13.5px] font-semibold leading-snug text-ink">
                        {program.name}
                      </p>
                      <p className="mt-0.5 text-[11.5px] leading-snug text-ink/50">
                        {program.institution}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <span className="text-[12.5px] tabular-nums text-ink/70">{rangeLabel}</span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11.5px] font-semibold ${color}`}
                      >
                        {status === "above" ? (
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <TriangleAlert className="h-4 w-4 flex-shrink-0" />
                        )}
                        {label}
                      </span>
                    </div>
                    <SourceStamp date={program.lastVerifiedAt} href={program.sourceUrl} />
                  </li>
                ))}
              </ul>

              <table className="hidden w-full border-collapse text-left text-[13px] sm:table print:table">
                <thead>
                  <tr className="border-b border-ink/15 text-[10.5px] font-semibold uppercase tracking-wider text-ink/50">
                    <th className="py-2">Programme</th>
                    <th className="py-2">Cotes publiées</th>
                    <th className="py-2 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {targetRows.map(({ program, rangeLabel, status, label, color }) => (
                    <tr key={program.id} className="border-b border-ink/10">
                      <td className="py-3 pr-3">
                        <div className="font-semibold text-ink">{program.name}</div>
                        <div className="text-[11.5px] text-ink/50">{program.institution}</div>
                        <SourceStamp date={program.lastVerifiedAt} href={program.sourceUrl} />
                      </td>
                      <td className="py-3 pr-3 tabular-nums text-ink/70">{rangeLabel}</td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-[11.5px] font-semibold ${color}`}
                        >
                          {status === "above" ? (
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <TriangleAlert className="h-4 w-4 flex-shrink-0" />
                          )}
                          {label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[17px] font-bold text-ink">Points à discuter</h2>
          {risks.length === 0 ? (
            <p className="text-[13px] text-ink/60">
              Aucun point signalé automatiquement pour les programmes ciblés.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {risks.map((risk, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded border border-ember/40 bg-ember/5 p-3 text-[13px]"
                >
                  <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-ember" />
                  <div className="flex flex-col gap-1">
                    <span className="text-ink">
                      <span className="font-semibold">{risk.program} — </span>
                      {risk.text}
                    </span>
                    {/* Guardrail #1: the grade floor is a figure, so it carries its source. */}
                    <SourceStamp date={risk.date} href={risk.href} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="border-t border-ink/10 pt-6">
          <p className="text-[11px] leading-relaxed text-ink/50">
            Document généré par MaCote à partir des données saisies par l&rsquo;étudiant·e. Les
            cotes publiées proviennent de sources publiques, ne sont pas officielles et peuvent
            accuser plusieurs années de retard sur le cycle d&rsquo;admission en cours. Ce
            document sert d&rsquo;appui à une rencontre — il ne remplace pas un avis
            professionnel ni les données officielles du cégep.
          </p>
        </footer>
      </main>

      <div className="print:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink/50">{label}</p>
      <p className="text-[13px] font-semibold text-ink">{value}</p>
    </div>
  );
}
