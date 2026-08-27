"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Check, ChevronRight, Plus } from "lucide-react";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { UNIVERSITY_PROGRAMS, type UniversityProgram } from "@/lib/sample-data";
import { decOfferingsAtCegep, findCegepInstitution } from "@/lib/data/cegep-institutions";
import { INTERESTS, type InterestId } from "@/lib/tags/interests";
import { INTEREST_QUIZ, tallyInterests } from "@/lib/matching/interest-quiz";
import { suggestTopUniversityPrograms } from "@/lib/matching/program-suggestions";
import { getGenericProgramProfile } from "@/lib/data/generic-program-profiles";
import { DecProgramProfileCard } from "@/components/programs/DecProgramProfileCard";
import { getCutoffRange } from "@/lib/rscore/cutoff-range";
import { useStudentProfile } from "@/lib/profile/store";
import { useOnboardingGuard } from "@/lib/profile/onboarding";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Step = "program" | "profile_picker" | "future" | "specific" | "general" | "quiz";

const DEC_GROUPS = [
  { category: "Programme préuniversitaire" as const, labelKey: "goal.decPreUniversity" as const },
  { category: "Programme technique" as const, labelKey: "goal.decTechnical" as const },
  { category: "Cheminement particulier" as const, labelKey: "goal.decSpecial" as const },
];

const UNIVERSITIES_FILTER = [
  { id: "all", label: "Toutes les universités" },
  { id: "Université Laval", label: "ULaval" },
  { id: "Université de Montréal", label: "UdeM" },
  { id: "McGill University", label: "McGill" },
  { id: "HEC Montréal", label: "HEC" },
  { id: "Polytechnique Montréal", label: "Polytechnique" },
  { id: "Université de Sherbrooke", label: "UdeS" },
  { id: "Concordia University", label: "Concordia" },
  { id: "Université du Québec à Montréal (UQAM)", label: "UQAM" },
  { id: "École de technologie supérieure (ÉTS)", label: "ÉTS" },
  { id: "Université du Québec à Trois-Rivières (UQTR)", label: "UQTR" },
  { id: "Université du Québec à Chicoutimi (UQAC)", label: "UQAC" },
  { id: "Université du Québec à Rimouski (UQAR)", label: "UQAR" },
  { id: "Université du Québec en Outaouais (UQO)", label: "UQO" },
  { id: "Université du Québec en Abitibi-Témiscamingue (UQAT)", label: "UQAT" },
  { id: "Bishop's University", label: "Bishop's" },
  { id: "Université TÉLUQ", label: "TÉLUQ" },
];

function getChanceBadge(program: UniversityProgram, score: number | null, locale: "fr" | "en") {
  const range = getCutoffRange(program.cutoffHistory);
  if (!range) {
    return {
      label: locale === "fr" ? "Non contingenté" : "Open admission",
      cls: "bg-ink/8 text-ink/65 border border-ink/15",
    };
  }
  if (score === null) {
    return {
      label: `${locale === "fr" ? "Seuil" : "Cutoff"} ${range.low.toFixed(1)}–${range.high.toFixed(1)}`,
      cls: "bg-ink/8 text-ink/70 border border-ink/15",
    };
  }
  if (score >= range.high) {
    return {
      label: locale === "fr" ? "Très accessible (Tu dépasses le seuil)" : "Very accessible (Above cutoff)",
      cls: "bg-moss/12 text-moss border border-moss/30 font-bold",
    };
  }
  if (score >= range.low - 1.0) {
    return {
      label: locale === "fr" ? "Dans la fourchette (Tu as tes chances)" : "Within reach (Good chance)",
      cls: "bg-ultramarine/12 text-ultramarine border border-ultramarine/30 font-bold",
    };
  }
  const gap = (range.low - score).toFixed(1);
  return {
    label: locale === "fr" ? `Cible ambitieuse (À travailler — écart de ${gap})` : `Ambitious target (Gap of ${gap})`,
    cls: "bg-ember/12 text-ember border border-ember/30 font-bold",
  };
}

export function GoalWizard({ startStep }: { startStep: Step }) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const { profile, update } = useStudentProfile();

  const [step, setStep] = useState<Step>(startStep);

  useOnboardingGuard(startStep === "program" ? "program" : "goal");
  const [cegepProgramId, setCegepProgramId] = useState<string | null>(profile.cegepProgramId);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [targetIds, setTargetIds] = useState<string[]>(profile.targetUniversityProgramIds);
  const [interestIds, setInterestIds] = useState<InterestId[]>(profile.interestIds);
  const [query, setQuery] = useState("");
  const [decQuery, setDecQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("all");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizPicks, setQuizPicks] = useState<InterestId[]>([]);
  const [fromQuiz, setFromQuiz] = useState(false);

  const cegep = findCegepInstitution(profile.cegepId);
  const decOfferings = useMemo(() => decOfferingsAtCegep(profile.cegepId), [profile.cegepId]);
  const selectedDec = decOfferings.find((p) => p.programCode === cegepProgramId);

  const isSH = Boolean(
    cegepProgramId?.startsWith("300") ||
      selectedDec?.programName.toLowerCase().includes("humaines") ||
      selectedDec?.programName.toLowerCase().includes("social"),
  );
  const isSN = Boolean(
    cegepProgramId?.startsWith("200") ||
      selectedDec?.programName.toLowerCase().includes("nature") ||
      selectedDec?.programName.toLowerCase().includes("natural"),
  );

  const activeProfiles = useMemo(() => {
    if (isSH) {
      return [
        { id: "admin_gestion", titleKey: "goal.shAdmin" as const, descKey: "goal.shAdminDesc" as const },
        { id: "individu_psycho", titleKey: "goal.shPsycho" as const, descKey: "goal.shPsychoDesc" as const },
        { id: "monde_societe", titleKey: "goal.shMonde" as const, descKey: "goal.shMondeDesc" as const },
        { id: "general", titleKey: "goal.shGeneral" as const, descKey: "goal.shGeneralDesc" as const },
      ];
    }
    if (isSN) {
      return [
        { id: "sante_vie", titleKey: "goal.snSante" as const, descKey: "goal.snSanteDesc" as const },
        { id: "pures_appliquees", titleKey: "goal.snPures" as const, descKey: "goal.snPuresDesc" as const },
        { id: "general", titleKey: "goal.snGeneral" as const, descKey: "goal.snGeneralDesc" as const },
      ];
    }
    return [];
  }, [isSH, isSN]);

  const genericProfile = useMemo(
    () => getGenericProgramProfile(selectedDec?.programCode || cegepProgramId || ""),
    [selectedDec, cegepProgramId],
  );

  const topSuggestions = useMemo(
    () =>
      suggestTopUniversityPrograms(
        selectedDec?.programName || "Sciences",
        UNIVERSITY_PROGRAMS,
        8,
        selectedDec?.programCode,
      ),
    [selectedDec],
  );

  // The top five come pre-selected, once per DEC. Seeding this from an effect re-ran the
  // merge on every pass, so unticking one of the five put it straight back and the checkmarks
  // could not be turned off. Keyed on the suggestion ids instead: a new DEC seeds a new set,
  // and within one set the student's own selections stand.
  const [seededFor, setSeededFor] = useState<string | null>(null);
  const suggestionKey = topSuggestions.map((s) => s.item.id).join("|");
  if (suggestionKey && seededFor !== suggestionKey) {
    setSeededFor(suggestionKey);
    const top5Ids = topSuggestions.slice(0, 5).map((s) => s.item.id);
    setTargetIds((prev) => Array.from(new Set([...prev, ...top5Ids])));
  }

  const filteredPrograms = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = UNIVERSITY_PROGRAMS;
    if (selectedUniversity !== "all") {
      list = list.filter((p) => p.institution === selectedUniversity || p.institution.includes(selectedUniversity));
    }
    if (q) {
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.institution.toLowerCase().includes(q),
      );
    }
    return list;
  }, [query, selectedUniversity]);

  const filteredDecs = useMemo(() => {
    const q = decQuery.trim().toLowerCase();
    if (!q) return decOfferings;
    return decOfferings.filter(
      (p) =>
        p.programName.toLowerCase().includes(q) || p.programCode.toLowerCase().includes(q),
    );
  }, [decQuery, decOfferings]);

  const matchedPrograms = useMemo(() => {
    let list =
      interestIds.length === 0
        ? []
        : UNIVERSITY_PROGRAMS.filter((p) => p.interestIds.some((id) => interestIds.includes(id)));
    if (selectedUniversity !== "all") {
      list = list.filter((p) => p.institution === selectedUniversity || p.institution.includes(selectedUniversity));
    }
    return list;
  }, [interestIds, selectedUniversity]);

  function toggleTarget(id: string) {
    setTargetIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleInterest(id: InterestId) {
    setInterestIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  

  function finish() {
    update({ cegepProgramId, targetUniversityProgramIds: targetIds, interestIds });
    router.push("/onboarding/account");
  }

  function answerQuiz(interest: InterestId) {
    const nextPicks = [...quizPicks, interest];
    if (quizIndex + 1 < INTEREST_QUIZ.length) {
      setQuizPicks(nextPicks);
      setQuizIndex((i) => i + 1);
      return;
    }
    setInterestIds(tallyInterests(nextPicks).slice(0, 2));
    setFromQuiz(true);
    setStep("general");
  }

  if (step === "program") {
    return (
      <ScreenShell
        backHref="/onboarding/cegep"
        footer={
          <button
            type="button"
            onClick={() => {
              if (isSH || isSN) {
                setStep("profile_picker");
              } else {
                update({ cegepProgramId });
                router.push("/onboarding/score");
              }
            }}
            disabled={!cegepProgramId}
            className="flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            {t("common.continue")}
          </button>
        }
      >
        <ScreenHeading
          title={t("goal.programTitle")}
          body={
            cegep
              ? t("goal.programBodyAt").replace("{cegep}", cegep.name)
              : t("goal.programBody")
          }
        />

        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/40" />
          <input
            value={decQuery}
            onChange={(e) => setDecQuery(e.target.value)}
            aria-label={t("goal.searchDec")}
            placeholder={t("goal.searchDec")}
            autoComplete="off"
            className="h-[52px] w-full rounded-xl border border-ink/20 bg-paper pl-11 pr-4 text-[15px] text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-[1.5px] focus:border-ultramarine"
          />
        </div>

        <div className="flex flex-col gap-4 pb-4">
          {DEC_GROUPS.map((group) => {
            const items = filteredDecs.filter((p) => p.category === group.category);
            if (items.length === 0) return null;
            return (
              <div key={group.category} className="flex flex-col gap-2.5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">
                  {t(group.labelKey)}
                </p>
                {items.map((p) => {
                  const selected = cegepProgramId === p.programCode;
                  return (
                    <button
                      key={p.programCode}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setCegepProgramId(p.programCode)}
                      className={`flex min-h-[56px] items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-transform active:scale-[0.99] ${
                        selected
                          ? "border-ultramarine bg-ultramarine/[0.07] shadow-sm"
                          : "border-ink/15 bg-paper hover:border-ink/30"
                      }`}
                    >
                      <span>
                        <span
                          className={`block text-[15px] font-semibold ${selected ? "text-ultramarine" : "text-ink"}`}
                        >
                          {p.programName}
                        </span>
                        <span className="block text-[12px] tabular-nums text-ink/45">
                          {p.programCode}
                        </span>
                      </span>
                      {selected && <Check className="h-5 w-5 flex-shrink-0 text-ultramarine" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
          {filteredDecs.length === 0 && (
            <p className="py-8 text-center text-[14px] text-ink/50">{t("goal.noDec")}</p>
          )}
        </div>
      </ScreenShell>
    );
  }

  if (step === "profile_picker") {
    return (
      <ScreenShell
        onBack={() => setStep("program")}
        footer={
          <button
            type="button"
            onClick={() => {
              update({ cegepProgramId });
              router.push("/onboarding/score");
            }}
            disabled={!selectedProfileId}
            className="flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            {t("common.continue")}
          </button>
        }
      >
        <ScreenHeading
          title={t("goal.profileTitle")}
          body={t("goal.profileBody")}
        />

        <div className="flex flex-col gap-3 pb-4">
          {activeProfiles.map((p) => {
            const selected = selectedProfileId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedProfileId(p.id)}
                className={`flex min-h-[64px] items-start justify-between gap-3 rounded-xl border p-4 text-left transition-transform active:scale-[0.99] ${
                  selected
                    ? "border-ultramarine bg-ultramarine/[0.07] shadow-sm"
                    : "border-ink/15 bg-paper hover:border-ink/30"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span
                    className={`block text-[15px] font-semibold ${selected ? "text-ultramarine" : "text-ink"}`}
                  >
                    {t(p.titleKey)}
                  </span>
                  <span className="block text-[12.5px] leading-relaxed text-ink/55">
                    {t(p.descKey)}
                  </span>
                </div>
                {selected && <Check className="h-5 w-5 flex-shrink-0 text-ultramarine mt-0.5" />}
              </button>
            );
          })}
        </div>
      </ScreenShell>
    );
  }

  if (step === "future") {
    const resultsHref =
      profile.rScore !== null
        ? `/onboarding/results?score=${profile.rScore}&status=${profile.rScoreStatus ?? "confirmed"}`
        : "/onboarding/score";
    // No sticky footer on this step. The skip sat pinned over the last suggestion card, so it
    // read as a caption on that card and competed with the three choices above it. It now
    // lives once, at the very end of the scroll: the last thing offered, not the first in reach.
    return (
      <ScreenShell backHref={resultsHref}>
        <ScreenHeading title={t("goal.futureTitle")} body={t("goal.futureBody")} />
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => setStep("specific")}
            className="flex min-h-[60px] items-center justify-between gap-3 rounded-xl border border-ink/15 bg-paper px-4 py-3 text-left text-[14.5px] font-semibold text-ink shadow-sm transition-transform active:scale-[0.99] hover:border-ink/30"
          >
            {t("goal.specific")}
            <ChevronRight className="h-5 w-5 flex-shrink-0 text-ink/40" />
          </button>
          <button
            type="button"
            onClick={() => {
              setFromQuiz(false);
              setStep("general");
            }}
            className="flex min-h-[60px] items-center justify-between gap-3 rounded-xl border border-ink/15 bg-paper px-4 py-3 text-left text-[14.5px] font-semibold text-ink shadow-sm transition-transform active:scale-[0.99] hover:border-ink/30"
          >
            {t("goal.general")}
            <ChevronRight className="h-5 w-5 flex-shrink-0 text-ink/40" />
          </button>
          <button
            type="button"
            onClick={() => {
              setQuizIndex(0);
              setQuizPicks([]);
              setStep("quiz");
            }}
            className="flex min-h-[60px] items-center justify-between gap-3 rounded-xl border-[1.5px] border-ultramarine bg-ultramarine/[0.07] px-4 py-3 text-left text-[14.5px] font-semibold text-ultramarine shadow-sm transition-transform active:scale-[0.99]"
          >
            {t("goal.quiz")}
            <ChevronRight className="h-5 w-5 flex-shrink-0" />
          </button>
        </div>

        {selectedDec?.programCode && genericProfile && (
          <div className="mt-6">
            <DecProgramProfileCard
              programCode={selectedDec.programCode}
              cegepShortCode={profile.cegepId}
            />
          </div>
        )}

        {topSuggestions.length > 0 && (
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-bold uppercase tracking-wider text-ink/60">
                {t("goal.catalogSuggestions")}
              </p>
            </div>

            <div className="flex flex-col gap-2.5">
              {topSuggestions.map(({ item }) => {
                const isSelected = targetIds.includes(item.id);
                const badge = getChanceBadge(item, profile.rScore, locale);
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-all shadow-sm ${
                      isSelected
                        ? "border-ultramarine bg-ultramarine/[0.05]"
                        : "border-ink/12 bg-paper hover:border-ink/30"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="block text-[14px] font-semibold text-ink">
                          {item.name}
                        </span>
                      </div>
                      <span className="mt-0.5 block text-[11.5px] text-ink/50">
                        {item.institution}
                      </span>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className={`rounded-full px-2 py-0.5 text-[10.5px] ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label="Sélectionner le programme"
                      onClick={() => toggleTarget(item.id)}
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border transition-transform active:scale-[0.92] ${
                        isSelected
                          ? "border-ultramarine bg-ultramarine text-paper"
                          : "border-ink/20 bg-chalk/60 text-ink/60 hover:bg-chalk"
                      }`}
                    >
                      {isSelected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={finish}
          className="mb-2 mt-8 flex h-12 w-full items-center justify-center text-[14px] font-semibold text-ink/50 transition-colors hover:text-ink/70"
        >
          {t("goal.skipStep")}
        </button>
      </ScreenShell>
    );
  }

  if (step === "quiz") {
    const question = INTEREST_QUIZ[quizIndex];
    return (
      <ScreenShell
        onBack={() => {
          if (quizIndex > 0) setQuizIndex((i) => i - 1);
          else setStep("future");
        }}
      >
        <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink/45">
          {t("goal.quizQuestionOf").replace("{n}", String(quizIndex + 1)).replace("{total}", String(INTEREST_QUIZ.length))}
        </p>
        <ScreenHeading title={locale === "fr" ? question.fr : question.en} />
        <div className="flex flex-col gap-2.5">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => answerQuiz(opt.interest)}
              className="flex min-h-[56px] items-center justify-between gap-3 rounded-xl border border-ink/15 bg-paper px-4 py-3 text-left text-[14.5px] font-semibold text-ink transition-transform active:scale-[0.99] hover:border-ink/30"
            >
              {locale === "fr" ? opt.fr : opt.en}
              <ChevronRight className="h-5 w-5 flex-shrink-0 text-ink/40" />
            </button>
          ))}
        </div>
      </ScreenShell>
    );
  }

  if (step === "specific") {
    return (
      <ScreenShell
        onBack={() => setStep("future")}
        footer={
          <button
            type="button"
            onClick={finish}
            className="flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98] disabled:opacity-40"
            disabled={targetIds.length === 0}
          >
            {t("common.continue")}
            {targetIds.length > 0 && ` (${t("goal.selectedCount").replace("{n}", String(targetIds.length))})`}
          </button>
        }
      >
        <ScreenHeading title={t("goal.specificTitle")} body={t("goal.specificBody")} />



        {/* Search */}
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t("goal.searchProgram")}
            placeholder={t("goal.searchProgram")}
            autoComplete="off"
            className="h-[50px] w-full rounded-xl border border-ink/20 bg-paper pl-11 pr-4 text-[14.5px] text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-[1.5px] focus:border-ultramarine"
          />
        </div>

        {/* University Filter Chips */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {UNIVERSITIES_FILTER.map((uni) => {
            const isSelected = selectedUniversity === uni.id;
            return (
              <button
                key={uni.id}
                type="button"
                onClick={() => setSelectedUniversity(uni.id)}
                className={`rounded-full px-3 py-1 text-[11.5px] font-semibold transition-all ${
                  isSelected
                    ? "bg-ultramarine text-paper shadow-sm"
                    : "border border-ink/15 bg-paper text-ink/70 hover:bg-chalk"
                }`}
              >
                {uni.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2.5 pb-4">
          {filteredPrograms.length === 0 && (
            <p className="py-6 text-center text-[14px] text-ink/50">{t("goal.noProgram")}</p>
          )}
          {filteredPrograms.map((p) => {
            const selected = targetIds.includes(p.id);
            const badge = getChanceBadge(p, profile.rScore, locale);
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleTarget(p.id)}
                className={`flex min-h-[64px] items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-transform active:scale-[0.99] ${
                  selected ? "border-ultramarine bg-ultramarine/[0.07] shadow-sm" : "border-ink/12 bg-paper hover:border-ink/30"
                }`}
              >
                <span className="flex-1">
                  <span className={`block text-[14.5px] font-semibold ${selected ? "text-ultramarine" : "text-ink"}`}>
                    {p.name}
                  </span>
                  <span className="block text-[12px] text-ink/55">{p.institution}</span>
                  <span className="mt-1.5 inline-block">
                    <span className={`rounded-full px-2 py-0.5 text-[10.5px] ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </span>
                </span>
                {selected && <Check className="h-5 w-5 flex-shrink-0 text-ultramarine" />}
              </button>
            );
          })}
        </div>
      </ScreenShell>
    );
  }

  // step === "general"
  return (
    <ScreenShell
      onBack={() => {
        if (fromQuiz) setStep("quiz");
        else setStep("future");
      }}
      footer={
        <button
          type="button"
          onClick={finish}
          className="flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98]"
        >
          {t("common.continue")}
        </button>
      }
    >
      <ScreenHeading
        title={fromQuiz ? t("goal.quizResultTitle") : t("goal.generalTitle")}
        body={fromQuiz ? t("goal.quizResultBody") : t("goal.generalBody")}
      />
      <ul className="mb-4 flex flex-wrap gap-2">
        {INTERESTS.map((interest) => {
          const selected = interestIds.includes(interest.id);
          return (
            <li key={interest.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => toggleInterest(interest.id)}
                className={`flex min-h-[42px] items-center gap-2 rounded-full border px-3.5 text-[12.5px] font-semibold transition-colors active:scale-[0.98] ${
                  selected ? "border-ultramarine bg-ultramarine text-paper shadow-sm" : "border-ink/20 bg-paper text-ink/70 hover:bg-chalk"
                }`}
              >
                {locale === "fr" ? interest.fr : interest.en}
              </button>
            </li>
          );
        })}
      </ul>

      {/* University filter in general step too */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {UNIVERSITIES_FILTER.map((uni) => {
          const isSelected = selectedUniversity === uni.id;
          return (
            <button
              key={uni.id}
              type="button"
              onClick={() => setSelectedUniversity(uni.id)}
              className={`rounded-full px-3 py-1 text-[11.5px] font-semibold transition-all ${
                isSelected
                  ? "bg-ultramarine text-paper shadow-sm"
                  : "border border-ink/15 bg-paper text-ink/70 hover:bg-chalk"
              }`}
            >
              {uni.label}
            </button>
          );
        })}
      </div>

      {matchedPrograms.length > 0 && (
        <>
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-[12px] font-bold uppercase tracking-wider text-ink/60">
              {t("goal.matchesTitle")} ({matchedPrograms.length})
            </p>
          </div>
          <div className="flex flex-col gap-2.5 pb-4">
            {matchedPrograms.map((p) => {
              const selected = targetIds.includes(p.id);
              const badge = getChanceBadge(p, profile.rScore, locale);
              const matchingInterestLabels = p.interestIds
                .filter((id) => interestIds.includes(id))
                .map((id) =>
                  locale === "fr"
                    ? INTERESTS.find((i) => i.id === id)?.fr
                    : INTERESTS.find((i) => i.id === id)?.en,
                )
                .filter(Boolean);

              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleTarget(p.id)}
                  className={`flex min-h-[64px] items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-transform active:scale-[0.99] ${
                    selected ? "border-ultramarine bg-ultramarine/[0.07] shadow-sm" : "border-ink/12 bg-paper hover:border-ink/30"
                  }`}
                >
                  <span className="flex-1">
                    <span
                      className={`block text-[14.5px] font-semibold ${selected ? "text-ultramarine" : "text-ink"}`}
                    >
                      {p.name}
                    </span>
                    <span className="block text-[12px] text-ink/55">{p.institution}</span>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10.5px] ${badge.cls}`}>
                        {badge.label}
                      </span>
                      {matchingInterestLabels.map((lbl) => (
                        <span
                          key={lbl}
                          className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[10px] font-medium text-ink/70"
                        >
                          {lbl}
                        </span>
                      ))}
                    </div>
                  </span>
                  {selected && <Check className="h-5 w-5 flex-shrink-0 text-ultramarine" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </ScreenShell>
  );
}
