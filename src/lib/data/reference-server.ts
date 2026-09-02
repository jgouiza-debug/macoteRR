
/**
 * Builds the reference catalogue from Postgres for /api/reference/*.
 *
 * The database owns the guardrail-#1 fields (published figures, source URLs, verification
 * dates, bursaries, deadlines); the shipped TypeScript keeps the descriptive text. A
 * programme row overlays its shipped twin only when the database copy was verified on or
 * after the shipped one, so a promotion can never surface something staler than the build.
 * Bursaries and deadlines are rebuilt from rows entirely, since they carry no prose.
 *
 * Returns null when no Supabase project is configured or nothing has been seeded yet, and
 * throws on a database error so the route can answer with the shipped data and `no-store`.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";
import type { Bursary, CutoffEntry, UniversityProgram } from "@/lib/sample-data";
import type { ImportantDate } from "@/lib/data/important-dates";
import { DEFAULT_CATALOG, type ReferenceCatalog } from "@/lib/data/reference-catalog";

type Tables = Database["public"]["Tables"];
type BursaryRow = Tables["bursaries"]["Row"];
type DeadlineRow = Tables["deadlines"]["Row"];
type CutoffRow = Tables["cutoff_history"]["Row"];

export type CatalogVersionInfo = { version: string; generatedAt: string; source: "db" };

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  // Public read-only catalogue: the anon key with no session is exactly the right principal.
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function loadCatalogVersion(): Promise<CatalogVersionInfo | null> {
  const supabase = client();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("catalog_versions")
    .select("version, generated_at")
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`catalog_versions: ${error.message}`);
  if (!data) return null;
  return { version: data.version, generatedAt: data.generated_at, source: "db" };
}

function toCutoffEntry(row: CutoffRow): CutoffEntry {
  return {
    year: row.admission_year,
    cutoff: Number(row.cutoff),
    figureType: row.figure_type,
    sourceTier: row.source_tier,
  };
}

function toBursary(row: BursaryRow, cegepCode: Map<string, string>, programSlug: Map<string, string>): Bursary {
  return {
    id: row.catalog_slug ?? row.id,
    name: row.name,
    sourceOrg: row.source_org,
    category: row.category,
    cegepId: row.cegep_id ? (cegepCode.get(row.cegep_id) ?? null) : null,
    eligibleCegepPrograms: row.eligible_cegep_program_codes,
    eligibleUniversityPrograms: row.eligible_university_programs
      ? row.eligible_university_programs.map((id) => programSlug.get(id)).filter((s): s is string => Boolean(s))
      : null,
    minRScore: row.min_r_score === null ? null : Number(row.min_r_score),
    minSession: row.min_session,
    tagCriteria: (row.tag_criteria as Bursary["tagCriteria"]) ?? null,
    amountMin: row.amount_min === null ? 0 : Number(row.amount_min),
    amountMax: row.amount_max === null ? 0 : Number(row.amount_max),
    deadlineIso: row.deadline_date,
    deadlinePrecision: row.deadline_precision ?? undefined,
    applicationUrl: row.application_url,
    hasPublicApplicationLink: Boolean(row.application_url),
    requiresEssay: row.requires_essay ?? false,
    requiresRecommendation: row.requires_recommendation ?? false,
    sourceUrl: row.source_url,
    lastVerifiedAt: row.last_verified_at,
  };
}

function toImportantDate(row: DeadlineRow): ImportantDate {
  return {
    id: row.catalog_slug ?? row.id,
    titleFr: row.title,
    titleEn: row.title_en ?? row.title,
    dateIso: row.date,
    detailFr: row.detail ?? "",
    detailEn: row.detail_en ?? row.detail ?? "",
    category: (row.category as ImportantDate["category"]) ?? "general",
    programIds: row.program_slugs ?? undefined,
    sourceUrl: row.source_url,
    lastVerifiedAt: row.last_verified_at,
  };
}

export type DbCatalog = { catalog: ReferenceCatalog; stale: string[] };

export async function loadCatalogFromDb(): Promise<DbCatalog | null> {
  const supabase = client();
  if (!supabase) return null;
  const version = await loadCatalogVersion();
  if (!version) return null;

  const [programs, cutoffs, bursaries, deadlines, cegeps] = await Promise.all([
    supabase.from("university_programs").select("id, catalog_slug, source_url, last_verified_at"),
    supabase.from("cutoff_history").select("*"),
    supabase.from("bursaries").select("*"),
    supabase.from("deadlines").select("*"),
    supabase.from("cegeps").select("id, short_code"),
  ]);
  for (const res of [programs, cutoffs, bursaries, deadlines, cegeps]) {
    if (res.error) throw new Error(res.error.message);
  }

  const programRowBySlug = new Map((programs.data ?? []).filter((p) => p.catalog_slug).map((p) => [p.catalog_slug as string, p]));
  const programSlugById = new Map((programs.data ?? []).filter((p) => p.catalog_slug).map((p) => [p.id, p.catalog_slug as string]));
  const cegepCodeById = new Map((cegeps.data ?? []).map((c) => [c.id, c.short_code]));
  const cutoffsByProgram = new Map<string, CutoffRow[]>();
  for (const row of cutoffs.data ?? []) {
    if (!cutoffsByProgram.has(row.university_program_id)) cutoffsByProgram.set(row.university_program_id, []);
    cutoffsByProgram.get(row.university_program_id)!.push(row);
  }

  const stale: string[] = [];
  const universityPrograms: UniversityProgram[] = DEFAULT_CATALOG.universityPrograms.map((shipped) => {
    const row = programRowBySlug.get(shipped.id);
    if (!row) return shipped;
    if (row.last_verified_at < shipped.lastVerifiedAt) {
      stale.push(shipped.id);
      return shipped;
    }
    const history = (cutoffsByProgram.get(row.id) ?? []).map(toCutoffEntry).sort((a, b) => b.year - a.year);
    return {
      ...shipped,
      sourceUrl: row.source_url,
      lastVerifiedAt: row.last_verified_at,
      cutoffHistory: history.length > 0 ? history : shipped.cutoffHistory,
    };
  });

  const dbBursaries = (bursaries.data ?? []).map((row) => toBursary(row, cegepCodeById, programSlugById));
  const dbDeadlines = (deadlines.data ?? []).map(toImportantDate);

  return {
    catalog: {
      version: version.version,
      generatedAt: version.generatedAt,
      source: "db",
      cegeps: DEFAULT_CATALOG.cegeps,
      cegepPrograms: DEFAULT_CATALOG.cegepPrograms,
      universityPrograms,
      bursaries: dbBursaries.length > 0 ? dbBursaries : DEFAULT_CATALOG.bursaries,
      deadlines: dbDeadlines.length > 0 ? dbDeadlines : DEFAULT_CATALOG.deadlines,
      sessions: DEFAULT_CATALOG.sessions,
    },
    stale,
  };
}
