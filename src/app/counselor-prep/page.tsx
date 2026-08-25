"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronLeft, TriangleAlert, CheckCircle2 } from "lucide-react";
import { SourceStamp } from "@/components/SourceStamp";
import { CEGEPS, CEGEP_PROGRAMS, SESSIONS, UNIVERSITY_PROGRAMS } from "@/lib/sample-data";
import { useStudentProfile } from "@/lib/profile/store";
import { formatScore } from "@/lib/format";
import { getCutoffRange, compareToCutoffRange, formatRangeYears } from "@/lib/rscore/cutoff-range";
import { evaluatePrerequisites, findDecCoreCourses } from "@/lib/matching/program-eligibility";

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

  useEffect(() => {
    if (hydrated && profile.rScore === null) router.replace("/onboarding");
  }, [hydrated, profile.rScore, router]);

  if (!hydrated || profile.rScore === null) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-chalk px-5">
        <p className="text-[14px] text-ink/60">Chargement…</p>
      </div>
    );
  }

  const score = profile.rScore;
  const isConfirmed = profile.rScoreStatus === "confirmed";
  const cegep = CEGEPS.find((c) => c.id === profile.cegepId);
  const cegepProgram = CEGEP_PROGRAMS.find((p) => p.id === profile.cegepProgramId);
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

      <main className="mx-auto flex max-w-3xl flex-col gap-8 bg-paper px-6 py-10 shadow-card print:shadow-none md:px-12">
        <header className="flex items-start justify-between gap-6 border-b border-ink/10 pb-6">
          <div>
            <span className="font-display text-[20px] font-bold tracking-tight text-ink">
              MaCote
            </span>
            <p className="mt-1 text-[13px] text-ink/60">
              Préparation de rencontre — conseiller d&rsquo;orientation
            </p>
          </div>
          <p className="text-right text-[11px] text-ink/50">
            Généré le{" "}
            {new Date().toLocaleDateString("fr-CA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </header>

        <section className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Cégep" value={cegep?.name ?? "Non précisé"} />
          <Field
            label="Programme"
            value={cegepProgram ? `${cegepProgram.name} (${cegepProgram.id})` : "Non précisé"}
          />
          <Field label="Session" value={session?.labelFr ?? "Non précisée"} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[17px] font-bold text-ink">Cote R</h2>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink/50">
              {session ? `${session.labelFr} · ` : ""}
              {isConfirmed ? "confirmée par le cégep" : "estimation non officielle"}
            </p>
            <p className="font-display text-[24px] font-bold text-ink tabular-nums">
              {!isConfirmed && "≈ "}
              {formatScore(score, "fr", 2)}
            </p>
          </div>
          {!isConfirmed && (
            <p className="text-[12px] leading-relaxed text-ink/55">
              Cette cote est une estimation calculée à partir des notes saisies par
              l&rsquo;étudiant·e, et non un chiffre transmis par le cégep.
            </p>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[17px] font-bold text-ink">Programmes ciblés</h2>
          {targets.length === 0 ? (
            <p className="text-[13px] text-ink/60">
              Aucun programme ciblé pour l&rsquo;instant.
            </p>
          ) : (
            <table className="w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-ink/15 text-[10.5px] font-semibold uppercase tracking-wider text-ink/50">
                  <th className="py-2">Programme</th>
                  <th className="py-2">Cotes publiées</th>
                  <th className="py-2 text-right">Statut</th>
                </tr>
              </thead>
              <tbody>
                {targets.map((program) => {
                  const range = getCutoffRange(program.cutoffHistory);
                  const status = compareToCutoffRange(score, range);
                  const label =
                    status === "above"
                      ? "Au-dessus"
                      : status === "inside"
                        ? "Dans la fourchette"
                        : status === "below"
                          ? "En dessous"
                          : "Non vérifié";
                  const color =
                    status === "above"
                      ? "text-moss"
                      : status === "below"
                        ? "text-ember"
                        : status === "inside"
                          ? "text-ultramarine"
                          : "text-ink/40";
                  return (
                    <tr key={program.id} className="border-b border-ink/10">
                      <td className="py-3">
                        <div className="font-semibold text-ink">{program.name}</div>
                        <div className="text-[11.5px] text-ink/50">{program.institution}</div>
                        <SourceStamp date={program.lastVerifiedAt} href={program.sourceUrl} />
                      </td>
                      <td className="py-3 tabular-nums text-ink/70">
                        {range
                          ? `${formatScore(range.low, "fr")}–${formatScore(range.high, "fr")} (${formatRangeYears(range)})`
                          : "—"}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-[11.5px] font-semibold ${color}`}
                        >
                          {status === "above" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <TriangleAlert className="h-4 w-4" />
                          )}
                          {label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
