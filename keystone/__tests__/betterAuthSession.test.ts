/**
 * Session strategy: Bearer header and ab_admin_session cookie paths.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Request } from "express";
import {
  createBetterAuthSession,
  loadSessionForAuthUser,
  type SessionData,
} from "../lib/betterAuthSession";

function mockReq(partial: {
  authorization?: string;
  cookie?: string;
}): Request {
  const headers: Record<string, string | undefined> = {};
  if (partial.authorization) headers.authorization = partial.authorization;
  if (partial.cookie !== undefined) headers.cookie = partial.cookie;
  return { headers } as Request;
}

describe("createBetterAuthSession", () => {
  const activeUser: SessionData = {
    id: "ks-user-1",
    email: "a@b.com",
    name: "Test",
    role: "consultantAgent",
    isActive: true,
  };

  it("returns session when Bearer token verifies and user is active", async () => {
    const strategy = createBetterAuthSession({
      verifyJwt: async () => ({ sub: "auth-1" }),
    });
    const context = {
      req: mockReq({ authorization: "Bearer tok" }),
      sudo: () => ({
        query: {
          User: {
            findOne: async () => ({
              ...activeUser,
            }),
          },
        },
      }),
    };
    const session = await strategy.get?.({ context: context as never });
    assert.ok(session);
    assert.equal(session!.id, "ks-user-1");
  });

  it("reads token from ab_admin_session cookie when no Bearer", async () => {
    const strategy = createBetterAuthSession({
      verifyJwt: async () => ({ sub: "auth-2" }),
    });
    const context = {
      req: mockReq({
        cookie: "ab_admin_session=cookieval; other=1",
      }),
      sudo: () => ({
        query: {
          User: {
            findOne: async () => ({ ...activeUser, id: "u2" }),
          },
        },
      }),
    };
    const session = await strategy.get?.({ context: context as never });
    assert.ok(session);
    assert.equal(session!.id, "u2");
  });

  it("returns undefined when no token", async () => {
    const strategy = createBetterAuthSession({
      verifyJwt: async () => {
        throw new Error("should not run");
      },
    });
    const context = {
      req: mockReq({}),
      sudo() {
        return {
          query: {
            User: {
              findOne: async (): Promise<null> => null,
            },
          },
        };
      },
    };
    const session = await strategy.get?.({ context: context as never });
    assert.equal(session, undefined);
  });

  it("returns undefined when verifyJwt throws", async () => {
    const strategy = createBetterAuthSession({
      verifyJwt: async () => {
        throw new Error("bad sig");
      },
    });
    const context = {
      req: mockReq({ authorization: "Bearer x" }),
      sudo() {
        return {
          query: {
            User: {
              findOne: async (): Promise<null> => null,
            },
          },
        };
      },
    };
    const session = await strategy.get?.({ context: context as never });
    assert.equal(session, undefined);
  });
});

describe("loadSessionForAuthUser", () => {
  it("returns undefined when user missing", async () => {
    const ctx = {
      sudo: () => ({
        query: {
          User: {
            findOne: async () => null,
          },
        },
      }),
    };
    const out = await loadSessionForAuthUser(ctx, "nope");
    assert.equal(out, undefined);
  });

  it("returns undefined when user inactive", async () => {
    const ctx = {
      sudo: () => ({
        query: {
          User: {
            findOne: async () => ({
              id: "1",
              email: "a@b.com",
              name: "x",
              role: "consultantAgent",
              tenant: null,
              isActive: false,
            }),
          },
        },
      }),
    };
    const out = await loadSessionForAuthUser(ctx, "auth");
    assert.equal(out, undefined);
  });

  it("returns session when user is active with role pending", async () => {
    const ctx = {
      sudo: () => ({
        query: {
          User: {
            findOne: async () => ({
              id: "2",
              email: "new@b.com",
              name: "New",
              role: "pending",
              tenant: null,
              isActive: true,
            }),
          },
        },
      }),
    };
    const out = await loadSessionForAuthUser(ctx, "auth");
    assert.ok(out);
    assert.equal(out!.role, "pending");
  });
});
