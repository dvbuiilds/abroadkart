#!/bin/sh
# Ensures Better Auth's Postgres schema exists, then applies Kysely migrations.
# Used by docker-compose `nextjs-migrate` (builder image). Safe to re-run.
set -e
cd /app

set +e
node -e "
const { Client } = require('pg');

const requiredTables = ['user', 'session', 'account', 'verification', 'jwks'];
const c = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await c.connect();
  await c.query('CREATE SCHEMA IF NOT EXISTS auth');

  const { rows } = await c.query(
    \`SELECT table_name
       FROM information_schema.tables
      WHERE table_schema = 'auth'
        AND table_name = ANY(\$1::text[])\`,
    [requiredTables],
  );

  const existing = new Set(rows.map((r) => r.table_name));
  const missing = requiredTables.filter((t) => !existing.has(t));

  if (missing.length === 0) {
    console.log('All Better Auth tables already exist in auth schema; skipping migration.');
    await c.end();
    process.exit(0);
  }

  console.log('Missing Better Auth tables:', missing.join(', '));
  await c.end();
  process.exit(10);
}

main().catch(async (e) => {
  console.error(e);
  try { await c.end(); } catch (_) {}
  process.exit(1);
});
"
status=$?
set -e
if [ "$status" -eq 10 ]; then
  exec yarn auth:migrate
fi

if [ "$status" -ne 0 ]; then
  echo "Failed checking Better Auth tables."
  exit "$status"
fi
