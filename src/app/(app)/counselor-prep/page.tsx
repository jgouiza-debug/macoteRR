"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronLeft, TriangleAlert, CheckCircle2 } from "lucide-react";
import { SourceStamp } from "@/components/SourceStamp";
import { CEGEPS, CEGEP_PROGRAMS, SESSIONS, UNIVERSITY_PROGRAMS } from "@/lib/sample-data";
import { CEGEP_DEC_PROGRAMS } from "@/lib/data/cegep-catalog";
import { findCegepInstitution, findDecProgramName } from "@/lib/data/cegep-institutions";
import { useStudentProfile } from "@/lib/profile/store";
import { formatScore } from "@/lib/format";
import {
  getCutoffRange,
  compareToCutoffRange,
  formatRangeYears,
  type CutoffStatus,
} from "@/lib/rscore/cutoff-range";
import { evaluatePrerequisites, findDecCoreCourses } from "@/lib/matching/program-eligibility";

/** FR-only: this document is handed to a Quebec guidance counsellor, printed. */
const STATUS_LABEL: Record<CutoffStatus, string> = {
  above: "Au-dessus",
  inside: "Dans la fourchette",
  below: "En dessous",
  unknown: "Non vérifié",
};

const STATUS_COLOR: Record<CutoffStatus, string> = {
  above: "text-moss",
  inside: "text-ultramarine",
  below: "text-ember",
  unknown: "text-ink/40",
};

const PrintButton = dynamic(
  () => import("@/components/PrintButton").then((mod) => mod.PrintButton),
);

/**
 * The one page a student PRINTS and hands to a guidance counsellor. It used to render
 * STUDENT_SAMPLE throughout — a fabricated cégep, program, session, score, confirmed-session
 * history and target list — so every student handed their counsellor the same fictional
 * person. Everything here now comes from the student's own profile, and anything the product
 * does not actually know is stated as unknown rather than filled in.
 */
export default function CounselorPrepPage() {
  const router = useRouter();
  const { profile } = useStudentProfile();

  // Same hydration-safe pattern as /dashboard and /programs: the first client render matches
  // the server snapshot (rScore: null) before correcting to the real localStorage value.
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  // Gated on the cégep, NOT on the score. Since 0ea3aa4 a first-session student deliberately
  // has no cote R — the ministry has not computed one yet — so gating here on `rScore === null`
  // threw exactly the cohort this page is most useful to straight back into onboarding, and
  // "Préparer ma rencontre" did nothing but eject them from the app. A missing score is
  // something the document reports as unknown, which is what the rest of it already does.
  useEffect(() => {
    if (hydrated && profile.cegepId === null) router.replace("/onboarding");
  }, [hydrated, profile.cegepId, router]);

  if (!hydrated || profile.cegepId === null) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-chalk px-5">
        <p className="text-[14px] text-ink/60">Chargement…</p>
      </div>
    );
  }

  const score = profile.rScore;
  const isConfirmed = profile.rScoreStatus === "confirmed";
  // Same three-catalogue lookup the dashboard uses. sample-data's six-entry stub was the only
  // source here, so a real DEC code like 200.B1 matched nothing and the printed sheet told the
  // counsellor the student's programme was "Non précisé".
  const cegepName =
    CEGEPS.find((c) => c.id === profile.cegepId)?.name ??
    findCegepInstitution(profile.cegepId)?.name ??
    null;
  const cegepProgramName =
    findDecProgramName(profile.cegepProgramId) ??
    CEGEP_DEC_PROGRAMS.find((p) => p.code === profile.cegepProgramId)?.nameFr ??
    CEGEP_PROGRAMS.find((p) => p.id === profile.cegepProgramId)?.name ??
    null;
  const session = SESSIONS.find((s) => s.id === profile.currentSession);
  const targets = UNIVERSITY_PROGRAMS.filter((p) =>
    profile.targetUniversityProgramIds.includes(p.id),
  );
  const dec = findDecCoreCourses(profile.cegepProgramId);

  // Risks are DERIVED, never asserted. `UniversityProgram.prerequisites[].status` is a
  // hard-coded student-relative value in sample-data that is not tied to any real transcript
  // — using it would print "prerequisite not completed" about a student nobody has assessed.
  // program-eligibility deliberately ignores that field, and so does this page: a flag is
  // raised only when a prerequisite resolves to a course absent from a VERIFIED DEC core,
  // which is a statement about two catalogues, phrased as such.
  const risks = targets.flatMap((program) => {
    const flags: { program: string; text: string }[] = [];
    if (program.courseFloor) {
      flags.push({
        program: program.name,
        text: `${program.courseFloor.course} : seuil de ${formatScore(program.courseFloor.minGrade, "fr")}`,
      });
    }
    for (const reason of evaluatePrerequisites(dec, program).reasons) {
      if (reason.kind === "prereq_not_in_core" && reason.name) {
        flags.push({
          program: program.name,
          text: `${reason.name} ne fait pas partie du tronc commun de ton programme — à confirmer avec ton cégep.`,
        });
      }
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
      label: STATUS_LABEL[status],
      color: STATUS_COLOR[status],
      rangeLabel: range
        ? `${formatScore(range.low, "fr")}–${formatScore(range.high, "fr")} (${formatRangeYears(range)})`
        : "—",
    };
  });

  return (
    <div className="min-h-screen bg-chalk">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-6 print:hidden md:px-8">
        <Link
          href="/profile"
          className="flex items-center gap-1.5 text-[13px] font-semibold text-ink/60 hover:text-ink"
        >
          <ChevronLeft className="h-5 w-5" />
          Retour au profil
        </Link>
        <PrintButton />
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
          <div>
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
                  <span className="text-ink">
                    <span className="font-semibold">{risk.program} — </span>
                    {risk.text}
                  </span>
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
