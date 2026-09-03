/**
 * Builds the BLIND pair for a piece and round: our capture and the bar, copied to
 * a.jpg / b.jpg with a random assignment the critic never sees. The assignment is recorded in
 * pair.json so the orchestrator can map the critic's pick back.
 *
 *   npx tsx scripts/gauntlet/pair.ts --piece=O1 --round=1 [--out=DIR]
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { randomInt } from "node:crypto";
import path from "node:path";
import { findPiece } from "./pieces";
import { defaultOut, parseFlags } from "./common";

type ManifestEntry = { piece: string; url?: string; step?: string; viewport: string; file: string; capturedAt?: string; notes?: string };

const BAR_DIR = path.resolve(process.cwd(), "docs/gauntlet/bar");

function barFiles(pieceId: string): { phone: string | null; desktop: string | null } {
  const manifestPath = path.join(BAR_DIR, "manifest.json");
  let entries: ManifestEntry[] = [];
  if (existsSync(manifestPath)) {
    try {
      entries = JSON.parse(readFileSync(manifestPath, "utf8")) as ManifestEntry[];
    } catch {
      entries = [];
    }
  }
  const mine = entries.filter((e) => e.piece.toLowerCase() === pieceId.toLowerCase());
  const pick = (vp: RegExp) => {
    const notFull = mine.find((e) => vp.test(e.viewport) && !/full/.test(e.file));
    const any = mine.find((e) => vp.test(e.viewport));
    const rel = (notFull ?? any)?.file;
    if (rel) {
      const abs = path.isAbsolute(rel) ? rel : path.join(BAR_DIR, rel.replace(/^docs\/gauntlet\/bar\//, ""));
      if (existsSync(abs)) return abs;
    }
    // No manifest hit: fall back to the folder convention.
    const dir = path.join(BAR_DIR, pieceId);
    if (!existsSync(dir)) return null;
    const files = readdirSync(dir).filter((f) => /\.(jpe?g|png)$/i.test(f));
    const name = vp.source.includes("mobile") ? "mobile" : "desktop";
    return files.find((f) => f.startsWith(name) && !f.includes("full")) ? path.join(dir, files.find((f) => f.startsWith(name) && !f.includes("full"))!) : files.find((f) => f.startsWith(name)) ? path.join(dir, files.find((f) => f.startsWith(name))!) : null;
  };
  return { phone: pick(/mobile|phone/i), desktop: pick(/desktop/i) };
}

function main() {
  const flags = parseFlags(process.argv.slice(2));
  const piece = findPiece(flags.piece ?? "");
  const round = Number(flags.round ?? "1");
  const out = flags.out ?? defaultOut();
  const roundDir = path.join(out, "rounds", piece.id, `r${round}`);
  const pairDir = path.join(roundDir, "pair");
  mkdirSync(pairDir, { recursive: true });

  const primary = piece.ours[0];
  const ours = {
    phone: path.join(roundDir, `ours-${primary.name}-phone.jpg`),
    desktop: path.join(roundDir, `ours-${primary.name}-desktop.jpg`),
  };
  const bar = barFiles(piece.id);
  if (!bar.phone && !bar.desktop) {
    console.error(`no bar capture for ${piece.id} under ${BAR_DIR} (account-gated or not captured yet)`);
    process.exit(2);
  }
  for (const f of [ours.phone, ours.desktop]) if (!existsSync(f)) {
    console.error(`missing our capture: ${f} (run capture.ts first)`);
    process.exit(2);
  }

  const oursIsA = randomInt(2) === 0;
  const a = oursIsA ? "ours" : "bar";
  const b = oursIsA ? "bar" : "ours";
  const files: Record<string, string> = {};
  for (const vp of ["phone", "desktop"] as const) {
    const src = { ours: ours[vp], bar: bar[vp] };
    for (const [label, side] of [["a", a], ["b", b]] as const) {
      const from = src[side];
      if (!from) continue;
      const to = path.join(pairDir, `${label}-${vp}.jpg`);
      copyFileSync(from, to);
      files[`${label}-${vp}`] = to;
    }
  }
  const record = { piece: piece.id, round, a, b, files, primaryViewport: piece.primaryViewport, createdAt: new Date().toISOString() };
  writeFileSync(path.join(pairDir, "pair.json"), JSON.stringify(record, null, 2));
  // Only the file list is printed; which side is ours stays in pair.json for the orchestrator.
  console.log(JSON.stringify({ pairDir, files }, null, 2));
}

main();
