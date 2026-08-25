/**
 * Catches the cross-reference bugs TypeScript structurally cannot.
 *
 * Several fields in sample-data.ts are typed `string[]` but semantically reference another
 * table's ids. Renaming those ids compiles cleanly and then silently matches nothing — a
 * whole bursary quietly disappearing from every student's results with no error anywhere.
 * That exact bug shipped once (a bursary kept the legacy "sciences-nature" slug after
 * CEGEP_PROGRAMS moved to ministerial codes), which is why this file exists.
 *
 * Run: npx tsx scripts/checks/data-integrity.check.ts
 */
import assert from "node:assert/strict";
import {
  BURSARIES,
  CEGEPS,
  CEGEP_PROGRAMS,
  UNIVERSITY_PROGRAMS,
  STUDENT_SAMPLE,
} from "../../src/lib/sample-data";

let passed = 0;
function check(label: string, fn: () => void) {
  fn();
  passed += 1;
  console.log(`  ok  ${label}`);
}

console.log("data-integrity self-check\n");

const programIds = new Set(CEGEP_PROGRAMS.map((p) => p.id));
const cegepIds = new Set(CEGEPS.map((c) => c.id));
const uniIds = new Set(UNIVERSITY_PROGRAMS.map((p) => p.id));

check("every bursary's eligibleCegepPrograms references a real CEGEP_PROGRAMS id", () => {
  for (const b of BURSARIES) {
    for (const id of b.eligibleCegepPrograms ?? []) {
      assert.ok(
        programIds.has(id),
        `bursary "${b.id}" references unknown cégep program "${id}" — it would match nobody. ` +
          `Valid ids are ministerial DEC codes like "200.B0".`,
      );
    }
  }
});

check("every bursary's cegepId references a real CEGEPS id", () => {
  for (const b of BURSARIES) {
    if (b.cegepId === null) continue;
    assert.ok(cegepIds.has(b.cegepId), `bursary "${b.id}" references unknown cégep "${b.cegepId}"`);
  }
});

check("every bursary's eligibleUniversityPrograms references a real program id", () => {
  for (const b of BURSARIES) {
    for (const id of b.eligibleUniversityPrograms ?? []) {
      assert.ok(uniIds.has(id), `bursary "${b.id}" references unknown university program "${id}"`);
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

check("STUDENT_SAMPLE.program is index-based; assert it still points at the intended DEC", () => {
  // sample-data.ts builds STUDENT_SAMPLE from CEGEP_PROGRAMS[0]. Prepending to the catalogue
  // would silently repoint /counselor-prep's "Programme" field at a different program.
  assert.equal(STUDENT_SAMPLE.program.id, "200.B0");
  assert.equal(STUDENT_SAMPLE.program.name, "Sciences de la nature");
});

check("no university program carries a cutoff figure without a source and date", () => {
  for (const p of UNIVERSITY_PROGRAMS) {
    if (p.cutoffHistory.length === 0) continue;
    assert.ok(p.sourceUrl, `"${p.id}" has cutoff figures but no sourceUrl`);
    assert.ok(p.lastVerifiedAt, `"${p.id}" has cutoff figures but no lastVerifiedAt`);
  }
});

console.log(`\n${passed} checks passed.`);
