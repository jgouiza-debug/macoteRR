/**
 * Merges dictionary changes produced by parallel screen builders into
 * src/lib/i18n/dictionary.ts, so no agent ever edits the shared file directly.
 *
 *   npx tsx scripts/i18n/apply-keys.ts keys.json
 *
 * keys.json: { newKeys: [{ key, fr, en }], changedKeys: [{ key, fr, en }], removedKeys: [string] }
 *
 * The dictionary is an `as const` object literal with two locale blocks. This edits it as
 * text (values are JSON string literals, which is what the file already uses), keeps the
 * existing layout, and appends new keys under a dated banner at the end of each block. A key
 * listed as new that already exists is treated as changed; a changed key that does not exist
 * is added. Duplicates across the input are resolved last-wins.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type Entry = { key: string; fr: string; en: string };
type Input = { newKeys?: Entry[]; changedKeys?: Entry[]; removedKeys?: string[] };

const DICT = path.resolve(__dirname, "../../src/lib/i18n/dictionary.ts");
const input = JSON.parse(readFileSync(process.argv[2] ?? "/dev/stdin", "utf8")) as Input;

let text = readFileSync(DICT, "utf8");
const lines = text.split("\n");

function blockBounds(locale: "fr" | "en"): { start: number; end: number } {
  const start = lines.findIndex((l) => l.trim() === `${locale}: {`);
  if (start === -1) throw new Error(`locale block ${locale} not found`);
  // The block closes at the first line that is exactly "  }," (fr) or "  }," before "} as const" (en).
  let depth = 0;
  for (let i = start; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === "{") depth += 1;
      if (ch === "}") depth -= 1;
    }
    if (depth === 0 && i > start) return { start, end: i };
  }
  throw new Error(`locale block ${locale} never closes`);
}

function keyLine(key: string): string {
  return `    "${key}":`;
}

/** Index range [from, to] of the lines holding `key` inside the block, or null. */
function findKey(key: string, locale: "fr" | "en"): { from: number; to: number } | null {
  const { start, end } = blockBounds(locale);
  for (let i = start + 1; i < end; i++) {
    if (lines[i].startsWith(keyLine(key))) {
      let to = i;
      while (!lines[to].trimEnd().endsWith('",') && !lines[to].trimEnd().endsWith("',") && to < end - 1) to += 1;
      return { from: i, to };
    }
  }
  return null;
}

function render(key: string, value: string): string {
  return `    ${JSON.stringify(key)}: ${JSON.stringify(value)},`;
}

const removed = new Set(input.removedKeys ?? []);
const upserts = new Map<string, Entry>();
for (const e of [...(input.newKeys ?? []), ...(input.changedKeys ?? [])]) upserts.set(e.key, e);
for (const key of removed) upserts.delete(key);

let removedCount = 0;
let changedCount = 0;
let addedCount = 0;

// Removals first (indices shift; recompute each time).
for (const key of removed) {
  for (const locale of ["fr", "en"] as const) {
    const at = findKey(key, locale);
    if (!at) continue;
    lines.splice(at.from, at.to - at.from + 1);
    removedCount += 1;
  }
}

// Changes in place.
const toAppend: Entry[] = [];
for (const entry of upserts.values()) {
  const frAt = findKey(entry.key, "fr");
  const enAt = findKey(entry.key, "en");
  if (frAt && enAt) {
    lines.splice(frAt.from, frAt.to - frAt.from + 1, render(entry.key, entry.fr));
    const enAgain = findKey(entry.key, "en")!;
    lines.splice(enAgain.from, enAgain.to - enAgain.from + 1, render(entry.key, entry.en));
    changedCount += 1;
  } else {
    toAppend.push(entry);
  }
}

// Additions at the end of each block, sorted by key so diffs stay reviewable.
if (toAppend.length > 0) {
  toAppend.sort((a, b) => a.key.localeCompare(b.key));
  const stamp = new Date().toISOString().slice(0, 10);
  for (const locale of ["en", "fr"] as const) {
    const { end } = blockBounds(locale);
    const block = [``, `    // ---- added ${stamp} (scripts/i18n/apply-keys.ts) ----`, ...toAppend.map((e) => render(e.key, e[locale]))];
    lines.splice(end, 0, ...block);
  }
  addedCount = toAppend.length;
}

text = lines.join("\n");
writeFileSync(DICT, text);
console.log(`dictionary.ts: +${addedCount} added, ~${changedCount} changed, -${removedCount / 2} removed`);
