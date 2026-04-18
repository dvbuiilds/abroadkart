#!/usr/bin/env bash
# Reset Postgres volume, recreate `auth` schema, push Keystone schema, run better-auth migrations.
# Usage (from repo root): ./scripts/reset-dev-data.sh
# Requires: Docker, yarn, and `.env.local` with DATABASE_URL + BETTER_AUTH_* (or export them first).

set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

: "${DATABASE_URL:?Set DATABASE_URL (e.g. in .env.local)}"
: "${BETTER_AUTH_SECRET:?Set BETTER_AUTH_SECRET}"
: "${BETTER_AUTH_URL:=http://localhost:3000}"

docker compose down -v
docker compose up -d postgres redis

echo "Waiting for Postgres..."
until docker exec abroadkart-postgres pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done

docker exec abroadkart-postgres psql -U postgres -d abroadkart -c 'CREATE SCHEMA IF NOT EXISTS auth;'

( cd keystone && yarn db:push )

npx --yes @better-auth/cli@1.4.21 migrate --config src/lib/auth.ts --yes

echo "Done. Start Keystone and Next.js, then sign up at /sign-up or run seeds."
