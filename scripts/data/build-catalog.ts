/**
 * Generates supabase/seed/catalog.sql: an idempotent seed for EVERY catalogue table, from the
 * same verified TypeScript data the app ships.
 *
 *   - cegeps / cegep_programs            ← src/lib/data/raw/cegep-programs.json (the scrape)
 *   - universities / university_programs ← src/lib/sample-data.ts UNIVERSITY_PROGRAMS (237,
 *                                          16 institutions, each with sourceUrl + lastVerifiedAt)
 *   - cutoff_history                     ← UNIVERSITY_PROGRAMS[].cutoffHistory (491 figures)
 *   - courses / university_program_prerequisites ← cegep-catalog.ts + the prerequisite parser
 *   - bursaries                          ← BURSARIES (the in-region set)
 *   - deadlines                          ← important-dates.ts
 *   - generic_program_profiles           ← generic-program-profiles.ts
 *   - catalog_versions                   ← a hash of everything above
 *
 * Until 2026-09 the university programmes came from a second scrape
 * (src/lib/data/raw/university-programs.json) whose slugs shared nothing with the ones the
 * app uses, so a student's saved target could never resolve to a database row. Those rows
 * are removed, deliberately and visibly, at the top of the seed.
 *
 * Ids are deterministic UUIDv5s derived from natural keys, so TypeScript and SQL agree on
 * primary keys without a lookup, and bursary `eligible_university_programs` can carry real
 * uuids. Every statement upserts, so replaying after a data refresh updates in place. The
 * output is generated and committed; rerun `npm run build:catalog` after touching the data.
 *
 * This is also where `src/lib/data/version.ts` is written: the catalogue version is a hash
 * of the seed body, so the bundle in the app and the rows in Postgres always report the
 * same version for the same data.
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  UNIVERSITY_PROGRAMS,
  BURSARIES,
  type Bursary,
  type UniversityProgram,
} from "../../src/lib/sample-data";
import { ALL_IMPORTANT_DATES, type ImportantDate } from "../../src/lib/data/important-dates";
import { GENERIC_PROGRAM_PROFILES } from "../../src/lib/data/generic-program-profiles";
import { COLLEGIAL_COURSES } from "../../src/lib/data/cegep-catalog";
import { CEGEP_INSTITUTIONS } from "../../src/lib/data/cegep-institutions";
import { resolvePrerequisite } from "../../src/lib/matching/program-eligibility";

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

/**
 * Every institution `UNIVERSITY_PROGRAMS` names, keyed exactly as it names them. The website
 * is recorded only where a verified admissions page was already on file; null is not a gap
 * the UI shows, so it stays null rather than a guessed URL.
 */
const UNIVERSITY_META: Record<string, { shortCode: string; websiteUrl: string | null }> = {
  "Université de Montréal": { shortCode: "udem", websiteUrl: "https://admission.umontreal.ca/" },
  "Université Laval": { shortCode: "ulaval", websiteUrl: "https://www.ulaval.ca/etudes/programmes" },
  "Université du Québec à Montréal (UQAM)": { shortCode: "uqam", websiteUrl: "https://etudier.uqam.ca/" },
  "McGill University": { shortCode: "mcgill", websiteUrl: "https://www.mcgill.ca/undergraduate-admissions/" },
  "Concordia University": { shortCode: "concordia", websiteUrl: "https://www.concordia.ca/admissions.html" },
  "HEC Montréal": { shortCode: "hec", websiteUrl: "https://www.hec.ca/programmes/" },
  "Polytechnique Montréal": { shortCode: "polymtl", websiteUrl: "https://www.polymtl.ca/futur/" },
  "Université de Sherbrooke": { shortCode: "udes", websiteUrl: null },
  "École de technologie supérieure (ÉTS)": { shortCode: "ets", websiteUrl: null },
  "Université du Québec à Trois-Rivières (UQTR)": { shortCode: "uqtr", websiteUrl: null },
  "Université du Québec à Chicoutimi (UQAC)": { shortCode: "uqac", websiteUrl: null },
  "Université du Québec à Rimouski (UQAR)": { shortCode: "uqar", websiteUrl: null },
  "Université du Québec en Outaouais (UQO)": { shortCode: "uqo", websiteUrl: null },
  "Université du Québec en Abitibi-Témiscamingue (UQAT)": { shortCode: "uqat", websiteUrl: null },
  "Bishop's University": { shortCode: "bishops", websiteUrl: null },
  "Université TÉLUQ": { shortCode: "teluq", websiteUrl: null },
};

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

function sqlText(value: string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "null";
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlNum(value: number | null | undefined): string {
  return value === null || value === undefined ? "null" : String(value);
}

function sqlBool(value: boolean | null | undefined): string {
  return value === null || value === undefined ? "null" : value ? "true" : "false";
}

function sqlDate(value: string | null | undefined): string {
  return value ? `date '${value}'` : "null";
}

function sqlTextArray(values: readonly string[] | null | undefined): string {
  if (!values) return "null";
  if (values.length === 0) return "'{}'::text[]";
  return `array[${values.map((v) => sqlText(v)).join(", ")}]::text[]`;
}

function sqlUuidArray(values: readonly string[] | null | undefined): string {
  if (!values) return "null";
  if (values.length === 0) return "'{}'::uuid[]";
  return `array[${values.map((v) => `'${v}'`).join(", ")}]::uuid[]`;
}

function sqlJson(value: unknown): string {
  return `${sqlText(JSON.stringify(value))}::jsonb`;
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
    slug: string;
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
    // Program slugs must be unique per cégep: two campuses can run the same ministerial code,
    // and one cégep can list the same code twice under different profiles.
    let slug = `${meta.shortCode}-${slugify(code || program.program_name)}`;
    let suffix = 2;
    while (seen.has(slug)) slug = `${meta.shortCode}-${slugify(code || program.program_name)}-${suffix++}`;
    seen.add(slug);

    return {
      id: uuidV5(`cegep_program:${slug}`),
      slug,
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
cegeps.sort((a, b) => a.name.localeCompare(b.name, "fr"));

// The picker (src/lib/data/cegep-institutions.ts) and this seed must agree on short codes,
// or a bursary's cegep_id points at nothing.
const pickerCodes = new Set(CEGEP_INSTITUTIONS.map((c) => c.shortCode));
for (const c of cegeps) {
  if (!pickerCodes.has(c.shortCode)) throw new Error(`cégep "${c.shortCode}" is seeded but not in CEGEP_INSTITUTIONS`);
}

// --- universities: the 16 institutions the verified programme list names ---------------

const institutionNames = [...new Set(UNIVERSITY_PROGRAMS.map((p) => p.institution))];
for (const name of institutionNames) {
  if (!UNIVERSITY_META[name]) throw new Error(`No UNIVERSITY_META entry for "${name}".`);
}
const universities = institutionNames
  .map((name) => ({ id: uuidV5(`university:${UNIVERSITY_META[name].shortCode}`), name, ...UNIVERSITY_META[name] }))
  .sort((a, b) => a.name.localeCompare(b.name, "fr"));

/**
 * Slugs the retired scrape-based seed used for university_programs. Kept only to remove those
 * rows: they share no id with UNIVERSITY_PROGRAMS, so nothing in the app ever pointed at them.
 */
const retiredUniversitySlugs: string[] = rawUniversities.flatMap((raw) => {
  const meta = UNIVERSITY_META[raw.university_name];
  if (!meta) return [];
  const seen = new Set<string>();
  return raw.programs
    .filter((program) => !NOT_A_PROGRAM.has(program.program_name.trim()))
    .map((program) => {
      const name = program.program_name.trim();
      let slug = `${meta.shortCode}-${slugify(name)}`;
      let suffix = 2;
      while (seen.has(slug)) slug = `${meta.shortCode}-${slugify(name)}-${suffix++}`;
      seen.add(slug);
      return slug;
    });
});

// --- university programmes, cutoffs, prerequisites ------------------------------------

const programId = (p: UniversityProgram) => uuidV5(`university_program:${p.id}`);
const programIdBySlug = new Map(UNIVERSITY_PROGRAMS.map((p) => [p.id, programId(p)]));

const courseIdByCode = new Map(COLLEGIAL_COURSES.map((c) => [c.code, uuidV5(`course:${c.code}`)]));

type PrereqRow = { id: string; programId: string; courseId: string; required: boolean };
const prerequisiteRows: PrereqRow[] = [];
for (const program of UNIVERSITY_PROGRAMS) {
  const seenCourses = new Map<string, boolean>();
  for (const prerequisite of program.prerequisites) {
    const resolution = resolvePrerequisite(prerequisite.name);
    if (resolution.kind !== "courses") continue;
    for (const group of resolution.groups) {
      const known = group.filter((a) => a.code !== null);
      // "required" is per group: a single-course group is a hard requirement; a course that is
      // one of several accepted alternatives is not.
      const required = group.length === 1;
      for (const alt of known) {
        const code = alt.code as string;
        seenCourses.set(code, (seenCourses.get(code) ?? false) || required);
      }
    }
  }
  for (const [code, required] of seenCourses) {
    prerequisiteRows.push({
      id: uuidV5(`prereq:${program.id}:${code}`),
      programId: programId(program),
      courseId: courseIdByCode.get(code as never) as string,
      required,
    });
  }
}

type CutoffRow = { id: string; programId: string; year: number; cutoff: number; figureType: string; sourceTier: string; sourceUrl: string; verifiedAt: string };
const cutoffRows: CutoffRow[] = [];
for (const program of UNIVERSITY_PROGRAMS) {
  const seen = new Set<string>();
  for (const entry of program.cutoffHistory) {
    const key = `${entry.year}:${entry.figureType}`;
    if (seen.has(key)) throw new Error(`${program.id} records ${key} twice`);
    seen.add(key);
    cutoffRows.push({
      id: uuidV5(`cutoff:${program.id}:${entry.year}:${entry.figureType}`),
      programId: programId(program),
      year: entry.year,
      cutoff: entry.cutoff,
      figureType: entry.figureType,
      sourceTier: entry.sourceTier,
      sourceUrl: program.sourceUrl,
      verifiedAt: program.lastVerifiedAt,
    });
  }
}

// --- bursaries ------------------------------------------------------------------------

const cegepIdByCode = new Map(cegeps.map((c) => [c.shortCode, c.id]));

function bursaryRow(b: Bursary): string[] {
  if (b.cegepId !== null && !cegepIdByCode.has(b.cegepId)) {
    throw new Error(`bursary "${b.id}" is gated on "${b.cegepId}", which the seed does not know`);
  }
  const uniIds = b.eligibleUniversityPrograms?.map((slug) => {
    const id = programIdBySlug.get(slug);
    if (!id) throw new Error(`bursary "${b.id}" references unknown university programme "${slug}"`);
    return id;
  });
  return [
    `'${uuidV5(`bursary:${b.id}`)}'`,
    sqlText(b.name),
    sqlText(b.sourceOrg),
    b.cegepId === null ? "null" : `'${cegepIdByCode.get(b.cegepId)}'`,
    sqlText(b.category),
    sqlNum(b.amountMin),
    sqlNum(b.amountMax),
    sqlText(b.deadlineIso ? "fixed_date" : "rolling"),
    sqlDate(b.deadlineIso),
    sqlText(b.applicationUrl),
    "null", // description: the app renders the name and the why-chips, not prose
    "null", // eligible_cegep_programs (uuid[]): the codes column below is the semantic key
    sqlUuidArray(uniIds ?? null),
    sqlNum(b.minRScore),
    sqlNum(b.minSession),
    sqlBool(b.requiresEssay),
    sqlBool(b.requiresRecommendation),
    sqlTextArray(b.tagCriteria),
    sqlDate(b.lastVerifiedAt),
    sqlText(b.id),
    sqlTextArray(b.eligibleCegepPrograms),
    sqlText(b.deadlinePrecision ?? null),
    sqlText(b.sourceUrl),
  ];
}

// --- deadlines ------------------------------------------------------------------------

function deadlineType(d: ImportantDate): string {
  switch (d.category) {
    case "cegep":
      return d.id.startsWith("drop-date") ? "withdrawal_no_penalty" : d.id.startsWith("sram") ? "sram_round" : "other";
    case "university":
      return "university_admission";
    case "test":
      return "test";
    case "bursary":
      return "bursary";
    default:
      return "other";
  }
}

function deadlineRow(d: ImportantDate): string[] {
  for (const slug of d.programIds ?? []) {
    if (!programIdBySlug.has(slug)) throw new Error(`deadline "${d.id}" references unknown programme "${slug}"`);
  }
  return [
    `'${uuidV5(`deadline:${d.id}`)}'`,
    sqlText(deadlineType(d)),
    sqlText(d.titleFr),
    sqlDate(d.dateIso),
    "null",
    sqlText(d.sourceUrl),
    sqlDate(d.lastVerifiedAt),
    sqlText(d.id),
    sqlText(d.titleEn),
    sqlText(d.detailFr),
    sqlText(d.detailEn),
    sqlTextArray(d.programIds ?? null),
    sqlText(d.category),
  ];
}

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
  if (rows.length === 0) return `-- ${table}: nothing to seed`;
  const values = rows.map((row) => `  (${row.join(", ")})`).join(",\n");
  return (
    `insert into ${table} (${columns.join(", ")}) values\n${values}\n` +
    `on conflict (${conflictTarget}) do update set\n  ${updates.join(",\n  ")};`
  );
}

const body: string[] = [];

body.push("-- cluster 1: institutions");
body.push(
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
    ["name = excluded.name", "sector = excluded.sector", "website_url = excluded.website_url", "admission_service = excluded.admission_service", "updated_at = now()"],
  ),
  "",
  upsert(
    "universities",
    ["id", "name", "short_code", "website_url", "bci_member"],
    universities.map((u) => [`'${u.id}'`, sqlText(u.name), sqlText(u.shortCode), sqlText(u.websiteUrl), "true"]),
    "short_code",
    ["name = excluded.name", "website_url = excluded.website_url"],
  ),
);

body.push("", "-- cluster 2: cégep programmes (keyed by catalog_slug so replays update in place) and the NY courses");
body.push(
  upsert(
    "cegep_programs",
    ["id", "cegep_id", "program_code", "name", "type", "catalog_slug"],
    cegeps.flatMap((c) =>
      c.programs.map((prog) => [`'${prog.id}'`, `'${c.id}'`, sqlText(prog.code || null), sqlText(prog.name), sqlText(prog.type), sqlText(prog.slug)]),
    ),
    "catalog_slug",
    ["name = excluded.name", "program_code = excluded.program_code", "type = excluded.type"],
  ),
  "",
  upsert(
    "courses",
    ["id", "course_code", "discipline_code", "name", "name_en"],
    COLLEGIAL_COURSES.map((c) => [`'${courseIdByCode.get(c.code)}'`, sqlText(c.code), sqlText(c.disciplineCode), sqlText(c.nameFr), sqlText(c.nameEn)]),
    "course_code",
    ["discipline_code = excluded.discipline_code", "name = excluded.name", "name_en = excluded.name_en"],
  ),
);

body.push(
  "",
  "-- cluster 3: university programmes, their published figures and their prerequisites.",
  "-- Rows from the retired scrape-based seed are removed first: their slugs matched nothing",
  "-- the app writes, and keeping them would leave two disjoint programme lists in one table.",
  `delete from cutoff_history where university_program_id in (select id from university_programs where catalog_slug in (${retiredUniversitySlugs.map((s) => sqlText(s)).join(", ")}));`,
  `delete from university_program_prerequisites where university_program_id in (select id from university_programs where catalog_slug in (${retiredUniversitySlugs.map((s) => sqlText(s)).join(", ")}));`,
  `delete from university_program_grade_floors where university_program_id in (select id from university_programs where catalog_slug in (${retiredUniversitySlugs.map((s) => sqlText(s)).join(", ")}));`,
  `update student_targets set university_program_id = null where university_program_id in (select id from university_programs where catalog_slug in (${retiredUniversitySlugs.map((s) => sqlText(s)).join(", ")}));`,
  `delete from university_programs where catalog_slug in (${retiredUniversitySlugs.map((s) => sqlText(s)).join(", ")});`,
  "",
  "-- No overall cutoff column: universities publish multi-year ranges, or min/max/average,",
  "-- never one canonical number, so every figure lives in cutoff_history with its own year",
  "-- and figure type. admission_type is 'other' until each programme's process is sourced.",
  upsert(
    "university_programs",
    ["id", "university_id", "name", "degree_type", "admission_type", "source_url", "last_verified_at", "catalog_slug"],
    UNIVERSITY_PROGRAMS.map((p) => [
      `'${programId(p)}'`,
      `'${uuidV5(`university:${UNIVERSITY_META[p.institution].shortCode}`)}'`,
      sqlText(p.name),
      "null",
      "'other'",
      sqlText(p.sourceUrl),
      sqlDate(p.lastVerifiedAt),
      sqlText(p.id),
    ]),
    "catalog_slug",
    ["university_id = excluded.university_id", "name = excluded.name", "source_url = excluded.source_url", "last_verified_at = excluded.last_verified_at"],
  ),
  "",
  "-- source_type is 'other' until CutoffEntry records where each figure was read (official PDF,",
  "-- cégep compilation, BCI); source_tier and the programme's own source URL are carried.",
  upsert(
    "cutoff_history",
    ["id", "university_program_id", "admission_year", "cutoff", "figure_type", "source_tier", "source_url", "source_type", "verified_at"],
    cutoffRows.map((r) => [`'${r.id}'`, `'${r.programId}'`, String(r.year), String(r.cutoff), sqlText(r.figureType), sqlText(r.sourceTier), sqlText(r.sourceUrl), "'other'", sqlDate(r.verifiedAt)]),
    "university_program_id, admission_year, figure_type",
    ["cutoff = excluded.cutoff", "source_tier = excluded.source_tier", "source_url = excluded.source_url", "verified_at = excluded.verified_at"],
  ),
  "",
  "-- Prerequisites resolve through the same parser the app uses (resolvePrerequisite): only",
  "-- NY-catalogue courses get a row; an alternative outside the catalogue is not a row here.",
  upsert(
    "university_program_prerequisites",
    ["id", "university_program_id", "course_id", "required"],
    prerequisiteRows.map((r) => [`'${r.id}'`, `'${r.programId}'`, `'${r.courseId}'`, sqlBool(r.required)]),
    "university_program_id, course_id",
    ["required = excluded.required"],
  ),
);

body.push("", "-- cluster 4: bursaries (the in-region set; BURSARIES_OUT_OF_REGION waits for docs/02 Phase 7)");
body.push(
  upsert(
    "bursaries",
    ["id", "name", "source_org", "cegep_id", "category", "amount_min", "amount_max", "deadline_type", "deadline_date", "application_url", "description", "eligible_cegep_programs", "eligible_university_programs", "min_r_score", "min_session", "requires_essay", "requires_recommendation", "tag_criteria", "last_verified_at", "catalog_slug", "eligible_cegep_program_codes", "deadline_precision", "source_url"],
    BURSARIES.map(bursaryRow),
    "catalog_slug",
    ["name = excluded.name", "source_org = excluded.source_org", "cegep_id = excluded.cegep_id", "category = excluded.category", "amount_min = excluded.amount_min", "amount_max = excluded.amount_max", "deadline_type = excluded.deadline_type", "deadline_date = excluded.deadline_date", "application_url = excluded.application_url", "eligible_university_programs = excluded.eligible_university_programs", "min_r_score = excluded.min_r_score", "min_session = excluded.min_session", "requires_essay = excluded.requires_essay", "requires_recommendation = excluded.requires_recommendation", "tag_criteria = excluded.tag_criteria", "last_verified_at = excluded.last_verified_at", "eligible_cegep_program_codes = excluded.eligible_cegep_program_codes", "deadline_precision = excluded.deadline_precision", "source_url = excluded.source_url"],
  ),
);

body.push("", "-- cluster 5: deadlines");
body.push(
  upsert(
    "deadlines",
    ["id", "type", "title", "date", "applies_to_cegep_id", "source_url", "last_verified_at", "catalog_slug", "title_en", "detail", "detail_en", "program_slugs", "category"],
    ALL_IMPORTANT_DATES.map(deadlineRow),
    "catalog_slug",
    ["type = excluded.type", "title = excluded.title", "date = excluded.date", "source_url = excluded.source_url", "last_verified_at = excluded.last_verified_at", "title_en = excluded.title_en", "detail = excluded.detail", "detail_en = excluded.detail_en", "program_slugs = excluded.program_slugs", "category = excluded.category"],
  ),
);

body.push("", "-- cluster 8: generic programme profiles");
body.push(
  upsert(
    "generic_program_profiles",
    ["id", "program_code", "name", "description", "profils", "typical_courses", "leads_to_program_categories", "factual_career_examples", "source_url", "last_verified_at", "name_en", "description_en", "aliases"],
    GENERIC_PROGRAM_PROFILES.map((p) => [
      `'${uuidV5(`program_profile:${p.programCode}`)}'`,
      sqlText(p.programCode),
      sqlText(p.name),
      sqlText(p.description),
      sqlJson(p.profils),
      sqlTextArray(p.typicalCourses.map((c) => `${c.code} ${c.nameFr}`)),
      sqlTextArray(p.leadsToProgramCategories.map((c) => c.labelFr)),
      sqlTextArray(p.factualCareerExamples.map((c) => c.titleFr)),
      sqlText(p.sourceUrl),
      sqlDate(p.lastVerifiedAt),
      sqlText(p.nameEn),
      sqlText(p.descriptionEn),
      sqlTextArray((p as { aliases?: string[] }).aliases ?? []),
    ]),
    "program_code",
    ["name = excluded.name", "description = excluded.description", "profils = excluded.profils", "typical_courses = excluded.typical_courses", "leads_to_program_categories = excluded.leads_to_program_categories", "factual_career_examples = excluded.factual_career_examples", "source_url = excluded.source_url", "last_verified_at = excluded.last_verified_at", "name_en = excluded.name_en", "description_en = excluded.description_en", "aliases = excluded.aliases"],
  ),
);

// --- version: a hash of the seed body, shared with src/lib/data/version.ts --------------

const bodyText = body.join("\n");
const version = createHash("sha256").update(bodyText).digest("hex").slice(0, 16);
const latestVerification = [
  ...UNIVERSITY_PROGRAMS.map((p) => p.lastVerifiedAt),
  ...BURSARIES.map((b) => b.lastVerifiedAt),
  ...ALL_IMPORTANT_DATES.map((d) => d.lastVerifiedAt),
  ...GENERIC_PROGRAM_PROFILES.map((p) => p.lastVerifiedAt),
].sort().at(-1)!;
const rowCounts = {
  cegeps: cegeps.length,
  cegep_programs: cegeps.reduce((n, c) => n + c.programs.length, 0),
  universities: universities.length,
  university_programs: UNIVERSITY_PROGRAMS.length,
  cutoff_history: cutoffRows.length,
  courses: COLLEGIAL_COURSES.length,
  university_program_prerequisites: prerequisiteRows.length,
  bursaries: BURSARIES.length,
  deadlines: ALL_IMPORTANT_DATES.length,
  generic_program_profiles: GENERIC_PROGRAM_PROFILES.length,
};

const header = [
  "-- GENERATED by scripts/data/build-catalog.ts — do not edit by hand.",
  "--",
  "-- Populates every catalogue table from the verified TypeScript data the app ships. Student",
  "-- data is untouched. Idempotent: every statement upserts on a natural key (short_code /",
  "-- catalog_slug / course_code / program_code), so replaying after a data refresh updates in",
  "-- place rather than duplicating.",
  "--",
  "-- REQUIRES every migration through 20260902120000 — the catalog_slug, source_url and",
  "-- eligible_cegep_program_codes columns it writes do not exist before them.",
  "--",
  `-- version ${version} (generated_at = latest lastVerifiedAt in the data, ${latestVerification}).`,
  "-- Run via the Supabase SQL editor, or `supabase db query --linked -f <this file>`.",
  "",
  "begin;",
  "",
];
const footer = [
  "",
  "-- what /api/reference/version reports for this data",
  `insert into catalog_versions (version, generated_at, source, row_counts) values (${sqlText(version)}, timestamptz '${latestVerification}T00:00:00Z', 'build-catalog', ${sqlJson(rowCounts)})`,
  "on conflict (version) do update set generated_at = excluded.generated_at, row_counts = excluded.row_counts;",
  "",
  "commit;",
  "",
];

const sql = [...header, bodyText, ...footer].join("\n");
if (sql.includes("Ã")) throw new Error("mojibake in the generated seed — check source encodings");

mkdirSync(join(ROOT, "supabase", "seed"), { recursive: true });
writeFileSync(join(ROOT, "supabase", "seed", "catalog.sql"), sql, "utf8");
writeFileSync(
  join(ROOT, "src", "lib", "data", "version.ts"),
  [
    "/**",
    " * Reference catalogue version: a hash of the seed body, written by scripts/data/build-catalog.ts.",
    " * The bundle the app ships and the rows in Postgres report the same version for the same data;",
    " * clients re-fetch /api/reference/bundle when this changes (src/lib/data/reference-store.ts).",
    " */",
    `export const REFERENCE_CATALOG_VERSION = ${JSON.stringify(version)};`,
    `export const REFERENCE_CATALOG_GENERATED_AT = ${JSON.stringify(`${latestVerification}T00:00:00.000Z`)};`,
    "",
  ].join("\n"),
  "utf8",
);

console.log(`catalog ${version}: ${Object.entries(rowCounts).map(([k, v]) => `${k}=${v}`).join(" ")}`);
console.log("wrote supabase/seed/catalog.sql and src/lib/data/version.ts");
