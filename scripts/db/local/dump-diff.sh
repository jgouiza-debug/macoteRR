#!/usr/bin/env bash
# Proves supabase/full_schema.sql builds the same database as the migrations: applies each to
# a fresh database on the local bed, dumps the schema of both, and diffs. Empty diff = pass.
#
#   scripts/db/local/dump-diff.sh        (needs the bed from scripts/db/local/up.sh)
set -euo pipefail
PORT="${MACOTE_PG_PORT:-54329}"; PASSWORD="${MACOTE_PG_PASSWORD:-pg}"
export PGPASSWORD="$PASSWORD"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
ADMIN="postgresql://postgres@127.0.0.1:${PORT}/postgres"
PSQL="$(command -v psql || echo /usr/lib/postgresql/16/bin/psql)"
PGDUMP="$(command -v pg_dump || echo /usr/lib/postgresql/16/bin/pg_dump)"
TMP="$(mktemp -d)"

build() { # $1 = dbname, $2.. = sql files
  local db="$1"; shift
  "$PSQL" -X -q "$ADMIN" -c "drop database if exists $db;" -c "create database $db;"
  "$PSQL" -X -q -v ON_ERROR_STOP=1 "postgresql://postgres@127.0.0.1:${PORT}/$db" -f "$ROOT/scripts/db/local/00-auth-shim.sql" >/dev/null
  for f in "$@"; do "$PSQL" -X -q -v ON_ERROR_STOP=1 "postgresql://postgres@127.0.0.1:${PORT}/$db" -f "$f" >/dev/null; done
  "$PGDUMP" --schema-only --no-owner --no-privileges --schema=public "postgresql://postgres@127.0.0.1:${PORT}/$db" \
    | grep -v -E '^(--|SET |SELECT pg_catalog|\\restrict|\\unrestrict|$)' > "$TMP/$db.sql"
}

build schema_from_migrations "$ROOT"/supabase/migrations/*.sql
build schema_from_full "$ROOT/supabase/full_schema.sql"

if diff -u "$TMP/schema_from_migrations.sql" "$TMP/schema_from_full.sql"; then
  echo "full_schema.sql builds the same schema as the migrations ($(wc -l < "$TMP/schema_from_full.sql") dump lines)."
else
  echo "DRIFT: full_schema.sql and the migrations build different schemas." >&2
  exit 1
fi
