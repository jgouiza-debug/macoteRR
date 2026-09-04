/**
 * Captures OUR side of one gauntlet piece against a running dev server.
 *
 *   npx tsx scripts/gauntlet/capture.ts --piece=O1 --round=1 [--base=http://localhost:3000] [--out=DIR]
 *
 * Writes out/rounds/<piece>/r<round>/ours-<shot>-<viewport>.jpg (+ capture.json with console
 * errors, hydration warnings, forbidden text and the final URL). Exit 1 when any shot has an
 * error, so a builder round never reaches the critic with a broken page.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { VIEWPORTS, FORBIDDEN_TEXT, chromiumExecutable, newContext } from "../screenshots/walk";
import { findPiece } from "./pieces";
import { defaultOut, parseFlags } from "./common";

async function main() {
  const flags = parseFlags(process.argv.slice(2));
  const piece = findPiece(flags.piece ?? "");
  const round = Number(flags.round ?? "1");
  const base = flags.base ?? "http://localhost:3000";
  const out = flags.out ?? defaultOut();
  const dir = path.join(out, "rounds", piece.id, `r${round}`);
  mkdirSync(dir, { recursive: true });

  const browser = await chromium.launch({ executablePath: chromiumExecutable() });
  const results: Array<{ shot: string; viewport: string; file: string; finalUrl: string; status: number; errors: string[]; hydration: string[]; forbidden: string[] }> = [];
  try {
    for (const shot of piece.ours) {
      for (const viewport of VIEWPORTS) {
        const context = await newContext(browser, viewport, "fr", shot.seed);
        const page = await context.newPage();
        const errors: string[] = [];
        const hydration: string[] = [];
        page.on("console", (msg) => {
          const text = msg.text();
          if (/hydrat/i.test(text)) hydration.push(text);
          if (msg.type() === "error") errors.push(text);
        });
        page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
        const response = await page.goto(`${base}${shot.route}`, { waitUntil: "networkidle", timeout: 60_000 });
        await page.waitForTimeout(800);
        await page.waitForLoadState("networkidle");
        await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" }).catch(() => {});
        if (shot.fullPage) {
          // A fixed or sticky bottom bar is painted at the viewport's bottom edge in a full-page
          // capture, on top of whatever content sits there; in flow it lands where a reader who
          // scrolled to the end actually sees it. Cards with content-visibility:auto are never
          // scrolled into view either, so they would paint blank without the override.
          await page
            .addStyleTag({
              content:
                ".fixed.bottom-0, .sticky.bottom-0 { position: static !important; } * { content-visibility: visible !important; }",
            })
            .catch(() => {});
        }
        const file = path.join(dir, `ours-${shot.name}-${viewport.name}.jpg`);
        await page.screenshot({ path: file, fullPage: Boolean(shot.fullPage), type: "jpeg", quality: 80 });
        const bodyText = await page.evaluate(() => document.body?.innerText ?? "");
        const forbidden = FORBIDDEN_TEXT.filter((f) => f.pattern.test(bodyText)).map((f) => f.label);
        results.push({ shot: shot.name, viewport: viewport.name, file, finalUrl: page.url(), status: response?.status() ?? 0, errors, hydration, forbidden });
        process.stdout.write(`  ${piece.id} ${shot.name}/${viewport.name} → ${path.basename(file)}${errors.length || hydration.length || forbidden.length ? "  !!" : ""}\n`);
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  writeFileSync(path.join(dir, "capture.json"), JSON.stringify({ piece: piece.id, round, base, capturedAt: new Date().toISOString(), results }, null, 2));
  const bad = results.filter((r) => r.errors.length || r.hydration.length || r.forbidden.length);
  for (const r of bad) console.log(`  !! ${r.shot}/${r.viewport}: ${[...r.errors, ...r.hydration, ...r.forbidden].join(" | ").slice(0, 300)}`);
  process.exitCode = bad.length > 0 ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
