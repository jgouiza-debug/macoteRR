/**
 * Regenerates the `Database` type in src/lib/db/database.types.ts from a live Postgres,
 * without Docker: `supabase gen types --db-url` still shells out to a pg-meta container,
 * which this environment cannot run, so this reads information_schema and pg_constraint
 * through psql instead.
 *
 *   DATABASE_URL=postgresql://... npm run gen:types          # rewrite the Database type
 *   DATABASE_URL=postgresql://... npm run gen:types -- --check   # exit 1 if it would change
 *
 * Everything ABOVE `export type Database =` in the file (the Json type and the named unions
 * other modules import) is kept verbatim; only the Database type is regenerated. Enum-like
 * columns get their union straight from the CHECK constraint, so a widened constraint shows
 * up here on the next run instead of drifting silently.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../..");
const FILE = path.join(ROOT, "src/lib/db/database.types.ts");

type Column = {
  table_name: string;
  column_name: string;
  ordinal_position: number;
  data_type: string;
  udt_name: string;
  is_nullable: "YES" | "NO";
  column_default: string | null;
};
type Constraint = { table_name: string; def: string };

function databaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envFile = path.join(ROOT, ".env.local");
  const line = existsSync(envFile)
    ? readFileSync(envFile, "utf8").split("\n").find((l) => l.startsWith("DATABASE_URL="))
    : undefined;
  if (!line) throw new Error("DATABASE_URL is not set (start the bed: npm run db:local)");
  return line.slice("DATABASE_URL=".length).trim();
}

function query<T>(url: string, sql: string): T {
  const psql = ["/usr/bin/psql", "/usr/lib/postgresql/16/bin/psql"].find(existsSync) ?? "psql";
  const res = spawnSync(psql, ["-X", "-At", "-v", "ON_ERROR_STOP=1", "-c", sql, url], { encoding: "utf8" });
  if (res.status !== 0) throw new Error(res.stderr || "psql failed");
  return JSON.parse(res.stdout.trim() || "null") as T;
}

const url = databaseUrl();
const columns = query<Column[]>(
  url,
  `select coalesce(json_agg(t order by t.table_name, t.ordinal_position), '[]') from (
     select table_name, column_name, ordinal_position, data_type, udt_name, is_nullable, column_default
       from information_schema.columns where table_schema = 'public') t`,
);
const constraints = query<Constraint[]>(
  url,
  `select coalesce(json_agg(t), '[]') from (
     select conrelid::regclass::text as table_name, pg_get_constraintdef(oid) as def
       from pg_constraint where contype = 'c' and connamespace = 'public'::regnamespace) t`,
);

/** `(col = ANY (ARRAY['a'::text, 'b'::text]))` (possibly wrapped in `col IS NULL OR …`) → union. */
const unions = new Map<string, string[]>();
for (const c of constraints) {
  const m = c.def.match(/\(\((\w+)\)::text = ANY \(\(?ARRAY\[([^\]]+)\]/) ?? c.def.match(/\((\w+) = ANY \(ARRAY\[([^\]]+)\]/);
  if (!m) continue;
  const literals = [...m[2].matchAll(/'((?:[^']|'')*)'/g)].map((x) => x[1].replace(/''/g, "'"));
  if (literals.length > 0) unions.set(`${c.table_name}.${m[1]}`, literals);
}

function tsType(col: Column): string {
  const union = unions.get(`${col.table_name}.${col.column_name}`);
  if (union) return union.map((v) => JSON.stringify(v)).join(" | ");
  if (col.data_type === "ARRAY") {
    const inner = col.udt_name.replace(/^_/, "");
    if (/^(int|float|numeric)/.test(inner)) return "number[]";
    return "string[]";
  }
  switch (col.udt_name) {
    case "bool":
      return "boolean";
    case "int2":
    case "int4":
    case "int8":
    case "float4":
    case "float8":
    case "numeric":
      return "number";
    case "json":
    case "jsonb":
      return "Json";
    default:
      return "string";
  }
}

const byTable = new Map<string, Column[]>();
for (const col of columns) {
  if (!byTable.has(col.table_name)) byTable.set(col.table_name, []);
  byTable.get(col.table_name)!.push(col);
}

const indent = (n: number) => "  ".repeat(n);
const out: string[] = ["export type Database = {", `${indent(1)}public: {`, `${indent(2)}Tables: {`];
for (const [table, cols] of [...byTable].sort(([a], [b]) => a.localeCompare(b))) {
  out.push(`${indent(3)}${table}: {`);
  out.push(`${indent(4)}Row: {`);
  for (const col of cols) {
    const nullable = col.is_nullable === "YES" ? " | null" : "";
    out.push(`${indent(5)}${col.column_name}: ${tsType(col)}${nullable};`);
  }
  out.push(`${indent(4)}};`);
  out.push(`${indent(4)}Insert: {`);
  for (const col of cols) {
    const optional = col.is_nullable === "YES" || col.column_default !== null ? "?" : "";
    const nullable = col.is_nullable === "YES" ? " | null" : "";
    out.push(`${indent(5)}${col.column_name}${optional}: ${tsType(col)}${nullable};`);
  }
  out.push(`${indent(4)}};`);
  out.push(`${indent(4)}Update: {`);
  for (const col of cols) {
    const nullable = col.is_nullable === "YES" ? " | null" : "";
    out.push(`${indent(5)}${col.column_name}?: ${tsType(col)}${nullable};`);
  }
  out.push(`${indent(4)}};`);
  out.push(`${indent(4)}Relationships: [];`);
  out.push(`${indent(3)}};`);
}
out.push(`${indent(2)}};`);
out.push(`${indent(2)}Views: Record<string, never>;`);
out.push(`${indent(2)}Functions: Record<string, never>;`);
out.push(`${indent(2)}Enums: Record<string, never>;`);
out.push(`${indent(2)}CompositeTypes: Record<string, never>;`);
out.push(`${indent(1)}};`);
out.push("};");

const current = readFileSync(FILE, "utf8");
const marker = "export type Database =";
const at = current.indexOf(marker);
if (at === -1) throw new Error(`${FILE}: "${marker}" not found`);
const header = current.slice(0, at).replace(/\s+$/, "");
const generated = `${header}\n\n// ---- GENERATED below this line by scripts/db/gen-types.ts (${byTable.size} tables) ----\n\n${out.join("\n")}\n`;

if (process.argv.includes("--check")) {
  if (current !== generated) {
    console.error("database.types.ts is out of date with the database — run `npm run gen:types`.");
    process.exit(1);
  }
  console.log(`database.types.ts matches the database (${byTable.size} tables).`);
} else {
  writeFileSync(FILE, generated);
  console.log(`wrote database.types.ts: ${byTable.size} tables, ${columns.length} columns, ${unions.size} check-constraint unions.`);
}
