-- Runs once when Postgres initializes a new data volume (docker-entrypoint-initdb.d).
-- Idempotent; `nextjs-migrate` also runs CREATE SCHEMA IF NOT EXISTS for existing volumes.
CREATE SCHEMA IF NOT EXISTS auth;
