/**
 * Generates supabase/seed/catalog.sql from the two scraped catalogues in src/lib/data/raw:
 * an idempotent seed for cegeps / cegep_programs / universities / university_programs.
 *
 * The client reads those same JSON files directly through src/lib/data/cegep-programs-catalog.ts
 * and src/lib/data/cegep-institutions.ts, so this script exists only to get the data into
 * Postgres. The output is generated and committed; rerun `npm run build:catalog` after
 * touching the raw JSON or the maps below rather than editing the SQL by hand.
 *
 * Institution ids are deterministic UUIDv5s derived from the short_code, so the TS module
 * and the SQL seed agree on primary keys without the app ever needing a lookup round-trip.
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..", "..");
const RAW = join(ROOT, "src", "lib", "data", "raw");

// ---------------------------------------------------------------- raw shapes

type RawCegep = {
  cegep_name: string;
  website: string;
  programs: { program_code: string; program_name: string; category: string; description: string }[];
};

type RawUniversity = {
  university_name: string;
  programs: { program_name: string; url: string }[];
};

// ------------------------------------------------------------ institution maps
//
// The scrape keys institutions by display name; everything downstream (bursary rows,
// student profiles, the Supabase short_code column) keys by slug. This map is the single
// place those two vocabularies meet — a raw name missing here is a hard error, never a
// silently-slugged guess, because a drifted slug would orphan a student's saved profile.

const CEGEP_META: Record<
  string,
  { shortCode: string; sector: "public_french" | "public_english" | "private"; admissionService: string }
> = {
  "Cégep de Sainte-Foy": { shortCode: "sainte-foy", sector: "public_french", admissionService: "SRACQ" },
  "Cégep Garneau": { shortCode: "garneau", sector: "public_french", admissionService: "SRACQ" },
  "Cégep Limoilou : campus de Limoilou": { shortCode: "limoilou", sector: "public_french", admissionService: "SRACQ" },
  "Cégep Limoilou : campus de Charlesbourg": { shortCode: "limoilou-charlesbourg", sector: "public_french", admissionService: "SRACQ" },
  "Champlain College: St. Lawrence Campus": { shortCode: "champlain-slc", sector: "public_english", admissionService: "SRACQ" },
  "Centre d'études collégiales en Charlevoix": { shortCode: "charlevoix", sector: "public_french", admissionService: "SRACQ" },
  "Conservatoire de musique de Québec": { shortCode: "conservatoire-quebec", sector: "public_french", admissionService: "direct" },
  "Collège Bart (privé)": { shortCode: "bart", sector: "private", admissionService: "direct" },
  "Mérici Collégial Privé (privé)": { shortCode: "merici", sector: "private", admissionService: "direct" },
  "Notre-Dame-de-Foy (privé)": { shortCode: "notre-dame-de-foy", sector: "private", admissionService: "direct" },
  "Collège O'Sullivan de Québec (privé)": { shortCode: "osullivan-quebec", sector: "private", admissionService: "direct" },
};

const UNIVERSITY_META: Record<string, { shortCode: string; websiteUrl: string }> = {
  "Université de Montréal": { shortCode: "udem", websiteUrl: "https://admission.umontreal.ca/" },
  "Université Laval": { shortCode: "ulaval", websiteUrl: "https://www.ulaval.ca/etudes/programmes" },
  "Université du Québec à Montréal (UQAM)": { shortCode: "uqam", websiteUrl: "https://etudier.uqam.ca/" },
  "McGill University": { shortCode: "mcgill", websiteUrl: "https://www.mcgill.ca/undergraduate-admissions/" },
  "Concordia University": { shortCode: "concordia", websiteUrl: "https://www.concordia.ca/admissions.html" },
};

/**
 * Universities that carry sourced cutoffs in src/lib/sample-data.ts but have no scraped
 * program list yet. Seeded so `university_programs.university_id` has somewhere to point.
 */
const EXTRA_UNIVERSITIES = [
  { name: "HEC Montréal", shortCode: "hec", websiteUrl: "https://www.hec.ca/programmes/" },
  { name: "Polytechnique Montréal", shortCode: "polymtl", websiteUrl: "https://www.polymtl.ca/futur/" },
];

const CATEGORY_TO_TYPE: Record<string, "pre_university" | "technical" | "special"> = {
  "Programme préuniversitaire": "pre_university",
  "Programme technique": "technical",
  "Cheminement particulier": "special",
};

/** Concordia's scrape picked up two navigation labels alongside the real programs. */
const NOT_A_PROGRAM = new Set(["Undergraduate Calendar", "View program details"]);

// ------------------------------------------------------------------- helpers

/** RFC 4122 §4.3 name-based UUID. Stable across runs, machines, and the SQL seed. */
const NAMESPACE = "6f9c8b1e-6b4a-4a2e-9d3f-1c2b3a4d5e6f";

function uuidV5(name: string): string {
  const nsBytes = Buffer.from(NAMESPACE.replace(/-/g, ""), "hex");
  const hash = createHash("sha1").update(Buffer.concat([nsBytes, Buffer.from(name, "utf8")])).digest();
  const bytes = Buffer.from(hash.subarray(0, 16));
  bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

/** `310C0` → `310.C0`. Ministerial codes are published with the separator; the scrape dropped it. */
function formatProgramCode(code: string): string {
  const trimmed = code.trim();
  if (/^\d{3}[A-Z0-9]{2}$/i.test(trimmed)) return `${trimmed.slice(0, 3)}.${trimmed.slice(3).toUpperCase()}`;
  return trimmed;
}

/** The scraped descriptions are truncated HTML fragments; the UI wants one plain sentence. */
function htmlToText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;/g, "’")
    .replace(/&quot;/g, '"')
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sqlText(value: string | null): string {
  if (value === null || value === "") return "null";
  return `'${value.replace(/'/g, "''")}'`;
}

// -------------------------------------------------------------------- build

const rawCegeps = JSON.parse(readFileSync(join(RAW, "cegep-programs.json"), "utf8")) as RawCegep[];
const rawUniversities = JSON.parse(readFileSync(join(RAW, "university-programs.json"), "utf8")) as RawUniversity[];

type BuiltCegep = {
  id: string;
  shortCode: string;
  name: string;
  sector: string;
  admissionService: string;
  websiteUrl: string | null;
  programs: {
    id: string;
    cegepShortCode: string;
    code: string;
    name: string;
    type: "pre_university" | "technical" | "special";
    summary: string;
  }[];
};

const cegeps: BuiltCegep[] = rawCegeps.map((raw) => {
  const meta = CEGEP_META[raw.cegep_name];
  if (!meta) throw new Error(`No CEGEP_META entry for "${raw.cegep_name}" — add one before regenerating.`);

  const seen = new Set<string>();
  const programs = raw.programs.map((program) => {
    const type = CATEGORY_TO_TYPE[program.category];
    if (!type) throw new Error(`Unknown category "${program.category}" on ${raw.cegep_name}.`);

    const code = formatProgramCode(program.program_code);
    // Program ids must be unique per cégep: two campuses can run the same ministerial code,
    // and one cégep can list the same code twice under different profiles.
    let id = `${meta.shortCode}-${slugify(code || program.program_name)}`;
    let suffix = 2;
    while (seen.has(id)) id = `${meta.shortCode}-${slugify(code || program.program_name)}-${suffix++}`;
    seen.add(id);

    return {
      id,
      cegepShortCode: meta.shortCode,
      code,
      name: program.program_name.trim(),
      type,
      summary: htmlToText(program.description ?? "").slice(0, 240),
    };
  });

  return {
    id: uuidV5(`cegep:${meta.shortCode}`),
    shortCode: meta.shortCode,
    name: raw.cegep_name,
    sector: meta.sector,
    admissionService: meta.admissionService,
    websiteUrl: raw.website?.trim() || null,
    programs: programs.sort((a, b) => a.name.localeCompare(b.name, "fr")),
  };
});

type BuiltUniversity = {
  id: string;
  shortCode: string;
  name: string;
  websiteUrl: string;
  programs: { id: string; universityShortCode: string; name: string; url: string }[];
};

const universities: BuiltUniversity[] = rawUniversities.map((raw) => {
  const meta = UNIVERSITY_META[raw.university_name];
  if (!meta) throw new Error(`No UNIVERSITY_META entry for "${raw.university_name}".`);

  const seen = new Set<string>();
  const programs = raw.programs
    .filter((program) => !NOT_A_PROGRAM.has(program.program_name.trim()))
    .map((program) => {
      const name = program.program_name.trim();
      let id = `${meta.shortCode}-${slugify(name)}`;
      let suffix = 2;
      while (seen.has(id)) id = `${meta.shortCode}-${slugify(name)}-${suffix++}`;
      seen.add(id);
      return { id, universityShortCode: meta.shortCode, name, url: program.url.trim() };
    });

  return {
    id: uuidV5(`university:${meta.shortCode}`),
    shortCode: meta.shortCode,
    name: raw.university_name,
    websiteUrl: meta.websiteUrl,
    programs: programs.sort((a, b) => a.name.localeCompare(b.name, "fr")),
  };
});

const extraUniversities = EXTRA_UNIVERSITIES.map((u) => ({
  id: uuidV5(`university:${u.shortCode}`),
  shortCode: u.shortCode,
  name: u.name,
  websiteUrl: u.websiteUrl,
  programs: [] as BuiltUniversity["programs"],
}));

const allUniversities = [...universities, ...extraUniversities].sort((a, b) =>
  a.name.localeCompare(b.name, "fr"),
);

cegeps.sort((a, b) => a.name.localeCompare(b.name, "fr"));

// ------------------------------------------------------------------ note
//
// This script no longer emits a TypeScript catalogue. src/lib/data/cegep-programs-catalog.ts
// already parses the same raw JSON at import time, and a second generated copy of the same
// data would be one more thing to keep in sync. The SQL seed below is the only output.

// ------------------------------------------------------------ emit catalog.sql
//
// One batched INSERT per table rather than one per row. Semantically identical — the same
// ON CONFLICT clause, the same transaction — but it drops the file from ~150KB of repeated
// conflict clauses to something that pastes into the Supabase SQL editor without complaint.

function upsert(
  table: string,
  columns: string[],
  rows: string[][],
  conflictTarget: string,
  updates: string[],
): string {
  const values = rows.map((row) => `  (${row.join(", ")})`).join(",\n");
  return (
    `insert into ${table} (${columns.join(", ")}) values\n${values}\n` +
    `on conflict (${conflictTarget}) do update set\n  ${updates.join(",\n  ")};`
  );
}

const lines: string[] = [
  "-- GENERATED by scripts/data/build-catalog.ts — do not edit by hand.",
  "--",
  "-- Populates the catalogue clusters from the scraped Quebec City data. Student data is",
  "-- untouched. Idempotent: every statement upserts on a natural key (short_code /",
  "-- catalog_slug), so replaying after a raw-data refresh updates in place rather than",
  "-- duplicating.",
  "--",
  "-- REQUIRES the 20260825120000_catalog_slugs_and_onboarding migration first — the",
  "-- catalog_slug columns it upserts on do not exist before it.",
  "--",
  "-- Run via the Supabase SQL editor, or `supabase db query --linked -f <this file>`.",
  "",
  "begin;",
  "",
  "-- cluster 1: institutions",
];

lines.push(
  upsert(
    "cegeps",
    ["id", "name", "short_code", "sector", "region", "website_url", "admission_service"],
    cegeps.map((c) => [
      `'${c.id}'`,
      sqlText(c.name),
      sqlText(c.shortCode),
      sqlText(c.sector),
      "'Quebec City'",
      sqlText(c.websiteUrl),
      sqlText(c.admissionService),
    ]),
    "short_code",
    [
      "name = excluded.name",
      "sector = excluded.sector",
      "website_url = excluded.website_url",
      "admission_service = excluded.admission_service",
      "updated_at = now()",
    ],
  ),
);

lines.push("");

lines.push(
  upsert(
    "universities",
    ["id", "name", "short_code", "website_url", "bci_member"],
    allUniversities.map((u) => [
      `'${u.id}'`,
      sqlText(u.name),
      sqlText(u.shortCode),
      sqlText(u.websiteUrl),
      "true",
    ]),
    "short_code",
    ["name = excluded.name", "website_url = excluded.website_url"],
  ),
);

lines.push("", "-- cluster 2: cegep programs (keyed by catalog_slug so replays update in place)");

lines.push(
  upsert(
    "cegep_programs",
    ["cegep_id", "program_code", "name", "type", "catalog_slug"],
    cegeps.flatMap((c) =>
      c.programs.map((prog) => [
        `'${c.id}'`,
        sqlText(prog.code || null),
        sqlText(prog.name),
        sqlText(prog.type),
        sqlText(prog.id),
      ]),
    ),
    "catalog_slug",
    ["name = excluded.name", "program_code = excluded.program_code", "type = excluded.type"],
  ),
);

lines.push(
  "",
  "-- cluster 3: university programs. The scrape carries names and links only — no figures.",
  "-- There is deliberately no cutoff column to fill: universities publish multi-year ranges,",
  "-- or min/max/average, never one canonical number, so every figure lives in cutoff_history",
  "-- with its own year and figure type. See the 20260824194657 migration.",
);

lines.push(
  upsert(
    "university_programs",
    [
      "university_id",
      "name",
      "degree_type",
      "admission_type",
      "source_url",
      "last_verified_at",
      "catalog_slug",
    ],
    allUniversities.flatMap((u) =>
      u.programs.map((prog) => [
        `'${u.id}'`,
        sqlText(prog.name),
        "null",
        "'other'",
        sqlText(prog.url || u.websiteUrl),
        "date '2026-08-25'",
        sqlText(prog.id),
      ]),
    ),
    "catalog_slug",
    ["name = excluded.name", "source_url = excluded.source_url"],
  ),
);

lines.push("", "commit;", "");

mkdirSync(join(ROOT, "supabase", "seed"), { recursive: true });
writeFileSync(join(ROOT, "supabase", "seed", "catalog.sql"), lines.join("\n"), "utf8");

console.log(
  `catalog: ${cegeps.length} cégeps / ${cegeps.reduce((n, c) => n + c.programs.length, 0)} programs · ` +
    `${allUniversities.length} universities / ${allUniversities.reduce((n, u) => n + u.programs.length, 0)} programs`,
);
console.log("wrote supabase/seed/catalog.sql");
