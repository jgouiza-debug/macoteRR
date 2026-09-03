// Renders a labelled thumbnail grid of images (one HTML page → one JPEG) with Playwright.
//   npx tsx contact-sheet.ts <out.jpg> <label=dir> [<label=dir> ...]
import { chromium } from "playwright";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { chromiumExecutable } from "../screenshots/walk";

const [out, ...specs] = process.argv.slice(2);
const cells: string[] = [];
for (const spec of specs) {
  const [label, dir] = spec.split("=");
  if (!existsSync(dir)) continue;
  const files = readdirSync(dir).filter((f) => /\.(png|jpe?g|webp)$/i.test(f)).sort();
  for (const f of files) {
    const b64 = readFileSync(path.join(dir, f)).toString("base64");
    const mime = /\.png$/i.test(f) ? "image/png" : "image/jpeg";
    cells.push(`<figure><img src="data:${mime};base64,${b64}"><figcaption>${label} / ${f}</figcaption></figure>`);
  }
}
const html = `<style>body{margin:0;background:#fff;font:11px system-ui}main{display:flex;flex-wrap:wrap;gap:8px;padding:8px}figure{margin:0;width:190px}img{width:190px;border:1px solid #ccc}figcaption{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}</style><main>${cells.join("")}</main>`;
(async () => {
  const browser = await chromium.launch({ executablePath: chromiumExecutable() });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.setContent(html);
  await page.screenshot({ path: out, fullPage: true, type: "jpeg", quality: 70 });
  await browser.close();
  console.log(`${cells.length} thumbnails → ${out}`);
})();
