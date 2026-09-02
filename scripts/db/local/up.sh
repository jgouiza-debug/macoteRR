#!/usr/bin/env bash
# Stands up the local verification bed: a Postgres 16 instance, the auth shim, every migration
# in order, then the catalogue seed. Idempotent: re-running recreates the database from
# scratch so a stale schema can never hide a broken migration.
#
#   scripts/db/local/up.sh            # create/reset and load
#   scripts/db/local/up.sh --no-seed  # migrations only
#
# Two ways to get a server, picked automatically:
#   docker  - `docker run postgres:16` when a Docker daemon is reachable.
#   local   - the postgres binaries on PATH or under /usr/lib/postgresql/16/bin, run as a
#             dedicated unprivileged user (postgres refuses to start as root). Data dir is
#             $MACOTE_PG_DATA (default /var/lib/macote-pg).
# Force one with MACOTE_PG_MODE=docker|local.
#
# Prints the DATABASE_URL to export for scripts/benchmark/test-rls.ts and friends.
set -euo pipefail

PORT="${MACOTE_PG_PORT:-54329}"
DB="${MACOTE_PG_DB:-macote}"
PASSWORD="${MACOTE_PG_PASSWORD:-pg}"
CONTAINER="${MACOTE_PG_CONTAINER:-macote-pg}"
DATA_DIR="${MACOTE_PG_DATA:-/var/lib/macote-pg}"
PG_USER="${MACOTE_PG_OS_USER:-pglocal}"
SEED=1
for arg in "$@"; do
  case "$arg" in
    --no-seed) SEED=0 ;;
    *) echo "unknown argument: $arg" >&2; exit 2 ;;
  esac
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
HERE="$ROOT/scripts/db/local"
export PGPASSWORD="$PASSWORD"
ADMIN_URL="postgresql://postgres@127.0.0.1:${PORT}/postgres"
DATABASE_URL="postgresql://postgres:${PASSWORD}@127.0.0.1:${PORT}/${DB}"

pg_bin() {
  if command -v "$1" >/dev/null 2>&1; then command -v "$1"; return; fi
  for d in /usr/lib/postgresql/16/bin /usr/lib/postgresql/*/bin /usr/local/pgsql/bin; do
    if [ -x "$d/$1" ]; then echo "$d/$1"; return; fi
  done
  echo "$1: not found" >&2; return 1
}

MODE="${MACOTE_PG_MODE:-}"
if [ -z "$MODE" ]; then
  if docker info >/dev/null 2>&1; then MODE=docker; else MODE=local; fi
fi

start_docker() {
  if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
    docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
    docker run -d --name "$CONTAINER" \
      -e POSTGRES_PASSWORD="$PASSWORD" \
      -p "${PORT}:5432" postgres:16 >/dev/null
  fi
  for _ in $(seq 1 60); do
    docker exec "$CONTAINER" pg_isready -U postgres >/dev/null 2>&1 && return 0
    sleep 1
  done
  echo "postgres container did not become ready" >&2; return 1
}

start_local() {
  local initdb pg_ctl
  initdb="$(pg_bin initdb)"; pg_ctl="$(pg_bin pg_ctl)"
  if [ "$(id -u)" = "0" ]; then
    id "$PG_USER" >/dev/null 2>&1 || useradd --system --create-home --shell /bin/bash "$PG_USER"
    mkdir -p "$DATA_DIR"; chown "$PG_USER" "$DATA_DIR"; chmod 700 "$DATA_DIR"
    run_as() { runuser -u "$PG_USER" -- "$@"; }
  else
    mkdir -p "$DATA_DIR"; chmod 700 "$DATA_DIR"
    run_as() { "$@"; }
  fi
  if [ ! -f "$DATA_DIR/PG_VERSION" ]; then
    local pwfile; pwfile="$(mktemp)"; printf '%s' "$PASSWORD" > "$pwfile"; chmod 644 "$pwfile"
    run_as "$initdb" -D "$DATA_DIR" -U postgres --auth=scram-sha-256 --pwfile="$pwfile" -E UTF8 --locale=C.UTF-8 >/dev/null
    rm -f "$pwfile"
  fi
  if ! run_as "$pg_ctl" -D "$DATA_DIR" status >/dev/null 2>&1; then
    run_as "$pg_ctl" -D "$DATA_DIR" -l "$DATA_DIR/server.log" \
      -o "-p ${PORT} -c listen_addresses=127.0.0.1 -c unix_socket_directories=${DATA_DIR} -c shared_preload_libraries=pg_stat_statements" \
      -w start >/dev/null
  fi
}

echo "postgres: $MODE"
case "$MODE" in
  docker) start_docker ;;
  local) start_local ;;
  *) echo "MACOTE_PG_MODE must be docker or local" >&2; exit 2 ;;
esac

PSQL="$(pg_bin psql)"
"$PSQL" -X -q "$ADMIN_URL" -c "drop database if exists ${DB};" -c "create database ${DB};"

apply() {
  local file="$1"
  echo "  apply $(realpath --relative-to="$ROOT" "$file")"
  "$PSQL" -X -q -v ON_ERROR_STOP=1 "$DATABASE_URL" -f "$file" >/dev/null
}

echo "auth shim"
apply "$HERE/00-auth-shim.sql"

echo "migrations"
for f in "$ROOT"/supabase/migrations/*.sql; do apply "$f"; done

if [ "$SEED" = "1" ]; then
  echo "seed"
  apply "$ROOT/supabase/seed/catalog.sql"
fi

echo
"$PSQL" -X -q "$DATABASE_URL" -At -c "
  select 'tables: ' || count(*) from information_schema.tables where table_schema = 'public';
  select 'cegeps: ' || count(*) from cegeps;
  select 'cegep_programs: ' || count(*) from cegep_programs;
  select 'universities: ' || count(*) from universities;
  select 'university_programs: ' || count(*) from university_programs;
  select 'bursaries: ' || count(*) from bursaries;
  select 'cutoff_history: ' || count(*) from cutoff_history;
  select 'deadlines: ' || count(*) from deadlines;
"
echo
echo "DATABASE_URL=${DATABASE_URL}"
