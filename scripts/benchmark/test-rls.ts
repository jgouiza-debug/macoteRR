/**
 * Runs scripts/db/rls.test.sql against a real database and reports the result.
 *
 *   DATABASE_URL=postgresql://postgres:pg@127.0.0.1:54329/macote npm run test:rls
 *
 * Without DATABASE_URL (it is also read from .env.local) the script explains how to start the
 * local bed and exits 2. It never prints PASS without having connected to a database — the
 * version this replaced compared three string literals to each other and always said PASS.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "../..");
const SQL = path.join(ROOT, "scripts/db/rls.test.sql");

export type RlsRun = { ok: boolean; skipped: boolean; output: string };

function databaseUrl(): string | null {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envFile = path.join(ROOT, ".env.local");
  if (!existsSync(envFile)) return null;
  const line = readFileSync(envFile, "utf8")
    .split("\n")
    .find((l) => l.startsWith("DATABASE_URL="));
  return line ? line.slice("DATABASE_URL=".length).trim() : null;
}

export function runRlsTest(): RlsRun {
  const url = databaseUrl();
  if (!url) {
    return {
      ok: false,
      skipped: true,
      output: "DATABASE_URL is not set. Start the local bed with `npm run db:local` and export the URL it prints.",
    };
  }
  const psql = ["/usr/bin/psql", "/usr/lib/postgresql/16/bin/psql"].find(existsSync) ?? "psql";
  const res = spawnSync(psql, ["-X", "-v", "ON_ERROR_STOP=1", "-f", SQL, url], {
    encoding: "utf8",
    env: process.env,
  });
  const output = `${res.stdout ?? ""}${res.stderr ?? ""}`.trim();
  return { ok: res.status === 0, skipped: false, output: output || (res.error ? String(res.error) : "") };
}

if (require.main === module) {
  const run = runRlsTest();
  console.log(run.output);
  if (run.skipped) process.exit(2);
  process.exit(run.ok ? 0 : 1);
}
