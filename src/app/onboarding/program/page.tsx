"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Check, ChevronRight } from "lucide-react";
import { ScreenShell, ScreenHeading } from "@/components/onboarding/ScreenShell";
import { CEGEP_PROGRAMS, UNIVERSITY_PROGRAMS } from "@/lib/sample-data";
import { INTERESTS, type InterestId } from "@/lib/tags/interests";
import { INTEREST_QUIZ, tallyInterests } from "@/lib/matching/interest-quiz";
import { useStudentProfile } from "@/lib/profile/store";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Step = "program" | "future" | "specific" | "general" | "quiz";

export default function GoalPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const { profile, update } = useStudentProfile();

  const [step, setStep] = useState<Step>("program");
  const [cegepProgramId, setCegepProgramId] = useState<string | null>(profile.cegepProgramId);
  const [targetIds, setTargetIds] = useState<string[]>(profile.targetUniversityProgramIds);
  const [interestIds, setInterestIds] = useState<InterestId[]>(profile.interestIds);
  const [query, setQuery] = useState("");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizPicks, setQuizPicks] = useState<InterestId[]>([]);
  const [fromQuiz, setFromQuiz] = useState(false);

  const filteredPrograms = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? UNIVERSITY_PROGRAMS.filter(
          (p) => p.name.toLowerCase().includes(q) || p.institution.toLowerCase().includes(q),
        )
      : UNIVERSITY_PROGRAMS;
    return list;
  }, [query]);

  const matchedPrograms = useMemo(
    () =>
      interestIds.length === 0
        ? []
        : UNIVERSITY_PROGRAMS.filter((p) => p.interestIds.some((id) => interestIds.includes(id))),
    [interestIds],
  );

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
            onClick={() => setStep("future")}
            disabled={!cegepProgramId}
            className="flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98] disabled:opacity-40"
          >
            {t("common.continue")}
          </button>
        }
      >
        <ScreenHeading title={t("goal.programTitle")} body={t("goal.programBody")} />
        <div className="flex flex-col gap-2.5">
          {CEGEP_PROGRAMS.map((p) => {
            const selected = cegepProgramId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={selected}
                onClick={() => setCegepProgramId(p.id)}
                className={`flex min-h-[56px] items-center justify-between gap-3 rounded border px-4 py-3 text-left text-[15px] font-semibold transition-transform active:scale-[0.99] ${
                  selected
                    ? "border-ultramarine bg-ultramarine/[0.07] text-ultramarine"
                    : "border-ink/15 bg-paper text-ink"
                }`}
              >
                {p.name}
                {selected && <Check className="h-5 w-5 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </ScreenShell>
    );
  }

  if (step === "future") {
    return (
      <ScreenShell
        backHref="/onboarding/program"
        footer={
          <button
            type="button"
            onClick={finish}
            className="flex h-12 w-full items-center justify-center text-[14px] font-semibold text-ink/60"
          >
            {t("goal.skipStep")}
          </button>
        }
      >
        <ScreenHeading title={t("goal.futureTitle")} body={t("goal.futureBody")} />
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setStep("specific")}
            className="flex min-h-[64px] items-center justify-between gap-3 rounded border border-ink/15 bg-paper px-4 py-3.5 text-left text-[15px] font-semibold text-ink transition-transform active:scale-[0.99]"
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
            className="flex min-h-[64px] items-center justify-between gap-3 rounded border border-ink/15 bg-paper px-4 py-3.5 text-left text-[15px] font-semibold text-ink transition-transform active:scale-[0.99]"
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
            className="flex min-h-[64px] items-center justify-between gap-3 rounded border-[1.5px] border-ultramarine bg-ultramarine/[0.07] px-4 py-3.5 text-left text-[15px] font-semibold text-ultramarine transition-transform active:scale-[0.99]"
          >
            {t("goal.quiz")}
            <ChevronRight className="h-5 w-5 flex-shrink-0" />
          </button>
        </div>
      </ScreenShell>
    );
  }

  if (step === "quiz") {
    const question = INTEREST_QUIZ[quizIndex];
    return (
      <ScreenShell backHref="/onboarding/program">
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
              className="flex min-h-[56px] items-center justify-between gap-3 rounded border border-ink/15 bg-paper px-4 py-3 text-left text-[15px] font-semibold text-ink transition-transform active:scale-[0.99]"
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
        backHref="/onboarding/program"
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
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={t("goal.searchProgram")}
            placeholder={t("goal.searchProgram")}
            autoComplete="off"
            className="h-[52px] w-full rounded border border-ink/15 bg-paper pl-11 pr-4 text-[16px] text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-[1.5px] focus:border-ultramarine"
          />
        </div>
        <div className="flex flex-col gap-2.5 pb-4">
          {filteredPrograms.length === 0 && (
            <p className="py-6 text-center text-[14px] text-ink/50">{t("goal.noProgram")}</p>
          )}
          {filteredPrograms.map((p) => {
            const selected = targetIds.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleTarget(p.id)}
                className={`flex min-h-[64px] items-center justify-between gap-3 rounded border px-4 py-3 text-left transition-transform active:scale-[0.99] ${
                  selected ? "border-ultramarine bg-ultramarine/[0.07]" : "border-ink/15 bg-paper"
                }`}
              >
                <span>
                  <span className={`block text-[15px] font-semibold ${selected ? "text-ultramarine" : "text-ink"}`}>
                    {p.name}
                  </span>
                  <span className="block text-[12.5px] text-ink/55">{p.institution}</span>
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
      backHref="/onboarding/program"
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
      <ul className="mb-6 flex flex-wrap gap-2">
        {INTERESTS.map((interest) => {
          const selected = interestIds.includes(interest.id);
          return (
            <li key={interest.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => toggleInterest(interest.id)}
                className={`flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-[13px] font-semibold transition-colors active:scale-[0.98] ${
                  selected ? "border-ultramarine bg-ultramarine text-paper" : "border-ink/20 bg-paper text-ink/70"
                }`}
              >
                {locale === "fr" ? interest.fr : interest.en}
              </button>
            </li>
          );
        })}
      </ul>

      {matchedPrograms.length > 0 && (
        <>
          <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-wide text-ink/45">
            {t("goal.matchesTitle")}
          </p>
          <div className="flex flex-col gap-2.5 pb-4">
            {matchedPrograms.map((p) => {
              const selected = targetIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleTarget(p.id)}
                  className={`flex min-h-[64px] items-center justify-between gap-3 rounded border px-4 py-3 text-left transition-transform active:scale-[0.99] ${
                    selected ? "border-ultramarine bg-ultramarine/[0.07]" : "border-ink/15 bg-paper"
                  }`}
                >
                  <span>
                    <span className={`block text-[15px] font-semibold ${selected ? "text-ultramarine" : "text-ink"}`}>
                      {p.name}
                    </span>
                    <span className="block text-[12.5px] text-ink/55">{p.institution}</span>
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
