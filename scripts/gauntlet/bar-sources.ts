/**
 * Where each piece's bar comes from: a real screen of a real, public, open-source app, taken
 * from that app's own store-listing screenshots in its GitHub repository (fastlane / metadata
 * folders). The user chose this over Duolingo, which is unreachable from this environment.
 *
 * The bar is a real thing we compare against directly (the skill's rule), even though the apps
 * differ in domain from MaCote: the critic judges screen craft against the piece's "ours wins
 * only if" criteria, not the two apps' subject matter.
 *
 *   npx tsx scripts/gauntlet/import-bar.ts --from=DIR   → docs/gauntlet/bar/<piece>/mobile.jpg + manifest.json
 *
 * `path` is relative to a local clone of `repo` at `commit`; the manifest records the raw URL.
 */
export type BarSource = {
  piece: string;
  repo: string;
  commit: string;
  path: string;
  /** The screen, in the source app's own terms. */
  screen: string;
  /** Why it is the bar for this piece. */
  why: string;
};

const WIKI = { repo: "wikimedia/apps-android-wikipedia", commit: "2054c804922adb548d5383a3b48d365835dff1d0", dir: "fastlane/metadata/android/en-US/images/phoneScreenshots" };
const SC = { repo: "streetcomplete/StreetComplete", commit: "88b7fe432a47928911600af3470ff21117c43e72", dir: "metadata/en/images/phoneScreenshots" };
const NP = { repo: "TeamNewPipe/NewPipe", commit: "bbbac9b223f21a1a5a714044353cf0412de57b98", dir: "fastlane/metadata/android/en-US/images/phoneScreenshots" };
const EL = { repo: "element-hq/element-android", commit: "2725aba55e37d949715402f67aa1b23bea79e66f", dir: "fastlane/metadata/android/en-US/images/phoneScreenshots" };
const UH = { repo: "iSoron/uhabits", commit: "7e993e17b2b674d4b5b1291ebd18677b74810df2", dir: "screenshots" };
const MA = { repo: "mastodon/mastodon-android", commit: "d5d02a781a947031101ea1f90156ad0f82d6ea10", dir: "fastlane/metadata/android/en-US/images/phoneScreenshots" };
const AE = { repo: "beemdevelopment/Aegis", commit: "17a87a4e1f87ca97e13fa56f2df755609b34b8a4", dir: "metadata/en-US/images/phoneScreenshots" };
const TU = { repo: "tuskyapp/Tusky", commit: "43ae0bb4556392393a3d759ce42a93f3a003e83a", dir: "fastlane/metadata/android/en-US/images/phoneScreenshots" };
const CA = { repo: "FossifyOrg/Calendar", commit: "d985d5e9011cb01bb8634e2387ebb908a80979c0", dir: "fastlane/metadata/android/en-US/images/phoneScreenshots" };

function src(piece: string, app: { repo: string; commit: string; dir: string }, file: string, screen: string, why: string): BarSource {
  return { piece, repo: app.repo, commit: app.commit, path: `${app.dir}/${file}`, screen, why };
}

export const BAR_SOURCES: BarSource[] = [
  src("S1", NP, "00.png", "NewPipe: What's New feed with top app bar and three-tab bottom nav", "a shell with one active tab, a titled header and dense but readable rows"),
  src("S2", WIKI, "1_en-US.png", "Wikipedia: empty reading list with a single 'Create new' action", "an empty state that names exactly one next action"),
  src("O1", TU, "00_login.png", "Tusky: welcome / login: illustration, one field, one button, one help link", "one promise, one action, nothing to scroll"),
  src("O2", WIKI, "6_en-US.png", "Wikipedia: language picker, a long searchable list", "a long list of institutions the student scans and filters"),
  src("O3", SC, "screenshot3.png", "StreetComplete: 'What kind of building is this?' typed list with descriptions", "a typed pick where every row carries a one-line explanation"),
  src("O4", CA, "2_en-US.png", "Fossify Calendar: view chooser: a short radio list in a sheet", "three or four ranked paths, one tap each"),
  src("O5", SC, "screenshot4.png", "StreetComplete: house-number quest: one big field and a type dropdown", "a single-field entry that makes the keypad the whole screen"),
  src("O6", SC, "screenshot6.png", "StreetComplete: opening-hours rows with add/other/no/yes", "rows of structured values with a confirm at the bottom"),
  src("O7", MA, "5.png", "Mastodon: server rules: a numbered list you accept before continuing", "a recap the user reads once, then a single CTA"),
  src("O8", UH, "3.png", "Loop Habit Tracker: habit history: bar chart and calendar", "a result page built from charts with a plain reading"),
  src("O9", SC, "screenshot2.png", "StreetComplete: quest question with illustration and 'other answers / confirm'", "one question per screen, answers visibly answers"),
  src("O10", EL, "1.png", "Element: sign-up form (username, password, create)", "the account step: few fields, primary action, no distraction"),
  src("A1", UH, "2.png", "Loop Habit Tracker: habit detail: score, month, year, total strip over a chart", "a stat bar where one number leads and the rest support it"),
  src("A2", UH, "1.png", "Loop Habit Tracker: habit list: rows with per-day status marks and numbers", "many tracked items, each with a status readable at a glance"),
  src("A3", CA, "3_en-US.png", "Fossify Calendar: day view with timed events", "dated items on a rail, nearest first"),
  src("A4", NP, "02.png", "NewPipe: search results list with tabs and rich rows", "a filtered list of many similar rows with metadata"),
  src("A5", NP, "08.png", "NewPipe: channel page: header, primary action, tabs, list", "a detail page with its main action above the fold"),
  src("A6", WIKI, "5_en-US.png", "Wikipedia: Explore feed: several visibly different card kinds", "sections that look different because they are different"),
  src("A7", TU, "03_profile.png", "Tusky: profile: header, identity block, stats, tabs", "a profile page whose facts and actions are separable at a glance"),
  src("A8", AE, "screenshot2.png", "Aegis: Appearance settings: sections, values, one toggle", "a settings list where each row says what it changes"),
];
