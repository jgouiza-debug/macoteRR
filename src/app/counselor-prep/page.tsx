import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronLeft, TriangleAlert, CheckCircle2 } from "lucide-react";
import { SourceStamp } from "@/components/SourceStamp";

const PrintButton = dynamic(
  () => import("@/components/PrintButton").then((mod) => mod.PrintButton),
);
import { STUDENT_SAMPLE, UNIVERSITY_PROGRAMS, DASHBOARD_SAMPLE } from "@/lib/sample-data";
import { formatScore } from "@/lib/format";
import { getCutoffRange, compareToCutoffRange, formatRangeYears } from "@/lib/rscore/cutoff-range";

const TARGET_PROGRAM_IDS = ["hec-baa", "poly-genie-logiciel"];

export default function CounselorPrepPage() {
  const score = STUDENT_SAMPLE.rScoreEstimated;
  const targets = UNIVERSITY_PROGRAMS.filter((p) => TARGET_PROGRAM_IDS.includes(p.id));

  const risks = targets.flatMap((program) => {
    const flags: { program: string; text: string }[] = [];
    if (program.courseFloor) {
      flags.push({
        program: program.name,
        text: `${program.courseFloor.course} : seuil de ${formatScore(program.courseFloor.minGrade, "fr")}`,
      });
    }
    for (const req of program.prerequisites.filter((p) => p.status !== "met")) {
      flags.push({ program: program.name, text: `Préalable non complété : ${req.name}` });
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
          <Field label="Cégep" value={STUDENT_SAMPLE.cegep.name} />
          <Field label="Programme" value={STUDENT_SAMPLE.program.name} />
          <Field label="Session" value={STUDENT_SAMPLE.session.labelFr} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[17px] font-bold text-ink">Cote R</h2>
          <div className="flex flex-wrap gap-8">
            {DASHBOARD_SAMPLE.confirmedSessions.map((s) => (
              <div key={s.sessionFr}>
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink/50">
                  {s.sessionFr} · confirmée
                </p>
                <p className="font-display text-[24px] font-bold text-ink tabular-nums">
                  {formatScore(s.score, "fr", 2)}
                </p>
              </div>
            ))}
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink/50">
                {STUDENT_SAMPLE.session.labelFr} · estimation
              </p>
              <p className="font-display text-[24px] font-bold text-ink tabular-nums">
                ≈ {formatScore(score, "fr")}
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[17px] font-bold text-ink">Programmes ciblés</h2>
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
                  status === "above" ? "text-moss" : status === "below" ? "text-ember" : status === "inside" ? "text-ultramarine" : "text-ink/40";
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
                      <span className={`inline-flex items-center gap-1 text-[11.5px] font-semibold ${color}`}>
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
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-[17px] font-bold text-ink">Points à discuter</h2>
          {risks.length === 0 ? (
            <p className="text-[13px] text-ink/60">
              Aucun risque signalé pour les programmes ciblés.
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
            Estimation non officielle générée par MaCote. Ce document résume des données que
            l&rsquo;étudiant·e a saisies lui-même et sert d&rsquo;appui à une rencontre avec un
            conseiller d&rsquo;orientation — il ne remplace pas un avis professionnel.
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
