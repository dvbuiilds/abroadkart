// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { PoolMock } = vi.hoisted(() => ({ PoolMock: vi.fn() }));

vi.mock("pg", () => ({ default: { Pool: PoolMock } }));

describe("db pools", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv("DATABASE_URL", "postgresql://user:pass@localhost:5432/abroadkart");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps getPool on the default public schema", async () => {
    const { getPool: freshGetPool } = await import("@app/lib/db-pool");

    freshGetPool();

    expect(PoolMock).toHaveBeenCalledWith({
      connectionString: "postgresql://user:pass@localhost:5432/abroadkart",
    });
  });

  it("points getAuthPool at the auth schema via search_path", async () => {
    const { getAuthPool: freshGetAuthPool } = await import("@app/lib/db-pool");

    freshGetAuthPool();

    expect(PoolMock).toHaveBeenCalledWith({
      connectionString: "postgresql://user:pass@localhost:5432/abroadkart",
      options: "-c search_path=auth",
    });
  });

  it("returns a separate pool for auth than for the default schema", async () => {
    const { getPool: freshGetPool, getAuthPool: freshGetAuthPool } = await import(
      "@app/lib/db-pool"
    );

    expect(freshGetAuthPool()).not.toBe(freshGetPool());
  });

  it("throws when DATABASE_URL is unset", async () => {
    vi.stubEnv("DATABASE_URL", "");
    const { getAuthPool: freshGetAuthPool } = await import("@app/lib/db-pool");

    expect(() => freshGetAuthPool()).toThrow("DATABASE_URL is not set");
  });
});
