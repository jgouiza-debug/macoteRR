/**
 * Generic diff + review-status + promote script across every staging_* table, per
 * docs/02-scraping-collection-plan.md's pipeline architecture:
 *   1. `review` computes a diff against the last promoted row sharing a natural key and
 *      auto-flags large deltas (a cutoff jump, a bursary amount dropping to zero -- the
 *      doc's own two examples) for a human to look at twice, rather than silently accepting.
 *   2. `promote` takes staging rows a human has already set to review_status='approved' and
 *      writes them into production, setting last_verified_at to today.
 *
 * Usage:
 *   npx tsx scripts/collectors/promote/promote-staging.ts review [table]
 *   npx tsx scripts/collectors/promote/promote-staging.ts promote [table]
 * With no [table], runs across every configured table.
 */
import { createStagingClient } from "../lib/staging-client";
import type { Database, Json } from "@/lib/db/database.types";

type SupabaseStagingClient = ReturnType<typeof createStagingClient>;

type PromotionConfig = {
  stagingTable: keyof Database["public"]["Tables"] & `staging_${string}`;
  productionTable: keyof Database["public"]["Tables"];
  /** Identifies "the same real-world row" across staging and production, for diffing. */
  naturalKey: (row: Record<string, unknown>) => string;
  /** Strips staging-only pipeline columns, adds last_verified_at, for the production insert. */
  toProductionRow: (row: Record<string, unknown>, today: string) => Record<string, unknown>;
  /** Returns a human-readable reason to flag, or null if the change is unremarkable. */
  flagIfLargeChange?: (staged: Record<string, unknown>, previous: Record<string, unknown> | null) => string | null;
};

const PIPELINE_COLUMNS = [
  "id",
  "raw_snapshot_path",
  "collected_at",
  "collector_name",
  "diff_summary",
  "review_status",
  "promoted_at",
  "promoted_by",
];

function stripPipelineColumns(row: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (!PIPELINE_COLUMNS.includes(key)) result[key] = value;
  }
  return result;
}

/** Flags a cote R-scale field (roughly 0-50) that jumped by `threshold` or more, per the doc's own example. */
function flagCoteRJump(field: string, threshold = 10) {
  return (staged: Record<string, unknown>, previous: Record<string, unknown> | null): string | null => {
    if (!previous) return null;
    const before = Number(previous[field]);
    const after = Number(staged[field]);
    if (Number.isFinite(before) && Number.isFinite(after) && Math.abs(after - before) >= threshold) {
      return `${field} jumped from ${before} to ${after} (>= ${threshold})`;
    }
    return null;
  };
}

/** Flags a nullable amount field that had a positive value and is now exactly 0 (not null -- "no cap" isn't "dropped to zero"). */
function flagAmountDroppedToZero(fields: string[]) {
  return (staged: Record<string, unknown>, previous: Record<string, unknown> | null): string | null => {
    if (!previous) return null;
    for (const field of fields) {
      const before = previous[field];
      const after = staged[field];
      if (typeof before === "number" && before > 0 && after === 0) {
        return `${field} dropped to zero`;
      }
    }
    return null;
  };
}

const CONFIGS: PromotionConfig[] = [
  {
    stagingTable: "staging_cegep_programs",
    productionTable: "cegep_programs",
    naturalKey: (r) => `${r.cegep_id}:${r.program_code ?? r.name}`,
    toProductionRow: (r) => stripPipelineColumns(r),
  },
  {
    stagingTable: "staging_courses",
    productionTable: "courses",
    naturalKey: (r) => String(r.course_code),
    toProductionRow: (r) => stripPipelineColumns(r),
  },
  {
    stagingTable: "staging_university_programs",
    productionTable: "university_programs",
    naturalKey: (r) => `${r.university_id}:${r.name}`,
    toProductionRow: (r, today) => ({ ...stripPipelineColumns(r), last_verified_at: today }),
    flagIfLargeChange: flagCoteRJump("overall_cutoff"),
  },
  {
    stagingTable: "staging_university_program_prerequisites",
    productionTable: "university_program_prerequisites",
    naturalKey: (r) => `${r.university_program_id}:${r.course_id}`,
    toProductionRow: (r) => stripPipelineColumns(r),
  },
  {
    stagingTable: "staging_university_program_grade_floors",
    productionTable: "university_program_grade_floors",
    naturalKey: (r) => `${r.university_program_id}:${r.course_id}`,
    toProductionRow: (r) => stripPipelineColumns(r),
    // Only flag the cote-R-scale floors (roughly 0-50) with this threshold -- a 10-point
    // move on a course_percentage_floor (0-100) is far more mundane and would just add
    // false-positive noise, so those aren't flagged here.
    flagIfLargeChange: (staged, previous) =>
      staged.floor_type === "course_cote_r_floor" ? flagCoteRJump("min_grade")(staged, previous) : null,
  },
  {
    stagingTable: "staging_cutoff_history",
    productionTable: "cutoff_history",
    naturalKey: (r) => `${r.university_program_id}:${r.admission_year}`,
    toProductionRow: (r, today) => ({ ...stripPipelineColumns(r), verified_at: today }),
    flagIfLargeChange: flagCoteRJump("cote_r_last_admitted"),
  },
  {
    stagingTable: "staging_bursaries",
    productionTable: "bursaries",
    naturalKey: (r) => `${r.cegep_id ?? "province"}:${r.name}`,
    toProductionRow: (r, today) => ({ ...stripPipelineColumns(r), last_verified_at: today }),
    flagIfLargeChange: flagAmountDroppedToZero(["amount_min", "amount_max"]),
  },
  {
    stagingTable: "staging_deadlines",
    productionTable: "deadlines",
    naturalKey: (r) => `${r.type}:${r.applies_to_cegep_id ?? "province"}:${r.title}`,
    toProductionRow: (r, today) => ({ ...stripPipelineColumns(r), last_verified_at: today }),
  },
];

async function findPreviousProductionRow(
  supabase: SupabaseStagingClient,
  config: PromotionConfig,
  stagedRow: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  // Best-effort: only cheap enough to do a full-table fetch at this project's current scale
  // (a handful of Quebec City institutions). Revisit with a real query if that stops being true.
  const { data } = await supabase.from(config.productionTable).select("*");
  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  return rows.find((row) => config.naturalKey(row) === config.naturalKey(stagedRow)) ?? null;
}

async function review(supabase: SupabaseStagingClient, config: PromotionConfig) {
  const { data, error } = await supabase.from(config.stagingTable).select("*").eq("review_status", "pending");
  if (error) throw error;

  for (const row of (data ?? []) as unknown as Record<string, unknown>[]) {
    const previous = await findPreviousProductionRow(supabase, config, row);
    const reason = config.flagIfLargeChange?.(row, previous) ?? null;
    // Round-trip through JSON to get a value the `Json` column type actually accepts
    // (this also drops anything non-serializable, which is what we want here).
    const diff_summary: Json = JSON.parse(
      JSON.stringify({ previous, staged: stripPipelineColumns(row), flagged_reason: reason }),
    );

    await supabase
      .from(config.stagingTable)
      .update({ diff_summary, review_status: reason ? "flagged" : "pending" })
      .eq("id", row.id as string);

    if (reason) console.log(`[${config.stagingTable}] FLAGGED ${row.id}: ${reason}`);
  }
}

async function promote(supabase: SupabaseStagingClient, config: PromotionConfig) {
  const { data, error } = await supabase.from(config.stagingTable).select("*").eq("review_status", "approved");
  if (error) throw error;

  const today = new Date().toISOString().slice(0, 10);

  for (const row of (data ?? []) as unknown as Record<string, unknown>[]) {
    // Re-promoting an already-existing natural key (e.g. a corrected cutoff, an amended
    // bursary) must update that row, not insert a second one alongside it — production
    // tables aren't all guaranteed a DB-level unique constraint on the natural key to make
    // a plain `.insert()` fail loudly, so silently duplicating is the likelier outcome.
    const existing = await findPreviousProductionRow(supabase, config, row);
    const productionRow = config.toProductionRow(row, today);
    // `config.productionTable` is a runtime value drawn from a union of every table name, so
    // the typed client can't narrow Insert/Update to the one real table here -- each `CONFIGS`
    // entry above is still individually type-correct where it's declared, which is what
    // actually keeps this safe. Widen the builder itself rather than fighting the generic
    // per-call, since Update/Insert/eq all re-derive the same unresolvable table union.
    const table = supabase.from(config.productionTable) as unknown as {
      update: (row: Record<string, unknown>) => { eq: (column: string, value: string) => PromiseLike<{ error: { message: string } | null }> };
      insert: (row: Record<string, unknown>) => PromiseLike<{ error: { message: string } | null }>;
    };
    const writeError = existing
      ? (await table.update(productionRow).eq("id", existing.id as string)).error
      : (await table.insert(productionRow)).error;
    if (writeError) {
      console.error(`[${config.stagingTable}] promote failed for ${row.id}: ${writeError.message}`);
      continue;
    }
    await supabase
      .from(config.stagingTable)
      .update({ promoted_at: new Date().toISOString(), promoted_by: process.env.USER ?? process.env.USERNAME ?? "unknown" })
      .eq("id", row.id as string);
    console.log(`[${config.stagingTable}] promoted ${row.id} -> ${config.productionTable}`);
  }
}

async function main() {
  const [, , mode, tableArg] = process.argv;
  if (mode !== "review" && mode !== "promote") {
    console.error("Usage: promote-staging.ts <review|promote> [staging_table]");
    process.exitCode = 1;
    return;
  }

  const configs = tableArg ? CONFIGS.filter((c) => c.stagingTable === tableArg) : CONFIGS;
  if (configs.length === 0) {
    console.error(`Unknown staging table: ${tableArg}`);
    process.exitCode = 1;
    return;
  }

  const supabase = createStagingClient();
  for (const config of configs) {
    if (mode === "review") await review(supabase, config);
    else await promote(supabase, config);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
