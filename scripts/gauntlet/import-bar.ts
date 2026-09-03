/**
 * Imports the bar screenshots listed in bar-sources.ts from local clones of the source repos
 * into docs/gauntlet/bar/<piece>/mobile.jpg (780px wide JPEG, the same width as our phone
 * captures) and writes docs/gauntlet/bar/manifest.json for pair.ts.
 *
 *   npx tsx scripts/gauntlet/import-bar.ts --from=DIR    (DIR holds one clone per repo, named by the repo's basename)
 */
import { chromium } from "playwright";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { chromiumExecutable } from "../screenshots/walk";
import { BAR_SOURCES } from "./bar-sources";
import { parseFlags } from "./common";

const BAR_DIR = path.resolve(process.cwd(), "docs/gauntlet/bar");
const WIDTH = 780;

type ManifestEntry = { piece: string; url: string; step: string; viewport: "mobile"; file: string; capturedAt: string; notes: string };

async function main() {
  const flags = parseFlags(process.argv.slice(2));
  const from = flags.from;
  if (!from) throw new Error("--from=DIR is required");
  const browser = await chromium.launch({ executablePath: chromiumExecutable() });
  const page = await browser.newPage({ viewport: { width: WIDTH + 40, height: 900 }, deviceScaleFactor: 1 });
  const manifest: ManifestEntry[] = [];
  const missing: string[] = [];
  for (const s of BAR_SOURCES) {
    const local = path.join(from, path.basename(s.repo), s.path);
    if (!existsSync(local)) {
      missing.push(`${s.piece}: ${local}`);
      continue;
    }
    const mime = /\.png$/i.test(local) ? "image/png" : /\.webp$/i.test(local) ? "image/webp" : "image/jpeg";
    const b64 = readFileSync(local).toString("base64");
    await page.setContent(
      `<style>body{margin:0;background:#fff}img{display:block;width:${WIDTH}px;height:auto}</style><img id="i" src="data:${mime};base64,${b64}">`,
    );
    await page.waitForFunction(() => (document.getElementById("i") as HTMLImageElement).complete);
    const dir = path.join(BAR_DIR, s.piece);
    mkdirSync(dir, { recursive: true });
    const rel = `${s.piece}/mobile.jpg`;
    await page.locator("#i").screenshot({ path: path.join(BAR_DIR, rel), type: "jpeg", quality: 82 });
    manifest.push({
      piece: s.piece,
      url: `https://github.com/${s.repo}/blob/${s.commit}/${s.path}`,
      step: s.screen,
      viewport: "mobile",
      file: rel,
      capturedAt: new Date().toISOString().slice(0, 10),
      notes: s.why,
    });
    console.log(`${s.piece} ← ${s.repo}/${s.path}`);
  }
  await browser.close();
  mkdirSync(BAR_DIR, { recursive: true });
  writeFileSync(path.join(BAR_DIR, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  if (missing.length) {
    console.error(`missing sources:\n  ${missing.join("\n  ")}`);
    process.exit(1);
  }
  console.log(`${manifest.length} bar screens → ${BAR_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
