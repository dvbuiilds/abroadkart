#!/bin/sh
# Ensures Better Auth's Postgres schema exists, then applies Kysely migrations.
# Used by docker-compose `nextjs-migrate` (builder image). Safe to re-run.
set -e
cd /app

node -e "
const { Client } = require('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL });
c.connect()
  .then(() => c.query('CREATE SCHEMA IF NOT EXISTS auth'))
  .then(() => c.end())
  .catch((e) => { console.error(e); process.exit(1); });
"

exec yarn auth:migrate
