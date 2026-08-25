"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ExternalLink } from "lucide-react";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { StepProgress } from "@/components/onboarding/StepProgress";
import { Sheet } from "@/components/ui/Sheet";
import {
  CATALOG_UNIVERSITIES,
  INTEREST_DOMAINS,
  findUniversity,
  interestDomainLabel,
  universityProgramsForDomains,
  type InterestDomainId,
} from "@/lib/data/catalog";
import { useStudentProfile } from "@/lib/profile/store";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Stage = "domains" | "university" | "results";

/**
 * Step 4 — the university-choice quiz.
 *
 * It opens on a sheet with two honest doors: a student who already knows where they are
 * going should not be made to answer questions to get past this screen. Everyone else gets
 * two questions, which is all the scraped catalogue can honestly support — it carries program
 * names and links, not admission data, so the quiz narrows the 198-program list rather than
 * pretending to predict admission.
 */
export default function UniversityQuizPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const { profile, update } = useStudentProfile();

  const [introOpen, setIntroOpen] = useState(true);
  const [stage, setStage] = useState<Stage>("domains");
  const [domains, setDomains] = useState<InterestDomainId[]>([]);
  const [universityCode, setUniversityCode] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>(profile.targetUniversityProgramIds);

  const matchedPrograms = useMemo(() => universityProgramsForDomains(domains), [domains]);

  /**
   * Only universities that actually offer something in the chosen domains. Listing one whose
   * every program is filtered out would hand the student a choice that returns nothing.
   */
  const universityOptions = useMemo(() => {
    const codes = new Set(matchedPrograms.map((row) => row.program.universityShortCode));
    return CATALOG_UNIVERSITIES.filter((university) => codes.has(university.shortCode));
  }, [matchedPrograms]);

  const results = useMemo(
    () =>
      universityCode
        ? matchedPrograms.filter((row) => row.program.universityShortCode === universityCode)
        : matchedPrograms,
    [matchedPrograms, universityCode],
  );

  function toggleDomain(id: InterestDomainId) {
    setDomains((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

  function togglePicked(programId: string) {
    setPicked((prev) =>
      prev.includes(programId) ? prev.filter((id) => id !== programId) : [...prev, programId],
    );
  }

  /** Both exits — "I already know" and "finish" — write through here and land on sign-up. */
  function finish(targets: string[]) {
    update({ targetUniversityProgramIds: targets });
    router.push("/onboarding/account");
  }

  // The three stages live behind one URL, so "back" has to walk them before it leaves the
  // screen. Without this, stages 2 and 3 were dead ends in a funnel nobody can skip.
  const PREVIOUS_STAGE: Record<Stage, Stage | null> = {
    domains: null,
    university: "domains",
    results: "university",
  };
  const previousStage = PREVIOUS_STAGE[stage];

  return (
    <ScreenShell
      backHref={previousStage === null ? "/onboarding/score" : undefined}
      onBack={previousStage === null ? undefined : () => setStage(previousStage)}
      footer={
        stage === "domains" ? (
          <button
            type="button"
            disabled={domains.length === 0}
            onClick={() => setStage("university")}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            {t("common.next")}
            <ArrowRight className="h-[18px] w-[18px]" />
          </button>
        ) : stage === "university" ? (
          <button
            type="button"
            onClick={() => setStage("results")}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98]"
          >
            {t("common.next")}
            <ArrowRight className="h-[18px] w-[18px]" />
          </button>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => finish(picked)}
              className="flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98]"
            >
              {t("quiz.finish")}
            </button>
            <span className="text-[12px] text-ink/50">
              {t("quiz.selected").replace("{n}", String(picked.length))}
            </span>
          </div>
        )
      }
    >
      <StepProgress step="quiz" />

      {stage === "domains" && (
        <>
          <ScreenHeading title={t("quiz.domainsTitle")} body={t("quiz.domainsBody")} />
          <ul className="flex flex-wrap gap-2 pb-4">
            {INTEREST_DOMAINS.map((domain) => {
              const selected = domains.includes(domain.id);
              return (
                <li key={domain.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleDomain(domain.id)}
                    className={`flex min-h-[48px] items-center gap-2 rounded-full border px-4 text-[13.5px] font-semibold transition-colors active:scale-[0.98] ${
                      selected
                        ? "border-ultramarine bg-ultramarine text-paper"
                        : "border-ink/20 bg-paper text-ink/70"
                    }`}
                  >
                    {interestDomainLabel(domain.id, locale)}
                    {selected && <Check className="h-4 w-4" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {stage === "university" && (
        <>
          <ScreenHeading title={t("quiz.uniTitle")} body={t("quiz.uniBody")} />
          <div className="flex flex-col gap-2.5 pb-4">
            <button
              type="button"
              aria-pressed={universityCode === null}
              onClick={() => setUniversityCode(null)}
              className={`flex min-h-[56px] items-center justify-between gap-3 rounded px-4 py-3 text-left text-[15px] transition-colors ${
                universityCode === null
                  ? "border-[1.5px] border-ultramarine bg-ultramarine/[0.07] font-semibold text-ultramarine"
                  : "border border-ink/15 bg-paper text-ink"
              }`}
            >
              {t("quiz.uniAny")}
              {universityCode === null && <Check className="h-5 w-5 flex-shrink-0" />}
            </button>

            {universityOptions.map((university) => {
              const selected = universityCode === university.shortCode;
              return (
                <button
                  key={university.shortCode}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setUniversityCode(university.shortCode)}
                  className={`flex min-h-[56px] items-center justify-between gap-3 rounded px-4 py-3 text-left text-[15px] transition-colors ${
                    selected
                      ? "border-[1.5px] border-ultramarine bg-ultramarine/[0.07] font-semibold text-ultramarine"
                      : "border border-ink/15 bg-paper text-ink"
                  }`}
                >
                  <span className="wrap-fr leading-snug">{university.name}</span>
                  {selected && <Check className="h-5 w-5 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </>
      )}

      {stage === "results" && (
        <>
          <ScreenHeading
            title={t("quiz.resultsTitle")}
            body={t("quiz.resultsBody").replace("{n}", String(results.length))}
          />

          {results.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded border border-ink/12 bg-paper p-4">
              <p className="text-[13.5px] leading-relaxed text-ink/60">{t("quiz.resultsEmpty")}</p>
              <button
                type="button"
                onClick={() => setStage("domains")}
                className="text-[14px] font-semibold text-ultramarine"
              >
                {t("common.back")}
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-2.5 pb-4">
              {results.slice(0, 40).map(({ program, matches }) => {
                const selected = picked.includes(program.id);
                const university = findUniversity(program.universityShortCode);
                return (
                  <li
                    key={program.id}
                    className={`rounded border bg-paper p-3.5 transition-colors ${
                      selected ? "border-[1.5px] border-ultramarine" : "border-ink/15"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="wrap-fr text-[14px] font-semibold leading-snug text-ink">
                          {program.name}
                        </h3>
                        <p className="mt-0.5 text-[12px] text-ink/50">{university?.name}</p>
                        <p className="mt-1 text-[11.5px] text-ink/45">
                          {t("quiz.matchOn")}{" "}
                          {matches.map((id) => interestDomainLabel(id, locale)).join(" · ")}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => togglePicked(program.id)}
                        className={`flex h-9 flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[12.5px] font-semibold transition-colors active:scale-[0.97] ${
                          selected
                            ? "bg-ultramarine text-paper"
                            : "border border-ink/25 bg-paper text-ink/70"
                        }`}
                      >
                        {selected && <Check className="h-4 w-4" />}
                        {selected ? t("quiz.added") : t("quiz.add")}
                      </button>
                    </div>

                    {program.url && (
                      <a
                        href={program.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="mt-2 inline-flex items-center gap-1 text-[11.5px] text-ink/45 underline underline-offset-2"
                      >
                        {/* The institution is already on the line above — repeating it here
                            made every card say "Concordia University" twice. */}
                        {t("burs.details")}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {results.length > 40 && (
            <p className="pb-2 text-[12px] text-ink/45">
              {locale === "fr"
                ? `40 des ${results.length} programmes affichés. Affine tes domaines pour en voir d'autres.`
                : `Showing 40 of ${results.length}. Narrow your domains to see others.`}
            </p>
          )}

          <p className="mb-4 rounded bg-ink/[0.04] p-3.5 text-[12px] leading-relaxed text-ink/60">
            {t("quiz.noCutoff")}
          </p>
        </>
      )}

      <Sheet
        open={introOpen}
        onClose={() => setIntroOpen(false)}
        dismissible={false}
        title={t("quiz.introTitle")}
        footer={
          <>
            <button
              type="button"
              onClick={() => setIntroOpen(false)}
              className="flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98]"
            >
              {t("quiz.introTake")}
            </button>
            <button
              type="button"
              onClick={() => finish(profile.targetUniversityProgramIds)}
              className="flex h-12 w-full items-center justify-center rounded-full text-[14px] font-semibold text-ink/60"
            >
              {t("quiz.introKnow")}
            </button>
          </>
        }
      >
        <p className="text-[13.5px] leading-relaxed text-ink/70">{t("quiz.introBody")}</p>
      </Sheet>
    </ScreenShell>
  );
}
