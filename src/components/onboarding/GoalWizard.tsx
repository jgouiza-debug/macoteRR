"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Check, ChevronRight, Plus } from "lucide-react";
import { ScreenShell } from "@/components/onboarding/ScreenShell";
import { SourceStamp } from "@/components/SourceStamp";
import { ScoreValue } from "@/components/rscore/ScoreValue";
import type { UniversityProgram } from "@/lib/sample-data";
import { useReferenceCatalog } from "@/lib/data/reference-store";
import { decOfferingsAtCegep } from "@/lib/data/cegep-institutions";
import { resolveCegepName } from "@/lib/data/resolve-names";
import { universityLabel } from "@/lib/data/universities";
import { INTERESTS, interestLabel, type InterestId } from "@/lib/tags/interests";
import { INTEREST_QUIZ, tallyInterests } from "@/lib/matching/interest-quiz";
import { suggestTopUniversityPrograms } from "@/lib/matching/program-suggestions";
import { getGenericProgramProfile } from "@/lib/data/generic-program-profiles";
import { DecProgramProfileCard } from "@/components/programs/DecProgramProfileCard";
import {
  CUTOFF_STATUS_COLOR_CLASS,
  CUTOFF_STATUS_LABEL_KEY,
  compareToCutoffRange,
  formatRangeYears,
  getCutoffRange,
} from "@/lib/rscore/cutoff-range";
import { useStudentProfile, type StudentProfile } from "@/lib/profile/store";
import { useTargets } from "@/lib/profile/useTargets";
import { useFunnelNav, withFunnelParams } from "@/lib/profile/funnel-nav";
import { useOnboardingGuard } from "@/lib/profile/onboarding";
import { useHydrated } from "@/lib/hooks/useHydrated";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFormat } from "@/lib/i18n/useFormat";

type Step = "program" | "profile_picker" | "future" | "specific" | "general" | "quiz";

/** The two routes that share this component, named by the sub-step each opens on. */
export type WizardStart = "program" | "future";

/**
 * Which sub-steps each route may show. Sub-steps live in the URL (`?step=`) so the browser's
 * back button and the on-screen chevron agree; a `?step=` naming the other route's sub-step
 * (a pasted link, a stale bookmark) falls back to the route's own start.
 */
const ROUTE_STEPS: Record<WizardStart, readonly Step[]> = {
  program: ["program", "profile_picker"],
  future: ["future", "specific", "general", "quiz"],
};

function resolveStep(raw: string | null, start: WizardStart): Step {
  const allowed: readonly string[] = ROUTE_STEPS[start];
  return raw !== null && allowed.includes(raw) ? (raw as Step) : start;
}

const DEC_GROUPS = [
  { category: "Programme préuniversitaire" as const, labelKey: "goal.decPreUniversity" as const },
  { category: "Programme technique" as const, labelKey: "goal.decTechnical" as const },
  { category: "Cheminement particulier" as const, labelKey: "goal.decSpecial" as const },
];

/**
 * Where the quiz survives a refresh. sessionStorage, not localStorage: it is scoped to this
 * tab and dies with it, which is the right lifetime for four half-answered questions. Before
 * this, reloading mid-quiz reset it to question one with the answers gone.
 */
const QUIZ_STORAGE_KEY = "macote.goal.quiz";

type QuizDraft = { quizIndex: number; quizPicks: InterestId[]; fromQuiz: boolean };

const INTEREST_ID_SET = new Set<string>(INTERESTS.map((interest) => interest.id));

function readQuizDraft(): QuizDraft | null {
  try {
    const raw = window.sessionStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { quizIndex, quizPicks, fromQuiz } = parsed as {
      quizIndex?: unknown;
      quizPicks?: unknown;
      fromQuiz?: unknown;
    };
    if (!Array.isArray(quizPicks)) return null;
    const picks = quizPicks
      .filter((pick): pick is InterestId => typeof pick === "string" && INTEREST_ID_SET.has(pick))
      .slice(0, INTEREST_QUIZ.length);
    // The index never runs ahead of the answers: a draft claiming question 4 with one pick
    // would otherwise resume there and tally a two-answer quiz as if it were complete.
    const index =
      typeof quizIndex === "number" && Number.isInteger(quizIndex)
        ? Math.min(Math.max(quizIndex, 0), picks.length, INTEREST_QUIZ.length - 1)
        : 0;
    return { quizIndex: index, quizPicks: picks, fromQuiz: fromQuiz === true };
  } catch {
    // Storage blocked or corrupt: the quiz simply starts over.
    return null;
  }
}

function writeQuizDraft(draft: QuizDraft) {
  try {
    window.sessionStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* storage blocked — the quiz will not survive a refresh */
  }
}

function clearQuizDraft() {
  try {
    window.sessionStorage.removeItem(QUIZ_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * The profile fields the drafts are seeded from, as one comparable string. When it changes
 * under a mounted wizard — a reconcile adopting the server copy, another tab — the drafts are
 * stale and are seeded again; when a reconcile changes nothing, nothing is discarded.
 */
function seedSource(profile: StudentProfile): string {
  return JSON.stringify([
    profile.cegepProgramId,
    profile.decProfileId,
    profile.targetUniversityProgramIds,
    profile.interestIds,
  ]);
}

type Translate = ReturnType<typeof useLocale>["t"];
type Formatter = ReturnType<typeof useFormat>;

/**
 * The one thing a list row may say about a cutoff: the published range when the student has
 * no score yet, their position against that range when they do, or "not yet verified" when
 * nothing is published. Neither a prediction nor "open admission" — a missing range only means
 * we have not verified one (docs/00-BUILD-PROMPT.md, guardrail #5). `figure` flags the case
 * that shows a number, so the caller can put a SourceStamp beside it (guardrail #1).
 *
 * `estimated` is guardrail #2: a position measured from an estimate carries the leading "≈ "
 * and the dashed border, so it never reads as the position of a confirmed score.
 */
function cutoffChip(
  program: UniversityProgram,
  score: number | null,
  estimated: boolean,
  t: Translate,
  f: Formatter,
): { label: string; cls: string; figure: boolean } {
  const range = getCutoffRange(program.cutoffHistory);
  if (!range) {
    return {
      label: t("cutoff.unverified"),
      cls: "border border-ink/15 bg-ink/8 text-ink/65",
      figure: false,
    };
  }
  if (score === null) {
    return {
      label: t("goal.cutoffRange")
        .replace("{low}", f.score(range.low))
        .replace("{high}", f.score(range.high)),
      cls: "border border-ink/15 bg-ink/8 tabular-nums text-ink/70",
      figure: true,
    };
  }
  // The status word alone was a verdict with nothing to check it against; the chip now carries
  // the published range it compares to, which makes it a figure and earns it the stamp below.
  const status = compareToCutoffRange(score, range);
  return {
    label: `${estimated ? "≈ " : ""}${t(CUTOFF_STATUS_LABEL_KEY[status])} · ${t("cutoff.publishedRange").toLowerCase()} ${formatRangeYears(range)} : ${f.score(range.low)}–${f.score(range.high)}`,
    cls: `border ${estimated ? "border-dashed" : ""} border-ink/15 bg-paper font-semibold tabular-nums ${CUTOFF_STATUS_COLOR_CLASS[status]}`,
    figure: true,
  };
}

const PRIMARY_BUTTON =
  "flex h-14 w-full items-center justify-center rounded-full bg-ultramarine text-[15px] font-semibold text-paper shadow-card transition-transform active:scale-[0.98] disabled:opacity-40";

const CHOICE_ROW =
  "flex min-h-[60px] w-full items-center justify-between gap-3 rounded-xl border border-ink/15 bg-paper px-4 py-3 text-left text-[14.5px] font-semibold text-ink shadow-sm transition-transform active:scale-[0.99] hover:border-ink/30";

const CHIP_BASE =
  "flex min-h-[48px] items-center rounded-full px-3.5 text-[12.5px] font-semibold transition-colors active:scale-[0.98]";

export function GoalWizard({ startStep }: { startStep: WizardStart }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, locale } = useLocale();
  const f = useFormat();
  const { profile, update, sync } = useStudentProfile();
  const targets = useTargets();
  const { edit, next, hrefFor, finishStep } = useFunnelNav();
  const hydrated = useHydrated();
  // The live catalogue, not the shipped constant: a re-verified cutoff reaches this list on
  // the next boot without a redeploy (see reference-store.ts).
  const { universityPrograms } = useReferenceCatalog();

  useOnboardingGuard(startStep === "program" ? "program" : "goal");

  const step = resolveStep(searchParams.get("step"), startStep);

  // Drafts of the student's answers. They start empty and are seeded from the profile once
  // it is readable (below): a `useState(profile.x)` initialiser runs on the hydration pass,
  // when the store still hands out the empty server snapshot, and would freeze that
  // emptiness in — which is how a returning student's targets used to be overwritten with
  // only the ones they picked this visit.
  const [cegepProgramId, setCegepProgramId] = useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [targetIds, setTargetIds] = useState<string[]>([]);
  const [interestIds, setInterestIds] = useState<InterestId[]>([]);
  const [query, setQuery] = useState("");
  const [decQuery, setDecQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState("all");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizPicks, setQuizPicks] = useState<InterestId[]>([]);
  const [fromQuiz, setFromQuiz] = useState(false);
  /** What the drafts were last seeded from (see seedSource); null until the first seed. */
  const [seededFrom, setSeededFrom] = useState<string | null>(null);

  // The store's hydration snapshot is the empty profile, and a signed-in student's reconcile
  // may still be pulling the server copy. Nothing here is the student's real answer until the
  // sync has settled — and "unknown" is not settled: on a hard load it is the window before
  // the store has asked whether there is a session, when the local copy may be a fresh
  // device's empty profile. Seeding from it froze that emptiness into the drafts, and
  // finish/skip then wrote it over the DEC and targets the server held. Hooks all sit above
  // the skeleton return further down.
  const settled = sync === "guest" || sync === "synced" || sync === "error";
  const ready = hydrated && settled;
  const seed = ready ? seedSource(profile) : null;
  if (seed !== null && seed !== seededFrom) {
    setSeededFrom(seed);
    setCegepProgramId(profile.cegepProgramId);
    setSelectedProfileId(profile.decProfileId);
    setTargetIds(profile.targetUniversityProgramIds);
    // A finished quiz restored from sessionStorage (below) outranks the saved interests: its
    // result was on screen and never saved, so it is the fresher answer.
    setInterestIds(
      fromQuiz && quizPicks.length === INTEREST_QUIZ.length
        ? tallyInterests(quizPicks).slice(0, 2)
        : profile.interestIds,
    );
  }

  const cegepName = resolveCegepName(profile.cegepId);
  // Guardrail #2: a score whose status is not "confirmed" — estimated, or null for a profile
  // written before statuses existed — is shown as an estimate everywhere on this screen.
  const isConfirmed = profile.rScoreStatus === "confirmed";
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

  // A profile picked under another DEC is not an answer for this one.
  const validProfileId = activeProfiles.some((p) => p.id === selectedProfileId)
    ? selectedProfileId
    : null;

  const genericProfile = useMemo(
    () => getGenericProgramProfile(selectedDec?.programCode || cegepProgramId || ""),
    [selectedDec, cegepProgramId],
  );

  const topSuggestions = useMemo(
    () =>
      suggestTopUniversityPrograms(
        selectedDec?.programName || "Sciences",
        universityPrograms,
        8,
        selectedDec?.programCode,
      ),
    [selectedDec, universityPrograms],
  );

  // The chips come from the same list the filters run on (strict equality on `institution`),
  // so an institution the live bundle adds or corrects cannot leave a chip that filters to
  // nothing, or programmes reachable only under "all".
  const universities = useMemo(
    () => [
      { id: "all", label: t("goal.allUniversities") },
      ...[...new Set(universityPrograms.map((p) => p.institution))].map((id) => ({
        id,
        label: universityLabel(id),
      })),
    ],
    [t, universityPrograms],
  );

  const filteredPrograms = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = universityPrograms;
    if (selectedUniversity !== "all") {
      list = list.filter((p) => p.institution === selectedUniversity);
    }
    if (q) {
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.institution.toLowerCase().includes(q),
      );
    }
    return list;
  }, [query, selectedUniversity, universityPrograms]);

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
        : universityPrograms.filter((p) => p.interestIds.some((id) => interestIds.includes(id)));
    if (selectedUniversity !== "all") {
      list = list.filter((p) => p.institution === selectedUniversity);
    }
    return list;
  }, [interestIds, selectedUniversity, universityPrograms]);

  /* ------------------------------------------------------------------ *
   * Sub-step navigation
   *
   * `ownedRef` is the chain of sub-steps this mount pushed and has not yet left. When its top
   * is the step the chevron would go to, the previous history entry is ours and going back
   * through history is the honest move (the browser's own back button does the same thing).
   * Otherwise — a deep link, a refresh, the forward button — the previous step is pushed, so
   * the chevron never drops the student outside the wizard.
   * ------------------------------------------------------------------ */
  const ownedRef = useRef<Step[]>([]);
  const pushingRef = useRef(false);
  const lastStepRef = useRef(step);

  const pushStep = useCallback(
    (target: Step) => {
      // A second tap before the `?step=` effect has run would push `step` onto the chain twice
      // and leave a duplicate the chevron later walks back through against the wrong entry.
      if (pushingRef.current || target === step) return;
      ownedRef.current.push(step);
      pushingRef.current = true;
      router.push(withFunnelParams(`${pathname}?step=${target}`, { edit, next }));
    },
    [router, pathname, step, edit, next],
  );

  useEffect(() => {
    if (lastStepRef.current === step) return;
    lastStepRef.current = step;
    if (pushingRef.current) {
      pushingRef.current = false;
      return;
    }
    // The URL changed under us: browser back lands on the entry we pushed from (pop it);
    // anything else means the entries behind us are no longer known to be ours.
    const owned = ownedRef.current;
    if (owned[owned.length - 1] === step) owned.pop();
    else owned.length = 0;
  }, [step]);

  const goBackTo = useCallback(
    (target: Step) => {
      const owned = ownedRef.current;
      if (owned[owned.length - 1] === target) router.back();
      else pushStep(target);
    },
    [router, pushStep],
  );

  // A screen that swaps its content in place has to move focus with it, or a screen-reader
  // user is left announcing a heading that is no longer there. Quiz questions count as swaps.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusKey = step === "quiz" ? `quiz:${quizIndex}` : step;
  const focusKeyRef = useRef(focusKey);
  useEffect(() => {
    if (focusKeyRef.current === focusKey) return;
    focusKeyRef.current = focusKey;
    headingRef.current?.focus();
  }, [focusKey]);

  /* ------------------------------------------------------------------ *
   * Quiz persistence
   * ------------------------------------------------------------------ */
  useEffect(() => {
    const draft = readQuizDraft();
    if (!draft) return;
    // One-time sessionStorage read on mount, not a subscription to an external store.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuizIndex(draft.quizIndex);
    setQuizPicks(draft.quizPicks);
    setFromQuiz(draft.fromQuiz);
    // A finished quiz whose result screen was refreshed: the interests it produced were never
    // saved, so rebuild them from the answers rather than showing an empty result. (When the
    // profile seed above runs after this effect it derives the same thing.)
    if (draft.fromQuiz && draft.quizPicks.length === INTEREST_QUIZ.length) {
      setInterestIds(tallyInterests(draft.quizPicks).slice(0, 2));
    }
  }, []);

  /** Every quiz change goes through here, so what is on screen and what survives a refresh agree. */
  function commitQuiz(draft: QuizDraft) {
    setQuizIndex(draft.quizIndex);
    setQuizPicks(draft.quizPicks);
    setFromQuiz(draft.fromQuiz);
    writeQuizDraft(draft);
  }

  /* ------------------------------------------------------------------ *
   * Actions
   * ------------------------------------------------------------------ */
  function toggleTarget(id: string) {
    setTargetIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleInterest(id: InterestId) {
    setInterestIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  // This route never edits the DEC: it is written back as-is, and the fallback keeps a null
  // draft from ever clearing a DEC the profile already holds.
  const decToWrite = () => cegepProgramId ?? profile.cegepProgramId;

  /** The goal step, done: targets and interests saved. In edit mode this returns to `next`. */
  function finish() {
    targets.setAll(targetIds);
    update({ cegepProgramId: decToWrite(), interestIds, goalSkipped: false });
    clearQuizDraft();
    finishStep("/onboarding/account");
  }

  /** "Passer cette étape": on purpose, no targets — the dashboard reads `goalSkipped`. */
  function skip() {
    update({ goalSkipped: true, interestIds, cegepProgramId: decToWrite() });
    clearQuizDraft();
    finishStep("/onboarding/account");
  }

  function continueFromProgram() {
    if (isSH || isSN) {
      pushStep("profile_picker");
      return;
    }
    // A DEC without a profile picker cannot keep a profile picked under a previous DEC.
    update({ cegepProgramId, decProfileId: null });
    finishStep("/onboarding/score");
  }

  function continueFromProfile() {
    update({ cegepProgramId, decProfileId: validProfileId });
    finishStep("/onboarding/score");
  }

  function startQuiz() {
    commitQuiz({ quizIndex: 0, quizPicks: [], fromQuiz: false });
    pushStep("quiz");
  }

  function answerQuiz(interest: InterestId) {
    // The pick is stored at its question's own index, so answering a question a second time
    // (after a back) replaces the earlier answer instead of counting twice.
    const nextPicks = [...quizPicks.slice(0, quizIndex), interest];
    if (quizIndex + 1 < INTEREST_QUIZ.length) {
      commitQuiz({ quizIndex: quizIndex + 1, quizPicks: nextPicks, fromQuiz: false });
      return;
    }
    setInterestIds(tallyInterests(nextPicks).slice(0, 2));
    commitQuiz({ quizIndex, quizPicks: nextPicks, fromQuiz: true });
    pushStep("general");
  }

  function quizBack() {
    if (quizIndex > 0) {
      // Un-answer the previous question along with returning to it.
      commitQuiz({ quizIndex: quizIndex - 1, quizPicks: quizPicks.slice(0, -1), fromQuiz: false });
      return;
    }
    goBackTo("future");
  }

  function generalBack() {
    if (fromQuiz) {
      // Back to the last question means un-answering it; it is asked again on the way through.
      commitQuiz({ quizIndex, quizPicks: quizPicks.slice(0, -1), fromQuiz: true });
      goBackTo("quiz");
      return;
    }
    goBackTo("future");
  }

  /* ------------------------------------------------------------------ *
   * Render
   * ------------------------------------------------------------------ */
  const heading = (title: string, body?: string) => (
    <div className="mb-6 flex flex-col gap-2.5 pt-3">
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-[27px] font-bold leading-[1.15] tracking-tight text-ink outline-none"
      >
        {title}
      </h1>
      {body && <p className="text-[15px] leading-relaxed text-ink/60">{body}</p>}
    </div>
  );

  const universityChips = (
    <div className="mb-4 flex flex-wrap gap-1.5">
      {universities.map((uni) => {
        const isSelected = selectedUniversity === uni.id;
        return (
          <button
            key={uni.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => setSelectedUniversity(uni.id)}
            className={`flex min-h-[48px] items-center rounded-full px-3.5 text-[12px] font-semibold transition-colors ${
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
  );

  /** A selectable university program row: the whole row toggles; the stamp sits beside it. */
  const programRow = (p: UniversityProgram, extraChips?: string[]) => {
    const selected = targetIds.includes(p.id);
    const chip = cutoffChip(p, profile.rScore, !isConfirmed, t, f);
    return (
      <li key={p.id} className="flex flex-col gap-1">
        <button
          type="button"
          aria-pressed={selected}
          onClick={() => toggleTarget(p.id)}
          className={`flex min-h-[64px] w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-transform active:scale-[0.99] ${
            selected
              ? "border-ultramarine bg-ultramarine/[0.07] shadow-sm"
              : "border-ink/12 bg-paper hover:border-ink/30"
          }`}
        >
          <span className="min-w-0 flex-1">
            <span
              className={`block text-[14.5px] font-semibold ${selected ? "text-ultramarine" : "text-ink"}`}
            >
              {p.name}
            </span>
            <span className="block text-[12px] text-ink/55">{p.institution}</span>
            <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-[10.5px] ${chip.cls}`}>
                {chip.label}
              </span>
              {extraChips?.map((label) => (
                <span
                  key={label}
                  className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[10px] font-medium text-ink/70"
                >
                  {label}
                </span>
              ))}
            </span>
          </span>
          {selected && <Check aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-ultramarine" />}
        </button>
        {chip.figure && (
          <SourceStamp date={p.lastVerifiedAt} href={p.sourceUrl} className="px-4" />
        )}
      </li>
    );
  };

  // What every cutoff chip below is measured against. The three screens that show chips say
  // so once, under their heading, the way the programme list and the dashboard targets do:
  // an estimate is named as one, with the "≈" and the ESTIMATION badge (guardrail #2).
  const scoreLine =
    profile.rScore !== null ? (
      <p className="-mt-3 mb-5 text-[12.5px] text-ink/60">
        {t(isConfirmed ? "dash.yourScore" : "dash.yourEst")} :{" "}
        <ScoreValue value={profile.rScore} status={profile.rScoreStatus} size="inline" className="text-ink" />
        {!isConfirmed && (
          <span className="ml-1.5 rounded-full border border-dashed border-moss/60 px-1.5 text-[10px] font-semibold uppercase tracking-wider text-moss">
            {t("dash.estimated")}
          </span>
        )}
        <span className="text-ink/45"> · {t("dash.scoreEntered").toLowerCase()}</span>
      </p>
    ) : null;

  if (!ready) {
    return (
      <ScreenShell>
        <div aria-busy="true" className="flex flex-col gap-2.5">
          <div className="mb-6 flex flex-col gap-2.5 pt-3">
            <div className="h-8 w-3/4 animate-pulse rounded bg-ink/8 motion-reduce:animate-none" />
            <div className="h-4 w-full animate-pulse rounded bg-ink/6 motion-reduce:animate-none" />
          </div>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl border border-ink/8 bg-paper motion-reduce:animate-none"
            />
          ))}
        </div>
      </ScreenShell>
    );
  }

  // A profile picker reached by URL for a DEC that has no profiles is just the DEC picker.
  const view: Step = step === "profile_picker" && activeProfiles.length === 0 ? "program" : step;

  if (view === "program") {
    return (
      <ScreenShell
        backHref={hrefFor("/onboarding/cegep")}
        footer={
          cegepProgramId ? (
            <button type="button" onClick={continueFromProgram} className={PRIMARY_BUTTON}>
              {t("common.continue")}
            </button>
          ) : undefined
        }
      >
        {heading(
          t("goal.programTitle"),
          `${cegepName ? t("goal.programBodyAt").replace("{cegep}", cegepName) : t("goal.programBody")} ${t("goal.programThenProfile")}`,
        )}

        <div className="relative mb-3">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/40"
          />
          <input
            value={decQuery}
            onChange={(e) => setDecQuery(e.target.value)}
            type="search"
            aria-label={t("goal.searchDec")}
            placeholder={t("goal.searchDec")}
            autoComplete="off"
            className="h-[52px] w-full rounded-xl border border-ink/20 bg-paper pl-11 pr-4 text-[16px] text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-[1.5px] focus:border-ultramarine"
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
                      {selected ? (
                        <Check aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-ultramarine" />
                      ) : (
                        <ChevronRight aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-ink/35" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
          <div aria-live="polite">
            {filteredDecs.length === 0 && (
              <p className="py-8 text-center text-[14px] text-ink/50">{t("goal.noDec")}</p>
            )}
          </div>
        </div>
      </ScreenShell>
    );
  }

  if (view === "profile_picker") {
    return (
      <ScreenShell
        onBack={() => goBackTo("program")}
        footer={
          <button
            type="button"
            onClick={continueFromProfile}
            disabled={!validProfileId}
            className={PRIMARY_BUTTON}
          >
            {t("common.continue")}
          </button>
        }
      >
        {heading(t("goal.profileTitle"), t("goal.profileBody"))}

        <div className="flex flex-col gap-3 pb-4">
          {activeProfiles.map((p) => {
            const selected = validProfileId === p.id;
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
                {selected && (
                  <Check aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0 text-ultramarine" />
                )}
              </button>
            );
          })}
        </div>
      </ScreenShell>
    );
  }

  if (view === "future") {
    // A score with no status (a profile written before statuses existed) is not presented as
    // confirmed by default (guardrail #2): the student re-enters it on the score step instead.
    const resultsHref =
      profile.rScore !== null && profile.rScoreStatus !== null
        ? `/onboarding/results?score=${profile.rScore}&status=${profile.rScoreStatus}`
        : "/onboarding/score";
    // No sticky footer on this step. The skip sat pinned over the last suggestion card, so it
    // read as a caption on that card and competed with the three choices above it. It now
    // lives once, at the very end of the scroll: the last thing offered, not the first in reach.
    return (
      <ScreenShell backHref={hrefFor(resultsHref)}>
        {heading(t("goal.futureTitle"), t("goal.futureBody"))}
        {scoreLine}
        <div className="flex flex-col gap-2.5">
          <button type="button" onClick={() => pushStep("specific")} className={CHOICE_ROW}>
            {t("goal.specific")}
            <ChevronRight aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-ink/40" />
          </button>
          <button
            type="button"
            onClick={() => {
              commitQuiz({ quizIndex, quizPicks, fromQuiz: false });
              pushStep("general");
            }}
            className={CHOICE_ROW}
          >
            {t("goal.general")}
            <ChevronRight aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-ink/40" />
          </button>
          <button
            type="button"
            onClick={startQuiz}
            className="flex min-h-[60px] w-full items-center justify-between gap-3 rounded-xl border-[1.5px] border-ultramarine bg-ultramarine/[0.07] px-4 py-3 text-left text-[14.5px] font-semibold text-ultramarine shadow-sm transition-transform active:scale-[0.99]"
          >
            {t("goal.quiz")}
            <ChevronRight aria-hidden="true" className="h-5 w-5 flex-shrink-0" />
          </button>
        </div>

        {topSuggestions.length > 0 && (
          <div className="mt-6 flex flex-col gap-3">
            <p className="text-[12px] font-bold uppercase tracking-wider text-ink/60">
              {t("goal.catalogSuggestions")}
            </p>

            <ul aria-label={t("goal.catalogSuggestions")} className="flex list-none flex-col gap-2.5">
              {topSuggestions.map(({ item, match }) => {
                const isSelected = targetIds.includes(item.id);
                const chip = cutoffChip(item, profile.rScore, !isConfirmed, t, f);
                return (
                  <li
                    key={item.id}
                    className={`flex items-start justify-between gap-3 rounded-xl border p-3.5 shadow-sm transition-colors ${
                      isSelected ? "border-ultramarine bg-ultramarine/[0.05]" : "border-ink/12 bg-paper"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[14px] font-semibold text-ink">{item.name}</span>
                        <span className="rounded-full bg-ultramarine/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ultramarine">
                          {t("goal.suggested")}
                        </span>
                      </div>
                      <span className="mt-0.5 block text-[11.5px] text-ink/50">{item.institution}</span>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className={`rounded-full px-2 py-0.5 text-[10.5px] ${chip.cls}`}>
                          {chip.label}
                        </span>
                      </div>
                      {chip.figure && (
                        <SourceStamp date={item.lastVerifiedAt} href={item.sourceUrl} hostAsLabel className="mt-1" />
                      )}
                      <p className="mt-1 text-[11px] text-ink/55">
                        {t("goal.matchedOn")}{" "}
                        <span className="font-medium text-ink/75">{match.label}</span>
                        {match.kind === "profile" && <> · {t("goal.matchKindProfile")}</>}
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-pressed={isSelected}
                      aria-label={(isSelected ? t("goal.removeTarget") : t("goal.addTarget")).replace(
                        "{name}",
                        item.name,
                      )}
                      onClick={() => toggleTarget(item.id)}
                      className={`tap-spring flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border ${
                        isSelected
                          ? "border-ultramarine bg-ultramarine text-paper"
                          : "border-ink/20 bg-chalk/60 text-ink/60 hover:bg-chalk"
                      }`}
                    >
                      {isSelected ? (
                        <Check aria-hidden="true" className="h-5 w-5" />
                      ) : (
                        <Plus aria-hidden="true" className="h-5 w-5" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="text-[11px] leading-relaxed text-ink/50">
              {t("goal.catalogSuggestionsCaveat")}
            </p>
          </div>
        )}

        {/* The DEC reference card comes after the choices and the suggestions: it is background
            reading, and it used to push the programme picks four screens down. */}
        {selectedDec?.programCode && genericProfile && (
          <div className="mt-6">
            <DecProgramProfileCard
              programCode={selectedDec.programCode}
              cegepShortCode={profile.cegepId}
            />
          </div>
        )}

        {/* Suggestions added here are only saved by continuing; skipping saves none, on purpose. */}
        {targetIds.length > 0 && (
          <button type="button" onClick={finish} className={`${PRIMARY_BUTTON} mt-8`}>
            {t("common.continue")} ({t("goal.selectedCount").replace("{n}", String(targetIds.length))})
          </button>
        )}

        <button
          type="button"
          onClick={skip}
          className={`mb-2 flex h-12 w-full items-center justify-center text-[14px] font-semibold text-ink/50 transition-colors hover:text-ink/70 ${
            targetIds.length > 0 ? "mt-2" : "mt-8"
          }`}
        >
          {t("goal.skipStep")}
        </button>
      </ScreenShell>
    );
  }

  if (view === "quiz") {
    const question = INTEREST_QUIZ[quizIndex];
    return (
      <ScreenShell onBack={quizBack}>
        <p
          aria-live="polite"
          className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink/45"
        >
          {t("goal.quizQuestionOf")
            .replace("{n}", String(quizIndex + 1))
            .replace("{total}", String(INTEREST_QUIZ.length))}
        </p>
        {heading(locale === "fr" ? question.fr : question.en)}
        <div className="flex flex-col gap-2.5">
          {question.options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => answerQuiz(opt.interest)}
              className="flex min-h-[56px] items-center justify-between gap-3 rounded-xl border border-ink/15 bg-paper px-4 py-3 text-left text-[14.5px] font-semibold text-ink transition-transform active:scale-[0.99] hover:border-ink/30"
            >
              {locale === "fr" ? opt.fr : opt.en}
              <ChevronRight aria-hidden="true" className="h-5 w-5 flex-shrink-0 text-ink/40" />
            </button>
          ))}
        </div>
      </ScreenShell>
    );
  }

  if (view === "specific") {
    return (
      <ScreenShell
        onBack={() => goBackTo("future")}
        footer={
          <button
            type="button"
            onClick={finish}
            className={PRIMARY_BUTTON}
            disabled={targetIds.length === 0}
          >
            {t("common.continue")}
            {targetIds.length > 0 &&
              ` (${t("goal.selectedCount").replace("{n}", String(targetIds.length))})`}
          </button>
        }
      >
        {heading(t("goal.specificTitle"), t("goal.specificBody"))}
        {scoreLine}

        <div className="relative mb-3">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/40"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            aria-label={t("goal.searchProgram")}
            placeholder={t("goal.searchProgram")}
            autoComplete="off"
            className="h-[52px] w-full rounded-xl border border-ink/20 bg-paper pl-11 pr-4 text-[16px] text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-[1.5px] focus:border-ultramarine"
          />
        </div>

        {universityChips}

        <div aria-live="polite">
          {filteredPrograms.length === 0 && (
            <p className="py-6 text-center text-[14px] text-ink/50">{t("goal.noProgram")}</p>
          )}
        </div>
        <ul aria-label={t("goal.specificTitle")} className="flex list-none flex-col gap-2.5 pb-4">
          {filteredPrograms.map((p) => programRow(p))}
        </ul>
      </ScreenShell>
    );
  }

  // view === "general"
  return (
    <ScreenShell
      onBack={generalBack}
      footer={
        <button type="button" onClick={finish} className={PRIMARY_BUTTON}>
          {t("common.continue")}
        </button>
      }
    >
      {heading(
        fromQuiz ? t("goal.quizResultTitle") : t("goal.generalTitle"),
        fromQuiz ? t("goal.quizResultBody") : t("goal.generalBody"),
      )}
      {scoreLine}
      <ul aria-label={t("goal.generalTitle")} className="mb-4 flex list-none flex-wrap gap-2">
        {INTERESTS.map((interest) => {
          const selected = interestIds.includes(interest.id);
          return (
            <li key={interest.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => toggleInterest(interest.id)}
                className={`${CHIP_BASE} ${
                  selected
                    ? "border border-ultramarine bg-ultramarine text-paper shadow-sm"
                    : "border border-ink/20 bg-paper text-ink/70 hover:bg-chalk"
                }`}
              >
                {interestLabel(interest.id, locale)}
              </button>
            </li>
          );
        })}
      </ul>

      {universityChips}

      <p aria-live="polite" className="mb-2.5 text-[12px] font-bold uppercase tracking-wider text-ink/60">
        {matchedPrograms.length > 0 && `${t("goal.matchesTitle")} (${matchedPrograms.length})`}
      </p>
      {matchedPrograms.length > 0 && (
        <ul aria-label={t("goal.matchesTitle")} className="flex list-none flex-col gap-2.5 pb-4">
          {matchedPrograms.map((p) =>
            programRow(
              p,
              p.interestIds
                .filter((id) => interestIds.includes(id))
                .map((id) => interestLabel(id, locale)),
            ),
          )}
        </ul>
      )}
    </ScreenShell>
  );
}
