/**
 * Lists dictionary keys whose quoted literal appears nowhere in src/ outside dictionary.ts.
 * Keys are referenced as t("x.y"), as map values ("cutoff.above"), or as `labelKey: "nav.x"`,
 * so a literal-string scan catches every honest usage; a key built at runtime from pieces
 * would be missed, but the codebase does not do that (TranslationKey is a closed union).
 *
 *   npx tsx scripts/i18n/unused-keys.ts          # human list
 *   npx tsx scripts/i18n/unused-keys.ts --json   # { removedKeys: [...] } for apply-keys.ts
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../..");
const DICT = path.join(ROOT, "src/lib/i18n/dictionary.ts");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name) && full !== DICT) out.push(full);
  }
  return out;
}

const dict = readFileSync(DICT, "utf8");
const frBlock = dict.slice(dict.indexOf("fr: {"), dict.indexOf("\n  en: {"));
const keys = [...frBlock.matchAll(/^\s*"([A-Za-z0-9_.]+)":/gm)].map((m) => m[1]);

const corpus = walk(path.join(ROOT, "src")).map((f) => readFileSync(f, "utf8")).join("\n");
const unused = keys.filter((key) => !corpus.includes(`"${key}"`) && !corpus.includes(`'${key}'`));

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ removedKeys: unused }, null, 2));
} else {
  console.log(`${keys.length} keys, ${unused.length} unused`);
  for (const key of unused) console.log(`  ${key}`);
}
