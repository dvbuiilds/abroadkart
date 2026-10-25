/**
 * Creates the Better Auth `auth` schema and tables when the Next.js server starts.
 * Replaces the one-shot `nextjs-migrate` container. Safe on every boot: when the
 * tables already match the config, nothing is written.
 */
import { getMigrations } from "better-auth/db/migration";
import { getAuth } from "@app/lib/auth";
import { getPool } from "@app/lib/db-pool";

export async function ensureAuthSchema(): Promise<void> {
  await getPool().query("CREATE SCHEMA IF NOT EXISTS auth");

  const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(
    getAuth().options,
  );
  const pendingTables = [...toBeCreated, ...toBeAdded].map(
    (change) => change.table,
  );

  if (pendingTables.length === 0) {
    console.log("[auth-migrate] Better Auth schema is up to date.");
    return;
  }

  console.log(
    `[auth-migrate] Applying Better Auth changes to: ${pendingTables.join(", ")}`,
  );
  await runMigrations();
}
