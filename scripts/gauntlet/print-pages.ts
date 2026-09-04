/**
 * Prints a route to a US Letter PDF the way the browser's print dialog would and reports the
 * page count. The counselor-prep sheet must come out as exactly one page (exit 1 otherwise).
 *
 *   npx tsx scripts/gauntlet/print-pages.ts [--route=/counselor-prep] [--state=confirmed] [--base=URL] [--out=FILE.pdf] [--shot]
 *
 * `--shot` also saves a JPEG of the page rendered under print media at the printable width
 * (Letter minus the @page margins), next to the PDF, for eyeballing what comes off the printer.
 */
import { chromium } from "playwright";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { STATES, VIEWPORTS, chromiumExecutable, newContext } from "../screenshots/walk";
import { defaultOut, parseFlags } from "./common";

async function main() {
  const flags = parseFlags(process.argv.slice(2));
  const route = flags.route ?? "/counselor-prep";
  const stateName = flags.state ?? "confirmed";
  const state = STATES[stateName];
  if (!state) throw new Error(`unknown state "${stateName}" (have: ${Object.keys(STATES).join(", ")})`);
  const base = flags.base ?? "http://localhost:3000";
  const out = flags.out ?? path.join(defaultOut(), "print", `${route.replace(/\W+/g, "-").replace(/^-/, "") || "root"}-${stateName}.pdf`);
  mkdirSync(path.dirname(out), { recursive: true });
  const desktop = VIEWPORTS.find((v) => v.name === "desktop");
  if (!desktop) throw new Error("no desktop viewport");

  const browser = await chromium.launch({ executablePath: chromiumExecutable() });
  try {
    const context = await newContext(browser, desktop, "fr", state);
    const page = await context.newPage();
    await page.goto(`${base}${route}`, { waitUntil: "networkidle", timeout: 60_000 });
    await page.waitForTimeout(800);
    await page.emulateMedia({ media: "print" });
    await page.pdf({ path: out, format: "Letter", printBackground: true, preferCSSPageSize: true });
    if (flags.shot) {
      // 8.5in minus 2 × 12mm at 96dpi ≈ 725px: what the sheet has to fit into horizontally.
      await page.setViewportSize({ width: 725, height: 1000 });
      await page.screenshot({ path: out.replace(/\.pdf$/, ".jpg"), fullPage: true, type: "jpeg", quality: 80 });
    }
  } finally {
    await browser.close();
  }
  // Chromium writes each page as an uncompressed "/Type /Page" object; "/Pages" is the tree root.
  const pages = (readFileSync(out, "latin1").match(/\/Type\s*\/Page(?!s)/g) ?? []).length;
  console.log(JSON.stringify({ route, state: stateName, pages, out }));
  process.exitCode = pages === 1 ? 0 : 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
