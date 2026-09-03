/**
 * The gauntlet loop's piece registry: what we build, which real screen of a public open-source app it is
 * measured against (bar-sources.ts), and what "ours wins" means. Every builder round and every critic verdict is keyed on
 * these ids. The bar captures live under docs/gauntlet/bar/<id>/ (see manifest.json there).
 */
import { STATES, type StateSeed } from "../screenshots/walk";

export type ViewportName = "phone" | "desktop";

export type Shot = {
  /** Short name used in file names. */
  name: string;
  route: string;
  seed: StateSeed;
  fullPage?: boolean;
};

export type Piece = {
  id: string;
  title: string;
  /** The real screen this piece is measured against (see bar-sources.ts for its origin). */
  bar: string;
  /** "Ours wins only if …" — the critic is told this verbatim. */
  win: string;
  /** Our screens for this piece; the first one is the blind-compare primary. */
  ours: Shot[];
  /** Which viewport the blind pick is judged on first. */
  primaryViewport: ViewportName;
  /** Files the builder may edit for this piece. */
  files: string[];
  /** Pieces in the same group share files and run one at a time. */
  group: "shell" | "onboarding" | "goal" | "dashboard" | "programs" | "bursaries" | "profile" | "prep";
  /** No bar: judged by checklist, not a blind pick. */
  checklistOnly?: boolean;
};

const MED = "universite-doctorat-de-1er-cycle-en-medec";

const cegepOnly: StateSeed = {
  profile: { cegepId: "sainte-foy", cegepProgramId: null, currentSession: null, rScore: null, rScoreStatus: null, selfTags: [], targetUniversityProgramIds: [], interestIds: [] },
  seenWelcome: true,
};
const preScore: StateSeed = {
  profile: { cegepId: "sainte-foy", cegepProgramId: "200.B1", currentSession: null, rScore: null, rScoreStatus: null, selfTags: [], targetUniversityProgramIds: [], interestIds: [] },
  seenWelcome: true,
};
const preGoal: StateSeed = {
  profile: { cegepId: "sainte-foy", cegepProgramId: "200.B1", currentSession: 3, rScore: 31.2, rScoreStatus: "confirmed", selfTags: [], targetUniversityProgramIds: [], interestIds: [] },
  seenWelcome: true,
};
const withGrades: StateSeed = {
  profile: {
    ...(STATES.confirmed.profile as Record<string, unknown>),
    courseGrades: [
      { session: 3, course: "Calcul différentiel", grade: 88 },
      { session: 3, course: "Chimie générale", grade: 91 },
      { session: 3, course: "Littérature", grade: 82 },
    ],
    confirmations: [{ session: 3, officialCoteR: 31.2 }],
  },
  seenWelcome: true,
};

export const PIECES: Piece[] = [
  {
    id: "S1", title: "App shell (nav, session chip, install guide)", group: "shell", primaryViewport: "phone",
    bar: "NewPipe: What's New feed with top app bar and three-tab bottom nav",
    win: "no \"??\" anywhere, a clear active state on the current tab, every target 48px, the install guide only where installing makes sense",
    ours: [{ name: "dashboard", route: "/dashboard", seed: STATES.confirmed }, { name: "first-session", route: "/dashboard", seed: STATES["first-session"] }],
    files: ["src/components/app-shell/TopNav.tsx", "src/components/app-shell/BottomNav.tsx", "src/components/app-shell/AppShell.tsx", "src/components/app-shell/Footer.tsx", "src/components/app-shell/nav-items.ts", "src/components/pwa/IosInstallGuide.tsx"],
  },
  {
    id: "S2", title: "Empty / loading / error set", group: "shell", primaryViewport: "phone",
    bar: "Wikipedia: empty reading list with a single 'Create new' action",
    win: "skeletons match the final geometry, errors offer a retry, every empty state names the next action",
    ours: [{ name: "empty-bursaries", route: "/bursaries", seed: STATES["first-session"] }, { name: "empty-dashboard", route: "/dashboard", seed: STATES["first-session"], fullPage: true }, { name: "offline", route: "/~offline", seed: STATES.confirmed }],
    files: ["src/components/ui/EmptyState.tsx", "src/app/(app)/loading.tsx", "src/app/(app)/error.tsx", "src/app/onboarding/loading.tsx", "src/app/onboarding/error.tsx", "src/app/~offline/page.tsx"],
  },
  {
    id: "O1", title: "Welcome", group: "onboarding", primaryViewport: "phone",
    bar: "Tusky: welcome / login: illustration, one field, one button, one help link",
    win: "one promise, one action, the mark animation under 600ms and honouring reduced motion, no scroll at 390×844",
    ours: [{ name: "welcome", route: "/onboarding/welcome", seed: STATES.new }],
    files: ["src/app/onboarding/welcome/WelcomeScreen.tsx", "src/app/onboarding/welcome/page.tsx"],
  },
  {
    id: "O2", title: "Cégep picker", group: "onboarding", primaryViewport: "phone",
    bar: "Wikipedia: language picker, a long searchable list",
    win: "instant filter, 56px rows, the selected state readable at arm's length, keyboard-walkable",
    ours: [{ name: "cegep", route: "/onboarding/cegep", seed: STATES.new, fullPage: true }],
    files: ["src/app/onboarding/cegep/CegepScreen.tsx", "src/app/onboarding/cegep/page.tsx"],
  },
  {
    id: "O3", title: "DEC + profile picker", group: "goal", primaryViewport: "phone",
    bar: "StreetComplete: 'What kind of building is this?' typed list with descriptions",
    win: "grouped headers, \"Sciences de la nature\" findable in under a second, the profile step explains itself in one line",
    ours: [{ name: "program", route: "/onboarding/program", seed: cegepOnly, fullPage: true }],
    files: ["src/components/onboarding/GoalWizard.tsx", "src/app/onboarding/program/ProgramScreen.tsx", "src/components/programs/DecProgramProfileCard.tsx"],
  },
  {
    id: "O4", title: "Session / score chooser", group: "onboarding", primaryViewport: "phone",
    bar: "Fossify Calendar: view chooser: a short radio list in a sheet",
    win: "three paths ranked by confidence, the estimate caveat one tap away, nothing persisted before commitment",
    ours: [{ name: "score", route: "/onboarding/score", seed: preScore }],
    files: ["src/app/onboarding/score/ScoreScreen.tsx", "src/app/onboarding/score/page.tsx"],
  },
  {
    id: "O5", title: "Confirm-score entry", group: "onboarding", primaryViewport: "phone",
    bar: "StreetComplete: house-number quest: one big field and a type dropdown",
    win: "one giant input, a decimal keypad, inline validation, Enter submits, no focus theft on touch",
    ours: [{ name: "confirm", route: "/onboarding/score/confirm", seed: preScore }],
    files: ["src/app/onboarding/score/confirm/ConfirmScoreScreen.tsx"],
  },
  {
    id: "O6", title: "Estimate entry", group: "onboarding", primaryViewport: "phone",
    bar: "StreetComplete: opening-hours rows with add/other/no/yes",
    win: "rows add and remove without a layout jump, the running ≈ total always visible, the caveat not dismissible",
    ours: [{ name: "estimate", route: "/onboarding/score/estimate", seed: preScore, fullPage: true }],
    files: ["src/app/onboarding/score/estimate/EstimateScoreScreen.tsx"],
  },
  {
    id: "O7", title: "Starting screen", group: "onboarding", primaryViewport: "phone",
    bar: "Mastodon: server rules: a numbered list you accept before continuing",
    win: "three sourced promises, confirm before wiping a score, the CTA says what happens next",
    ours: [{ name: "starting", route: "/onboarding/score/starting", seed: preScore }],
    files: ["src/app/onboarding/score/starting/StartingScreen.tsx"],
  },
  {
    id: "O8", title: "Results", group: "onboarding", primaryViewport: "phone",
    bar: "Loop Habit Tracker: habit history: bar chart and calendar",
    win: "the headline derived from stamped data, the curve carries a SourceStamp, no percentile claims",
    ours: [{ name: "results", route: "/onboarding/results?score=28.4&status=estimated", seed: STATES.estimated, fullPage: true }],
    files: ["src/components/rscore/ResultsView.tsx", "src/components/rscore/DistributionCurve.tsx", "src/app/onboarding/results/page.tsx"],
  },
  {
    id: "O9", title: "Goal wizard", group: "goal", primaryViewport: "phone",
    bar: "StreetComplete: quest question with illustration and 'other answers / confirm'",
    win: "back symmetric with the browser, the quiz never double-counts, suggestions visibly suggestions, skip saves nothing extra",
    ours: [{ name: "goal", route: "/onboarding/goal", seed: preGoal, fullPage: true }],
    files: ["src/components/onboarding/GoalWizard.tsx", "src/app/onboarding/goal/GoalScreen.tsx", "src/lib/matching/program-suggestions.ts"],
  },
  {
    id: "O10", title: "Account / OTP", group: "onboarding", primaryViewport: "phone",
    bar: "Element: sign-up form (username, password, create)",
    win: "the code path first, refresh-safe, an expired-link state, the next parameter preserved end to end",
    ours: [{ name: "account", route: "/onboarding/account", seed: STATES.confirmed }],
    files: ["src/app/onboarding/account/AccountScreen.tsx"],
  },
  {
    id: "A1", title: "Dashboard score card", group: "dashboard", primaryViewport: "phone",
    bar: "Loop Habit Tracker: habit detail: score, month, year, total strip over a chart",
    win: "confirmed vs estimated unmistakable (≈, dashed, badge), a first session has a real next action",
    ours: [{ name: "confirmed", route: "/dashboard", seed: withGrades }, { name: "estimated", route: "/dashboard", seed: STATES.estimated }, { name: "first-session", route: "/dashboard", seed: STATES["first-session"] }],
    files: ["src/components/dashboard/ScoreCard.tsx", "src/components/dashboard/WhatIfSheet.tsx", "src/components/rscore/ScoreValue.tsx"],
  },
  {
    id: "A2", title: "Dashboard targets", group: "dashboard", primaryViewport: "phone",
    bar: "Loop Habit Tracker: habit list: rows with per-day status marks and numbers",
    win: "a status word, the range and a stamp per node, add and remove in place with undo",
    ours: [{ name: "targets", route: "/dashboard", seed: STATES.confirmed, fullPage: true }],
    files: ["src/components/dashboard/TargetGoals.tsx", "src/components/rscore/AxisRow.tsx"],
  },
  {
    id: "A3", title: "Dashboard deadlines", group: "dashboard", primaryViewport: "phone",
    bar: "Fossify Calendar: day view with timed events",
    win: "relative dates only when imminent, filters never zero out silently, every date stamped",
    ours: [{ name: "dates", route: "/dashboard", seed: STATES.confirmed, fullPage: true }],
    files: ["src/components/dashboard/ImportantDates.tsx"],
  },
  {
    id: "A4", title: "Programs list + filters", group: "programs", primaryViewport: "phone",
    bar: "NewPipe: search results list with tabs and rich rows",
    win: "tier counts describe the visible list, equality-matched chips, virtualised without jank",
    ours: [{ name: "programs", route: "/programs", seed: STATES.confirmed }, { name: "programs-desktop", route: "/programs", seed: STATES.confirmed }],
    files: ["src/app/(app)/programs/page.tsx", "src/components/ui/VirtualList.tsx"],
  },
  {
    id: "A5", title: "Program detail", group: "programs", primaryViewport: "phone",
    bar: "NewPipe: channel page: header, primary action, tabs, list",
    win: "a stamp adjacent to every number, prerequisite badges phrase catalogue facts, add-target above the fold",
    ours: [{ name: "detail", route: `/programs/${MED}`, seed: STATES.confirmed, fullPage: true }],
    files: ["src/components/programs/ProgramDetail.tsx", "src/components/programs/AddTargetButton.tsx"],
  },
  {
    id: "A6", title: "Bursaries", group: "bursaries", primaryViewport: "phone",
    bar: "Wikipedia: Explore feed: several visibly different card kinds",
    win: "three visibly different sections, why-chips on every card, out-of-region rows absent",
    ours: [{ name: "bursaries", route: "/bursaries", seed: STATES.confirmed, fullPage: true }],
    files: ["src/app/(app)/bursaries/page.tsx"],
  },
  {
    id: "A7", title: "Profile", group: "profile", primaryViewport: "phone",
    bar: "Tusky: profile: header, identity block, stats, tabs",
    win: "edit links land on the right step and come back, tags say what they unlock, delete is two-step",
    ours: [{ name: "profile", route: "/profile", seed: STATES.confirmed, fullPage: true }],
    files: ["src/app/(app)/profile/page.tsx"],
  },
  {
    id: "A8", title: "Notifications settings", group: "profile", primaryViewport: "phone",
    bar: "Aegis: Appearance settings: sections, values, one toggle",
    win: "toggles persist offline, the guest state explained, the push section only when the key exists",
    ours: [{ name: "notifications", route: "/profile/notifications", seed: STATES.confirmed, fullPage: true }],
    files: ["src/app/(app)/profile/notifications/page.tsx"],
  },
  {
    id: "A9", title: "Counselor-prep sheet", group: "prep", primaryViewport: "desktop", checklistOnly: true,
    bar: "none — checklist critic",
    win: "fits one Letter page, no colour dependence, every figure stamped",
    ours: [{ name: "prep", route: "/counselor-prep", seed: STATES.confirmed, fullPage: true }],
    files: ["src/app/(app)/counselor-prep/page.tsx"],
  },
];

export function findPiece(id: string): Piece {
  const piece = PIECES.find((p) => p.id.toLowerCase() === id.toLowerCase());
  if (!piece) throw new Error(`unknown piece "${id}" (have: ${PIECES.map((p) => p.id).join(", ")})`);
  return piece;
}
