/**
 * Walks every onboarding screen and app page at phone and desktop sizes, in both locales, for a
 * set of seeded student profiles, and writes screenshots plus a report of anything a student
 * should never see: console errors, hydration warnings, bracket placeholders, the literal
 * "R : ??", or an estimated score rendered without its "≈".
 *
 *   npm run shots                      # against a dev server already on :3000
 *   npm run shots -- --serve           # boots `next dev` first, kills it after
 *   npm run shots -- --states=confirmed,new --routes=/dashboard --viewports=phone
 *   npm run shots -- --out=/tmp/shots  # default: scratchpad or ./.shots
 *
 * Seeding is done with addInitScript writing the same localStorage keys the app reads
 * (src/lib/profile/store.ts, src/app/onboarding/page.tsx, src/lib/i18n/LocaleProvider.tsx), so
 * no route is special-cased and the harness cannot drift from the store's contract without
 * failing loudly.
 *
 * Browser: Playwright's pinned Chromium may not be the build installed on the machine. Set
 * PLAYWRIGHT_CHROMIUM_PATH to a chrome binary to override (the remote container ships
 * /opt/pw-browsers/chromium-*\/chrome-linux/chrome). Never run `playwright install` here.
 */
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

type Viewport = { name: "phone" | "desktop"; width: number; height: number; isMobile: boolean; deviceScaleFactor: number };
type Locale = "fr" | "en";

const VIEWPORTS: Viewport[] = [
  { name: "phone", width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
  { name: "desktop", width: 1280, height: 800, isMobile: false, deviceScaleFactor: 1 },
];

const IOS_SAFARI_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

/** Real catalogue ids (scripts/checks/data-integrity.check.ts guarantees they exist). */
const TARGET_MEDECINE_ULAVAL = "universite-doctorat-de-1er-cycle-en-medec";
const TARGET_ARCHITECTURE_ULAVAL = "universite-baccalaureat-en-architecture";

/**
 * Seeded profiles. Shapes mirror StudentProfile in src/lib/profile/store.ts; unknown keys are
 * ignored by the store's spread-merge and missing keys take DEFAULT_PROFILE values, so an
 * older or newer profile shape here is exactly the migration case the store must survive.
 */
const STATES: Record<string, { profile: Record<string, unknown> | null; seenWelcome: boolean; extra?: Record<string, string> }> = {
  new: { profile: null, seenWelcome: false },
  "first-session": {
    profile: { cegepId: "sainte-foy", cegepProgramId: "200.B1", currentSession: 1, rScore: null, rScoreStatus: null, selfTags: [], targetUniversityProgramIds: [], interestIds: [] },
    seenWelcome: true,
  },
  confirmed: {
    profile: { cegepId: "sainte-foy", cegepProgramId: "200.B1", currentSession: 3, rScore: 31.2, rScoreStatus: "confirmed", selfTags: ["sports", "leadership"], targetUniversityProgramIds: [TARGET_MEDECINE_ULAVAL, TARGET_ARCHITECTURE_ULAVAL], interestIds: ["sante"] },
    seenWelcome: true,
  },
  estimated: {
    profile: { cegepId: "garneau", cegepProgramId: "300.A0", currentSession: 2, rScore: 27.8, rScoreStatus: "estimated", selfTags: ["arts_culture"], targetUniversityProgramIds: [TARGET_ARCHITECTURE_ULAVAL], interestIds: [] },
    seenWelcome: true,
  },
  "goal-skipped": {
    profile: { cegepId: "limoilou", cegepProgramId: "420.B0", currentSession: 1, rScore: null, rScoreStatus: null, selfTags: [], targetUniversityProgramIds: [], interestIds: [], goalSkipped: true },
    seenWelcome: true,
  },
  "legacy-outbox": {
    // Pre-2026-09 profile shape plus a queued mutation, exactly as an existing user's browser
    // would hold it. The store must load it without throwing and keep the record pending.
    profile: { cegepId: "sainte-foy", cegepProgramId: "200.B1", currentSession: 2, rScore: 29.5, rScoreStatus: "confirmed", selfTags: [], targetUniversityProgramIds: [], interestIds: [] },
    seenWelcome: true,
    extra: {
      "macote.mutation_outbox": JSON.stringify([
        { id: "legacy-1", timestamp: 1756700000000, patch: { selfTags: ["sports"] }, previousSnapshot: { cegepId: "sainte-foy", cegepProgramId: "200.B1", currentSession: 2, rScore: 29.5, rScoreStatus: "confirmed", selfTags: [], targetUniversityProgramIds: [], interestIds: [] }, attempts: 0, status: "pending" },
      ]),
    },
  },
};

const ONBOARDING_ROUTES = [
  "/onboarding",
  "/onboarding/welcome",
  "/onboarding/cegep",
  "/onboarding/program",
  "/onboarding/score",
  "/onboarding/score/confirm",
  "/onboarding/score/estimate",
  "/onboarding/score/starting",
  "/onboarding/results?score=28.4&status=estimated",
  "/onboarding/goal",
  "/onboarding/account",
];

const APP_ROUTES = [
  "/dashboard",
  "/programs",
  `/programs/${TARGET_MEDECINE_ULAVAL}`,
  "/bursaries",
  "/profile",
  "/profile/notifications",
  "/counselor-prep",
];

const MARKETING_ROUTES = ["/", "/en", "/confidentialite", "/a-propos"];

const DEFAULT_ROUTES = [...ONBOARDING_ROUTES, ...APP_ROUTES, ...MARKETING_ROUTES];

/** Text a student must never see rendered. */
const FORBIDDEN_TEXT: { label: string; pattern: RegExp }[] = [
  { label: "R : ??", pattern: /R\s*:\s*\?\?/ },
  { label: "bracket placeholder", pattern: /\[(Nom du|courriel|à confirmer|Ton nom|Your name|ton cégep|your cégep|Responsible person|contact email)/i },
  { label: "TODO", pattern: /\bTODO\b/ },
  { label: "undefined/NaN", pattern: /\b(undefined|NaN)\b/ },
];

type Finding = { state: string; locale: Locale; viewport: string; route: string; kind: string; detail: string };

type Args = {
  base: string;
  out: string;
  serve: boolean;
  states: string[];
  routes: string[];
  locales: Locale[];
  viewports: Viewport[];
  fullPage: boolean;
};

function parseArgs(argv: string[]): Args {
  const get = (name: string) => argv.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");
  const list = (name: string) => get(name)?.split(",").map((s) => s.trim()).filter(Boolean);
  const scratch = process.env.CLAUDE_SCRATCHPAD ?? process.env.MACOTE_SHOTS_DIR;
  const viewportNames = list("viewports") ?? ["phone", "desktop"];
  return {
    base: get("base") ?? "http://localhost:3000",
    out: get("out") ?? (scratch ? path.join(scratch, "shots") : path.resolve(".shots")),
    serve: argv.includes("--serve"),
    states: list("states") ?? Object.keys(STATES),
    routes: list("routes") ?? DEFAULT_ROUTES,
    locales: (list("locales") as Locale[] | undefined) ?? ["fr", "en"],
    viewports: VIEWPORTS.filter((v) => viewportNames.includes(v.name)),
    fullPage: !argv.includes("--viewport-only"),
  };
}

function chromiumExecutable(): string | undefined {
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) return process.env.PLAYWRIGHT_CHROMIUM_PATH;
  const expected = chromium.executablePath();
  if (existsSync(expected)) return undefined; // Playwright's own build is present.
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  if (!existsSync(root)) return undefined;
  const candidates = readdirSync(root)
    .filter((d) => /^chromium-\d+$/.test(d))
    .map((d) => path.join(root, d, "chrome-linux", "chrome"))
    .filter(existsSync);
  return candidates.at(-1);
}

async function waitForServer(base: string, timeoutMs: number) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(base, { redirect: "manual" });
      if (res.status > 0) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`no server answered at ${base} within ${timeoutMs}ms`);
}

function startDevServer(base: string): ChildProcess {
  const port = new URL(base).port || "3000";
  const child = spawn("npx", ["next", "dev", "--webpack", "-p", port], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, SERWIST_SUPPRESS_TURBOPACK_WARNING: "1" },
  });
  child.stdout?.on("data", (d) => process.stderr.write(`[next] ${d}`));
  child.stderr?.on("data", (d) => process.stderr.write(`[next] ${d}`));
  return child;
}

function slug(route: string) {
  return route.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "root";
}

async function newContext(browser: Browser, viewport: Viewport, locale: Locale, state: string): Promise<BrowserContext> {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.isMobile,
    hasTouch: viewport.isMobile,
    deviceScaleFactor: viewport.deviceScaleFactor,
    userAgent: viewport.isMobile ? IOS_SAFARI_UA : undefined,
    locale: locale === "fr" ? "fr-CA" : "en-CA",
    reducedMotion: "reduce",
    colorScheme: "light",
  });
  const seed = STATES[state];
  await context.addInitScript(
    ({ profile, seenWelcome, locale, extra }) => {
      try {
        window.localStorage.clear();
        window.localStorage.setItem("macote.locale", locale);
        // The iOS install sheet (src/components/pwa/IosInstallGuide.tsx) pops over any page on
        // a Safari UA; the harness pretends it was dismissed so it never masks a screen.
        window.localStorage.setItem("macote.ios_install_guide_dismissed", "1");
        if (seenWelcome) window.localStorage.setItem("macote.has_seen_welcome", "1");
        if (profile) window.localStorage.setItem("macote.profile", JSON.stringify(profile));
        for (const [k, v] of Object.entries(extra ?? {})) window.localStorage.setItem(k, v);
      } catch {
        /* storage blocked */
      }
    },
    { profile: seed.profile, seenWelcome: seed.seenWelcome, locale, extra: seed.extra ?? {} },
  );
  return context;
}

async function capture(page: Page, url: string, file: string, fullPage: boolean) {
  const errors: string[] = [];
  const hydration: string[] = [];
  const onConsole = (msg: { type(): string; text(): string }) => {
    const text = msg.text();
    if (/hydrat/i.test(text)) hydration.push(text);
    if (msg.type() === "error") errors.push(text);
  };
  page.on("console", onConsole);
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  const response = await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
  // Client-side redirects (the onboarding guards) settle after the first paint.
  await page.waitForTimeout(600);
  await page.waitForLoadState("networkidle");
  // `next dev` mounts its own indicator badge in a <nextjs-portal>; it is not the app.
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" }).catch(() => {});
  const finalUrl = page.url();
  await page.screenshot({ path: file, fullPage });
  const bodyText = await page.evaluate(() => document.body?.innerText ?? "");
  page.off("console", onConsole);
  return { status: response?.status() ?? 0, finalUrl, errors, hydration, bodyText };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  let server: ChildProcess | null = null;
  if (args.serve) {
    server = startDevServer(args.base);
    await waitForServer(args.base, 120_000);
  } else {
    await waitForServer(args.base, 5_000);
  }

  const executablePath = chromiumExecutable();
  const browser = await chromium.launch({ headless: true, executablePath });
  const findings: Finding[] = [];
  const captured: { state: string; locale: Locale; viewport: string; route: string; finalUrl: string; status: number; file: string }[] = [];
  mkdirSync(args.out, { recursive: true });

  try {
    for (const state of args.states) {
      if (!STATES[state]) throw new Error(`unknown state "${state}" (have: ${Object.keys(STATES).join(", ")})`);
      for (const locale of args.locales) {
        for (const viewport of args.viewports) {
          const context = await newContext(browser, viewport, locale, state);
          const page = await context.newPage();
          const dir = path.join(args.out, state, locale, viewport.name);
          mkdirSync(dir, { recursive: true });
          for (const route of args.routes) {
            const file = path.join(dir, `${slug(route)}.png`);
            const url = new URL(route, args.base).toString();
            try {
              const result = await capture(page, url, file, args.fullPage);
              captured.push({ state, locale, viewport: viewport.name, route, finalUrl: result.finalUrl, status: result.status, file });
              const tag = { state, locale, viewport: viewport.name, route };
              for (const e of result.errors) findings.push({ ...tag, kind: "console.error", detail: e.slice(0, 300) });
              for (const h of result.hydration) findings.push({ ...tag, kind: "hydration", detail: h.slice(0, 300) });
              for (const f of FORBIDDEN_TEXT) {
                if (f.pattern.test(result.bodyText)) findings.push({ ...tag, kind: "forbidden-text", detail: f.label });
              }
              const seed = STATES[state].profile;
              if (seed && seed.rScoreStatus === "estimated" && typeof seed.rScore === "number") {
                const shown = String(seed.rScore).replace(".", locale === "fr" ? "," : ".");
                if (result.bodyText.includes(shown) && !result.bodyText.includes(`≈`)) {
                  findings.push({ ...tag, kind: "guardrail-2", detail: `estimated score ${shown} rendered without ≈` });
                }
              }
              const redirected = new URL(result.finalUrl).pathname !== new URL(url).pathname;
              process.stdout.write(`  ${state}/${locale}/${viewport.name} ${route}${redirected ? ` → ${new URL(result.finalUrl).pathname}` : ""}\n`);
            } catch (err) {
              findings.push({ state, locale, viewport: viewport.name, route, kind: "navigation", detail: String(err).slice(0, 300) });
              process.stdout.write(`  ${state}/${locale}/${viewport.name} ${route} !! ${String(err).slice(0, 120)}\n`);
            }
          }
          await context.close();
        }
      }
    }
  } finally {
    await browser.close();
    if (server) server.kill("SIGTERM");
  }

  const report = { generatedAt: new Date().toISOString(), base: args.base, captured, findings };
  writeFileSync(path.join(args.out, "report.json"), JSON.stringify(report, null, 2));
  const byKind = new Map<string, number>();
  for (const f of findings) byKind.set(f.kind, (byKind.get(f.kind) ?? 0) + 1);
  console.log(`\n${captured.length} screenshots → ${args.out}`);
  console.log(findings.length === 0 ? "no findings" : `findings: ${[...byKind].map(([k, v]) => `${k}=${v}`).join(", ")}`);
  for (const f of findings.slice(0, 40)) console.log(`  - [${f.kind}] ${f.state}/${f.locale}/${f.viewport} ${f.route}: ${f.detail}`);
  if (findings.length > 40) console.log(`  … ${findings.length - 40} more in report.json`);
  process.exitCode = findings.some((f) => f.kind === "navigation") ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
