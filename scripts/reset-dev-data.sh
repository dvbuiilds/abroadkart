#!/usr/bin/env bash
# Reset Postgres volume, run Better Auth migrations against the local Postgres, push Keystone schema.
# Usage (from repo root): ./scripts/reset-dev-data.sh
# Requires: Docker, `.env` with POSTGRES_PASSWORD + BETTER_AUTH_* (Compose loads these for migrate).

set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

if [[ -f .env ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

: "${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD in .env for Compose}"
: "${BETTER_AUTH_SECRET:?Set BETTER_AUTH_SECRET in .env}"

docker compose down -v
docker compose up -d postgres

echo "Waiting for Postgres..."
until docker exec abroadkart-postgres pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done

echo "Running Better Auth migrations..."
DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5432/abroadkart" yarn auth:migrate

( cd keystone && yarn db:push )

echo "Done. Start Keystone and Next.js (e.g. docker compose up -d), then sign up at /sign-up or run seeds."
