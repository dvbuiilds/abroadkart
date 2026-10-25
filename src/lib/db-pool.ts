/**
 * Postgres pools for the same DATABASE_URL. `getPool()` runs on the default
 * `public` schema (Keystone's `"User"` table). `getAuthPool()` sets `search_path`
 * to `auth`, because better-auth reads its migration state from the connection's
 * search_path and creates tables there.
 */
import pg from "pg";

let pool: pg.Pool | null = null;
let authPool: pg.Pool | null = null;

function createPool(options: pg.PoolConfig = {}): pg.Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  return new pg.Pool({ connectionString, ...options });
}

export function getPool(): pg.Pool {
  if (!pool) {
    pool = createPool();
  }
  return pool;
}

export function getAuthPool(): pg.Pool {
  if (!authPool) {
    authPool = createPool({ options: "-c search_path=auth" });
  }
  return authPool;
}
