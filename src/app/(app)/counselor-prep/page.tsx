"use client";

/**
 * FRENCH-ONLY BODY, ON PURPOSE.
 *
 * This is the one page a student prints and hands to a Quebec guidance counsellor. The sheet
 * itself (headings, field labels, the score caption, the gap sentences, the footer
 * disclaimer, fr-CA number formatting) is deliberately written as French literals rather than
 * routed through t(): its reader is the counsellor, not the student, and the counsellor's
 * working language is French whatever the student picked in the app. Only the chrome that
 * exists on screen and never reaches paper — the back link, the print button, the bottom nav,
 * the empty state — follows the UI locale through t(). The cutoff status words come from the
 * shared CUTOFF_STATUS_LABEL_KEY vocabulary (read in French) so this sheet can never drift
 * from the app's "Au-dessus / Dans la fourchette / En dessous / Pas encore vérifié" wording.
 *
 * What the paper must do (the gauntlet's checklist for this piece): fit one Letter page, read
 * in greyscale (a word or a signed number carries every status, never a colour or a tick), and
 * stamp every figure with where it came from and when it was verified. It reports differences
 * between the student's cote R and published ranges; it never issues a verdict on admission.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Printer, TriangleAlert } from "lucide-react";
import { SourceStamp, sourceHost } from "@/components/SourceStamp";
import { ScoreValue } from "@/components/rscore/ScoreValue";
import { EmptyState } from "@/components/ui/EmptyState";
import { BottomNav } from "@/components/app-shell/BottomNav";
import { useReferenceCatalog } from "@/lib/data/reference-store";
import { getDeadlinesForStudent } from "@/lib/data/important-dates";
import { resolveCegepName, resolveDecName } from "@/lib/data/resolve-names";
import { useStudentProfile } from "@/lib/profile/store";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { DICTIONARY } from "@/lib/i18n/dictionary";
import { formatDate, formatScore, formatSignedScore } from "@/lib/format";
import { daysUntil } from "@/lib/dates";
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
const BOTTOM_NAV_CLEARANCE = "pb-[calc(3.0625rem+env(safe-area-inset-bottom)*0.5)] md:pb-0 print:pb-0";

/** How many upcoming dates the sheet lists: enough for a meeting, few enough for one page. */
const MAX_DATES = 6;

/** The four status words, in French whatever the UI locale (the sheet is paper, in French). */
const STATUS_WORD_FR: Record<CutoffStatus, string> = {
  above: DICTIONARY.fr[CUTOFF_STATUS_LABEL_KEY.above],
  inside: DICTIONARY.fr[CUTOFF_STATUS_LABEL_KEY.inside],
  below: DICTIONARY.fr[CUTOFF_STATUS_LABEL_KEY.below],
  unknown: DICTIONARY.fr[CUTOFF_STATUS_LABEL_KEY.unknown],
};

/** The status word, lower-cased for mid-sentence use ("+0,20 au-dessus de la fourchette"). */
const STATUS_PHRASE_FR: Record<CutoffStatus, string> = {
  above: "au-dessus de la fourchette",
  inside: "dans la fourchette publiée",
  below: "sous la fourchette",
  unknown: "pas de cote publiée vérifiée",
};

/**
 * The one page a student PRINTS and hands to a guidance counsellor. Everything here comes from
 * the student's own profile and the verified catalogue; anything the product does not actually
 * know is stated as unknown rather than filled in.
 */
export default function CounselorPrepPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { profile, sync } = useStudentProfile();
  const hydrated = useHydrated();
  const { sessions, universityPrograms, deadlines } = useReferenceCatalog();

  // Nothing below may be decided on the hydration snapshot (an empty profile) or while a
  // signed-in student's first reconcile is still pulling their real profile onto this device.
  const settled = hydrated && sync !== "syncing";

  // Gated on the cégep, NOT on the score: a first-session student deliberately has no cote R
  // (the ministry has not computed one yet), and this page is most useful to exactly them. A
  // missing score is something the document reports as unknown.
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
  const today = new Date();
  const enteredOn = profile.rScoreUpdatedAt ? ` le ${formatDate(profile.rScoreUpdatedAt, "fr")}` : "";
  const recordedFor = session ? `Cote enregistrée pour la ${session.labelFr} · ` : "";

  // Derived once: the phone renders these as cards and everything wider renders them as table
  // rows, and the two must never disagree about a student's standing. The "écart" is plain
  // arithmetic against the published range (score minus the high bound when above it, minus
  // the low bound when below it); it is printed as a signed number so a counsellor reads the
  // difference instead of computing it, and so greyscale paper still carries it.
  const targetRows = targets.map((program) => {
    const range = getCutoffRange(program.cutoffHistory);
    const status: CutoffStatus = score === null ? "unknown" : compareToCutoffRange(score, range);
    const margin =
      score !== null && range && status === "above"
        ? score - range.high
        : score !== null && range && status === "below"
          ? score - range.low
          : null;
    return {
      program,
      status,
      word: STATUS_WORD_FR[status],
      phrase: score === null ? "sans cote R à comparer" : STATUS_PHRASE_FR[status],
      marginLabel: margin === null ? null : formatSignedScore(margin, "fr", 2),
      color: CUTOFF_STATUS_COLOR_CLASS[status],
      rangeLabel: range
        ? `${formatScore(range.low, "fr")}–${formatScore(range.high, "fr")} (${formatRangeYears(range)})`
        : "—",
    };
  });

  // Gaps are DERIVED, never asserted: a flag is raised only when a published prerequisite
  // resolves to a course absent from a VERIFIED DEC core (a statement about two catalogues,
  // phrased as such), or when the programme publishes a course-grade floor. `dec_only` and
  // `prereq_outside_catalogue` are NOT gaps and are never printed as one.
  const gaps = targets.flatMap((program) => {
    const flags: { program: string; text: string; date: string; href: string }[] = [];
    const stamp = { date: program.lastVerifiedAt, href: program.sourceUrl };
    if (program.courseFloor) {
      flags.push({
        program: program.name,
        text: `${program.courseFloor.course} : seuil publié de ${formatScore(program.courseFloor.minGrade, "fr")}`,
        ...stamp,
      });
    }
    for (const reason of evaluatePrerequisites(dec, program).reasons) {
      if (reason.kind !== "prereq_not_in_core" || !reason.name) continue;
      flags.push({
        program: program.name,
        text: `${reason.name} ne figure pas dans la liste de cours MaCote pour ce programme collégial (liste sans date de vérification) : à confirmer avec le cégep.`,
        ...stamp,
      });
    }
    return flags;
  });

  // Upcoming dates for the targets (and general ones), nearest first, capped for the page.
  const upcoming = getDeadlinesForStudent(profile.targetUniversityProgramIds, deadlines)
    .map((d) => ({ d, days: daysUntil(d.dateIso, today) }))
    .filter((x) => x.days !== null && x.days >= 0)
    .sort((a, b) => a.d.dateIso.localeCompare(b.d.dateIso))
    .slice(0, MAX_DATES);

  // What each target publishes as a prerequisite, in the university's own words.
  const prereqLines = targets.map((p) =>
    p.prerequisites.length > 0
      ? p.prerequisites.map((r) => r.name).join(" · ")
      : "DEC reconnu, aucun cours précis publié",
  );

  const stamp = (date: string, href?: string) => (
    <SourceStamp date={date} href={href} locale="fr" hostAsLabel className="mt-0.5" />
  );

  // When every row of a section was verified on the same day, the date is said once in the
  // section head and each row keeps only its host: the same provenance, without the same six
  // words typeset on every line. Rows that differ keep their full stamp.
  const targetsVerified = sharedDate(targets.map((p) => p.lastVerifiedAt));
  const datesVerified = sharedDate(upcoming.map((x) => x.d.lastVerifiedAt));
  const prereqHosts = [...new Set(targets.map((p) => sourceHost(p.sourceUrl)).filter(Boolean))];
  const rowSource = (date: string, href: string, shared: string | null) =>
    shared ? <HostLink href={href} /> : stamp(date, href);

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

      <main className="print-sheet mx-auto flex max-w-3xl flex-col gap-6 bg-paper px-4 py-7 shadow-card print:gap-4 print:px-0 print:py-0 print:shadow-none sm:gap-7 sm:px-6 sm:py-9 md:px-12">
        <header className="flex flex-col gap-3 border-b border-ink/10 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink/50">
              MaCote · document d&rsquo;appui
            </p>
            <h1 className="font-display text-[20px] font-bold leading-tight tracking-tight text-ink">
              Préparation de rencontre en orientation
            </h1>
          </div>
          <div className="text-[11.5px] leading-relaxed text-ink/60 sm:text-right">
            <p>
              Généré le{" "}
              {today.toLocaleDateString("fr-CA", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            {/* A line to write the student's name on paper: the product never stores a name. */}
            <p className="hidden print:block">
              Étudiant ou étudiante :{" "}
              <span aria-hidden="true" className="inline-block w-44 border-b border-ink/40 align-baseline" />
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <Field label="Cégep" value={cegepName ?? "Non précisé"} />
          <Field
            label="Programme collégial"
            value={
              cegepProgramName
                ? `${cegepProgramName}${profile.cegepProgramId ? ` (${profile.cegepProgramId})` : ""}`
                : "Non précisé"
            }
          />
          <Field label="Session en cours" value={session?.labelFr ?? "Non précisée"} />
        </section>

        {/* The score is the biggest thing on the page: a counsellor skimming for ten seconds
            finds it first. Guardrail #2: an estimate carries "≈ ", the dashed frame and its
            caption; a confirmed score carries none of them. */}
        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6 print:break-inside-avoid">
          <div className="flex flex-col gap-1">
            <h2 className="text-[10.5px] font-semibold uppercase tracking-wider text-ink/50">Cote R</h2>
            {score === null ? (
              <p className="font-display text-[46px] font-extrabold leading-none tabular-nums text-ink/30">
                —
              </p>
            ) : (
              <span className="self-start">
                <ScoreValue
                  value={score}
                  status={profile.rScoreStatus}
                  size="hero"
                  framed={!isConfirmed}
                  badge="never"
                  decimals={2}
                  locale="fr"
                  className="text-ink"
                />
              </span>
            )}
          </div>
          <div className="flex flex-col gap-0.5 text-[12.5px] leading-snug text-ink/70">
            {score === null ? (
              <>
                <p>Pas encore calculée par le ministère.</p>
                <p className="text-ink/50">
                  La première cote R suit la transmission des notes de groupe de la première
                  session. Les programmes ciblés sont listés avec leurs cotes publiées, sans
                  comparaison.
                </p>
              </>
            ) : isConfirmed ? (
              <>
                <p className="font-semibold text-ink">
                  Confirmée par le cégep, saisie par l&rsquo;étudiant ou l&rsquo;étudiante{enteredOn}.
                </p>
                <p className="text-ink/50">{recordedFor}À vérifier sur le relevé de notes officiel.</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-ink">
                  Estimation non officielle, calculée à partir des notes saisies{enteredOn}.
                </p>
                <p className="text-ink/50">{recordedFor}Ce n&rsquo;est pas un chiffre transmis par le cégep.</p>
              </>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-3 print:break-inside-avoid">
          <SectionHead
            title="Programmes ciblés"
            stamp={targetsVerified ? `Cotes publiées vérifiées le ${formatDate(targetsVerified, "fr")}` : null}
          />
          {targetRows.length === 0 ? (
            <p className="text-[13px] text-ink/60">Aucun programme ciblé pour l&rsquo;instant.</p>
          ) : (
            <>
              {/* Cards on a phone, the table from sm up. Paper is always at least letter width,
                  so what prints is the table. */}
              <ul className="flex flex-col gap-2.5 sm:hidden print:hidden">
                {targetRows.map(({ program, rangeLabel, marginLabel, phrase, color }) => (
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
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-ink/50">
                          Cotes publiées
                        </p>
                        <p className="text-[13px] tabular-nums text-ink/80">{rangeLabel}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-display text-[17px] font-bold leading-none tabular-nums ${color}`}>
                          {marginLabel ?? "—"}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ink/60">{phrase}</p>
                      </div>
                    </div>
                    {rowSource(program.lastVerifiedAt, program.sourceUrl, targetsVerified)}
                  </li>
                ))}
              </ul>

              <table className="hidden w-full border-collapse text-left text-[13px] sm:table print:table">
                <thead>
                  <tr className="border-b border-ink/15 text-[10.5px] font-semibold uppercase tracking-wider text-ink/50">
                    <th className="py-2 pr-3">Programme</th>
                    <th className="py-2 pr-3">Cotes publiées</th>
                    <th className="py-2 text-right">Écart</th>
                  </tr>
                </thead>
                <tbody>
                  {targetRows.map(({ program, rangeLabel, marginLabel, phrase, color }) => (
                    <tr key={program.id} className="border-b border-ink/10 align-top">
                      <td className="py-2.5 pr-3">
                        <div className="font-semibold text-ink">{program.name}</div>
                        <div className="text-[11.5px] text-ink/50">
                          {program.institution}
                          {targetsVerified && (
                            <>
                              {" · "}
                              <HostLink href={program.sourceUrl} />
                            </>
                          )}
                        </div>
                        {!targetsVerified && stamp(program.lastVerifiedAt, program.sourceUrl)}
                      </td>
                      <td className="py-2.5 pr-3 tabular-nums text-ink/80">{rangeLabel}</td>
                      <td className="py-2.5 text-right">
                        <div className={`font-display text-[17px] font-bold leading-none tabular-nums ${color}`}>
                          {marginLabel ?? "—"}
                        </div>
                        <div className="mt-0.5 text-[11px] text-ink/60">{phrase}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[11px] leading-relaxed text-ink/50">
                Écart : cote R moins la borne haute (au-dessus) ou la borne basse (en dessous) de
                la fourchette publiée. Un écart décrit deux chiffres, pas une probabilité
                d&rsquo;admission.
              </p>
            </>
          )}
        </section>

        {targets.length > 0 && (
          <section className="flex flex-col gap-3 print:break-inside-avoid">
            <SectionHead
              title="Préalables publiés"
              stamp={
                targetsVerified
                  ? `Vérifiés le ${formatDate(targetsVerified, "fr")} · ${prereqHosts.join(", ")}`
                  : null
              }
            />
            {/* Only what the universities publish, stamped by the head above. MaCote's own DEC
                course lists carry no verification date yet, so no comparison verdict is printed
                from them: the counsellor checks these against the cégep's grille de cours. */}
            {prereqLines.every((l) => l === prereqLines[0]) ? (
              // The same published requirement for every target: said once, not per programme.
              <p className="text-[12.5px] leading-snug text-ink">
                <span className="font-semibold">
                  {targets.length > 1 ? "Tous les programmes ciblés : " : `${targets[0].name} : `}
                </span>
                <span className="text-ink/70">{prereqLines[0]}</span>
              </p>
            ) : (
              <ul className="flex flex-col gap-1 text-[12.5px] leading-snug text-ink">
                {targets.map((p, i) => (
                  <li key={p.id} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                    <span className="font-semibold sm:w-72 sm:flex-shrink-0">{p.name}</span>
                    <span className="text-ink/70">{prereqLines[i]}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[11px] leading-relaxed text-ink/45">
              À confirmer avec la grille de cours du programme collégial
              {profile.cegepProgramId ? ` (${profile.cegepProgramId})` : ""}. Entrevue, test,
              portfolio et contingentement ne sont pas couverts par ce document.
            </p>
            {gaps.length === 0 ? null : (
              <ul className="flex flex-col gap-2">
                {gaps.map((gap, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded border border-ember/40 bg-ember/5 p-3 text-[13px] print:bg-transparent"
                  >
                    <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-ember" aria-hidden="true" />
                    <div className="flex flex-col gap-1">
                      <span className="text-ink">
                        <span className="font-semibold">{gap.program} : </span>
                        {gap.text}
                      </span>
                      {/* Guardrail #1: the grade floor is a figure, so it carries its source. */}
                      {rowSource(gap.date, gap.href, targetsVerified)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {!targetsVerified && (
              <ul className="flex flex-col gap-0.5">
                {targets.map((p) => (
                  <li key={p.id} className="text-[11px] text-ink/45">
                    {p.name} : {stamp(p.lastVerifiedAt, p.sourceUrl)}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <section className="flex flex-col gap-3 print:break-inside-avoid">
          <SectionHead
            title="Dates à venir"
            stamp={datesVerified ? `Dates vérifiées le ${formatDate(datesVerified, "fr")}` : null}
          />
          {upcoming.length === 0 ? (
            <p className="text-[12.5px] text-ink/60">
              Aucune date à venir dans le calendrier vérifié pour ces programmes.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-ink/10">
              {upcoming.map(({ d }) => (
                <li key={d.id} className="grid grid-cols-1 gap-x-4 py-2 sm:grid-cols-[9.5rem_1fr]">
                  <p className="text-[12.5px] font-semibold tabular-nums text-ink">
                    {formatDate(d.dateIso, "fr")}
                  </p>
                  <div>
                    <p className="text-[13px] leading-snug text-ink">
                      {d.titleFr}
                      {d.institution ? ` · ${d.institution}` : ""}
                      {datesVerified && (
                        <>
                          {" · "}
                          <HostLink href={d.sourceUrl} />
                        </>
                      )}
                    </p>
                    {!datesVerified && stamp(d.lastVerifiedAt, d.sourceUrl)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="border-t border-ink/10 pt-4">
          <p className="text-[11px] leading-relaxed text-ink/50">
            Document généré par MaCote à partir des données saisies par l&rsquo;étudiant ou l&rsquo;étudiante. Les
            cotes publiées proviennent de sources publiques, ne sont pas officielles et peuvent
            accuser plusieurs années de retard sur le cycle d&rsquo;admission en cours. Ce
            document appuie une rencontre ; il ne remplace ni un avis professionnel ni les
            données officielles du cégep.
          </p>
        </footer>
      </main>

      <div className="print:hidden">
        <BottomNav />
      </div>
    </div>
  );
}

/** The one ISO date every item shares, or null when they differ (or there are none). */
function sharedDate(dates: string[]): string | null {
  return dates.length > 0 && dates.every((d) => d === dates[0]) ? dates[0] : null;
}

function SectionHead({ title, stamp }: { title: string; stamp?: string | null }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
      <h2 className="font-display text-[17px] font-bold text-ink">{title}</h2>
      {stamp && <p className="text-[11px] text-ink/45">{stamp}</p>}
    </div>
  );
}

/** The source's host as a link ("ulaval.ca"): the row's share of a section-level stamp. */
function HostLink({ href }: { href: string }) {
  const host = sourceHost(href);
  if (!host) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-[11px] text-ink/45 underline underline-offset-2 hover:text-ink"
    >
      {host}
    </a>
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
