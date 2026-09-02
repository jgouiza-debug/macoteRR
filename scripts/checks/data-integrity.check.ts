/**
 * Catches the cross-reference bugs TypeScript structurally cannot.
 *
 * Several fields in sample-data.ts and important-dates.ts are typed `string[]` but semantically
 * reference another table's ids. Renaming those ids compiles cleanly and then silently matches
 * nothing — a whole bursary quietly disappearing from every student's results, or a CASPer date
 * that no target program can ever surface, with no error anywhere. Both of those bugs shipped,
 * which is why this file exists and why it is wired into `npm run check:data`.
 *
 * It also enforces two of the docs/00-BUILD-PROMPT.md guardrails at the data level:
 *   #1 every figure carries a source URL and a verification date;
 *   #3 nothing in the student profile or the schema is a financial-need field.
 *
 * Run: npm run check:data   (or npx tsx scripts/checks/data-integrity.check.ts)
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  BURSARIES,
  BURSARIES_OUT_OF_REGION,
  CEGEP_PROGRAMS,
  UNIVERSITY_PROGRAMS,
} from "../../src/lib/sample-data";
import { ALL_IMPORTANT_DATES } from "../../src/lib/data/important-dates";
import { CEGEP_INSTITUTIONS, normalizeProgramCode } from "../../src/lib/data/cegep-institutions";
import { CEGEP_PROGRAM_OFFERINGS } from "../../src/lib/data/cegep-programs-catalog";

const ROOT = path.resolve(__dirname, "../..");

let passed = 0;
function check(label: string, fn: () => void) {
  fn();
  passed += 1;
  console.log(`  ok  ${label}`);
}

function assertUnique(label: string, ids: string[]) {
  const seen = new Set<string>();
  for (const id of ids) {
    assert.ok(!seen.has(id), `${label}: duplicate id "${id}"`);
    seen.add(id);
  }
}

console.log("data-integrity self-check\n");

// Two vocabularies for a DEC code coexist on purpose: the curated ministerial list
// (cegep-catalog.ts, "200.B0") and the scraped per-cégep offerings ("200B1", normalised to
// "200.B1"). A student picks from the scrape, so a bursary may legitimately gate on either.
const decCodes = new Set<string>([
  ...CEGEP_PROGRAMS.map((p) => p.id),
  ...CEGEP_PROGRAM_OFFERINGS.map((o) => normalizeProgramCode(o.programCode)),
]);
const pickerCegepIds = new Set(CEGEP_INSTITUTIONS.map((c) => c.shortCode));
const uniIds = new Set(UNIVERSITY_PROGRAMS.map((p) => p.id));
const allBursaries = [...BURSARIES, ...BURSARIES_OUT_OF_REGION];

check("ids are unique across university programs, bursaries and important dates", () => {
  assertUnique("UNIVERSITY_PROGRAMS", UNIVERSITY_PROGRAMS.map((p) => p.id));
  assertUnique("bursaries", allBursaries.map((b) => b.id));
  assertUnique("ALL_IMPORTANT_DATES", ALL_IMPORTANT_DATES.map((d) => d.id));
});

check("every bursary's eligibleCegepPrograms is a ministerial DEC code", () => {
  const unreachable: string[] = [];
  for (const b of allBursaries) {
    for (const id of b.eligibleCegepPrograms ?? []) {
      assert.match(
        id,
        /^\d{3}\.[A-Z0-9]{2}$/,
        `bursary "${b.id}" references "${id}", which is not a ministerial DEC code ("200.B0") — ` +
          `a legacy slug would match nobody.`,
      );
      // A real code no picker cégep offers is not wrong (the bursary's own rule says it), just
      // unmatchable until coverage widens. Say so rather than silently stripping eligibility.
      if (!decCodes.has(id)) unreachable.push(`${b.id} → ${id}`);
    }
  }
  if (unreachable.length > 0) {
    console.log(`      note: codes no Quebec City picker student can hold: ${unreachable.join("; ")}`);
  }
});

check("every shipped bursary's cegepId is a cégep the onboarding picker offers", () => {
  for (const b of BURSARIES) {
    if (b.cegepId === null) continue;
    assert.ok(
      pickerCegepIds.has(b.cegepId),
      `bursary "${b.id}" is gated on "${b.cegepId}", which no student can pick — ` +
        `src/lib/matching/match.ts would exclude it for everyone. Move it to BURSARIES_OUT_OF_REGION.`,
    );
  }
});

check("the in-region / out-of-region split is exhaustive and exclusive", () => {
  for (const b of BURSARIES_OUT_OF_REGION) {
    assert.ok(b.cegepId !== null, `"${b.id}" has no cégep gate and belongs in BURSARIES`);
    assert.ok(!pickerCegepIds.has(b.cegepId), `"${b.id}" is gated on a picker cégep and belongs in BURSARIES`);
  }
  const shipped = new Set(BURSARIES.map((b) => b.id));
  for (const b of BURSARIES_OUT_OF_REGION) {
    assert.ok(!shipped.has(b.id), `"${b.id}" appears in both lists`);
  }
});

check("every bursary's eligibleUniversityPrograms references a real program id", () => {
  for (const b of allBursaries) {
    for (const id of b.eligibleUniversityPrograms ?? []) {
      assert.ok(uniIds.has(id), `bursary "${b.id}" references unknown university program "${id}"`);
    }
  }
});

check("every important date's programIds references a real program id", () => {
  for (const d of ALL_IMPORTANT_DATES) {
    for (const id of d.programIds ?? []) {
      assert.ok(
        uniIds.has(id),
        `important date "${d.id}" references unknown program "${id}" — ` +
          `getDeadlinesForStudent() could never surface it.`,
      );
    }
  }
});

check("CEGEP_PROGRAMS ids are ministerial DEC codes, not legacy slugs", () => {
  for (const p of CEGEP_PROGRAMS) {
    assert.match(
      p.id,
      /^\d{3}\.[A-Z0-9]{2}$/,
      `"${p.id}" is not a ministerial DEC code — did a legacy slug come back?`,
    );
  }
});

check("guardrail #1: every university program with figures carries a source and a date", () => {
  for (const p of UNIVERSITY_PROGRAMS) {
    if (p.cutoffHistory.length === 0) continue;
    assert.ok(p.sourceUrl, `"${p.id}" has cutoff figures but no sourceUrl`);
    assert.match(p.lastVerifiedAt, /^\d{4}-\d{2}-\d{2}$/, `"${p.id}" has no ISO lastVerifiedAt`);
  }
});

check("guardrail #1: every bursary and important date carries a source and a date", () => {
  for (const b of allBursaries) {
    assert.ok(b.sourceUrl, `bursary "${b.id}" has no sourceUrl`);
    assert.match(b.lastVerifiedAt, /^\d{4}-\d{2}-\d{2}$/, `bursary "${b.id}" has no ISO lastVerifiedAt`);
  }
  for (const d of ALL_IMPORTANT_DATES) {
    assert.ok(d.sourceUrl, `date "${d.id}" has no sourceUrl`);
    assert.match(d.lastVerifiedAt, /^\d{4}-\d{2}-\d{2}$/, `date "${d.id}" has no ISO lastVerifiedAt`);
    assert.match(d.dateIso, /^\d{4}-\d{2}-\d{2}$/, `date "${d.id}" has a malformed dateIso`);
  }
});

check("cutoff history never records the same (year, figure type) twice for a program", () => {
  for (const p of UNIVERSITY_PROGRAMS) {
    const seen = new Set<string>();
    for (const entry of p.cutoffHistory) {
      const key = `${entry.year}:${entry.figureType}`;
      assert.ok(!seen.has(key), `"${p.id}" records ${key} twice — which figure is the real one?`);
      seen.add(key);
    }
  }
});

check("guardrail #3: no financial-need field in the student profile or the schema", () => {
  const forbidden = /\b(income|household|revenu|m[eé]nage|financial_need|besoin_financier)\b/i;
  const files = [
    path.join(ROOT, "src/lib/profile/store.ts"),
    ...readdirSync(path.join(ROOT, "supabase/migrations"))
      .filter((f) => f.endsWith(".sql"))
      .map((f) => path.join(ROOT, "supabase/migrations", f)),
  ];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    // Comments may legitimately name the guardrail; code and DDL may not. The one sanctioned
    // literal is the `bursaries.category` enum value 'financial_need' — a label on the
    // bursary describing the foundation's own criterion, never a field on the student
    // (docs/01-data-architecture.md, "What's deliberately not in this schema").
    const codeOnly = text
      .split("\n")
      .filter((line) => !/^\s*(--|\/\/|\*|\/\*)/.test(line))
      .join("\n")
      .replace(/'financial_need'/g, "'<bursary-category>'");
    assert.ok(
      !forbidden.test(codeOnly),
      `${path.relative(ROOT, file)} mentions a financial-need field outside a comment`,
    );
  }
});

console.log(`\n${passed} checks passed.`);
