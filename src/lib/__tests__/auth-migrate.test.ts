// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { query, getPoolMock, getMigrationsMock, getAuthMock } = vi.hoisted(() => {
  const query = vi.fn();
  return {
    query,
    getPoolMock: vi.fn(() => ({ query })),
    getMigrationsMock: vi.fn(),
    getAuthMock: vi.fn(() => ({ options: { appName: "test" } })),
  };
});

vi.mock("better-auth/db/migration", () => ({ getMigrations: getMigrationsMock }));
vi.mock("@app/lib/auth", () => ({ getAuth: getAuthMock }));
vi.mock("@app/lib/db-pool", () => ({ getPool: getPoolMock }));

import { ensureAuthSchema } from "@app/lib/auth-migrate";

function pendingPlan(overrides: { toBeCreated?: string[]; toBeAdded?: string[] } = {}) {
  const runMigrations = vi.fn().mockResolvedValue(undefined);
  return {
    plan: {
      toBeCreated: (overrides.toBeCreated ?? []).map((table) => ({ table, fields: {}, order: 1 })),
      toBeAdded: (overrides.toBeAdded ?? []).map((table) => ({ table, fields: {}, order: 2 })),
      runMigrations,
      compileMigrations: vi.fn(),
    },
    runMigrations,
  };
}

describe("ensureAuthSchema", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    query.mockResolvedValue({ rows: [] });
  });

  it("creates the auth schema before checking tables", async () => {
    getMigrationsMock.mockResolvedValue(pendingPlan().plan);

    await ensureAuthSchema();

    expect(query).toHaveBeenCalledWith("CREATE SCHEMA IF NOT EXISTS auth");
    expect(getMigrationsMock).toHaveBeenCalledWith({ appName: "test" });
  });

  it("does not run migrations when every table already matches", async () => {
    const { plan, runMigrations } = pendingPlan();
    getMigrationsMock.mockResolvedValue(plan);

    await ensureAuthSchema();

    expect(runMigrations).not.toHaveBeenCalled();
  });

  it("runs migrations when tables are missing or need columns", async () => {
    const { plan, runMigrations } = pendingPlan({
      toBeCreated: ["user", "session"],
      toBeAdded: ["account"],
    });
    getMigrationsMock.mockResolvedValue(plan);

    await ensureAuthSchema();

    expect(runMigrations).toHaveBeenCalledTimes(1);
  });

  it("rethrows when a migration fails so the server does not start half-migrated", async () => {
    const { plan, runMigrations } = pendingPlan({ toBeCreated: ["user"] });
    runMigrations.mockRejectedValue(new Error("permission denied"));
    getMigrationsMock.mockResolvedValue(plan);

    await expect(ensureAuthSchema()).rejects.toThrow("permission denied");
  });
});
