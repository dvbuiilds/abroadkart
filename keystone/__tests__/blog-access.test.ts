/**
 * Blog access control tests (BlogPost, BlogCategory, BlogLead).
 * Run: npm run test
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import {
  isPublishedOrSuperAdmin,
  hasInternalKey,
} from "../access/rules";
import { isValidEmail } from "../lib/isValidEmail";
import { BlogPost } from "../schema/BlogPost";
import { BlogCategory } from "../schema/BlogCategory";
import { BlogLead } from "../schema/BlogLead";

const KEY = "test-leads-key-0123456789";

type TestSession = {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
};

const session = (role: string): TestSession => ({
  id: `user-${role}`,
  email: `${role}@example.com`,
  name: role,
  role,
  isActive: true,
});

const NON_SUPER_ROLES = [
  "pending",
  "fulfilment",
  "consultantAdmin",
  "consultantAgent",
];

const ctxWithKey = (key: string | undefined) => ({
  req: { headers: key === undefined ? {} : { "x-internal-key": key } },
});

// Keystone access functions are called as (args) => boolean | filter.
// The types are loose here on purpose: these tests only check runtime behaviour.
/* eslint-disable @typescript-eslint/no-explicit-any */
const op = (list: any, name: string) => list.access.operation[name];

describe("isPublishedOrSuperAdmin", () => {
  it("returns true for superAdmin", () => {
    assert.strictEqual(
      isPublishedOrSuperAdmin({ session: session("superAdmin") } as any),
      true,
    );
  });

  it("returns a published-only filter for anonymous callers", () => {
    assert.deepStrictEqual(isPublishedOrSuperAdmin({ session: undefined } as any), {
      status: { equals: "published" },
    });
  });

  for (const role of NON_SUPER_ROLES) {
    it(`returns a published-only filter for ${role}`, () => {
      assert.deepStrictEqual(
        isPublishedOrSuperAdmin({ session: session(role) } as any),
        { status: { equals: "published" } },
      );
    });
  }
});

describe("BlogPost access", () => {
  it("applies the published-only filter to queries", () => {
    assert.deepStrictEqual(
      (BlogPost.access as any).filter.query({ session: undefined }),
      { status: { equals: "published" } },
    );
  });

  it("allows anonymous query", () => {
    assert.strictEqual(op(BlogPost, "query")({ session: undefined }), true);
  });

  it("denies create, update and delete to anonymous callers", () => {
    for (const name of ["create", "update", "delete"]) {
      assert.strictEqual(
        op(BlogPost, name)({ session: undefined }),
        false,
        `${name} should be denied`,
      );
    }
  });

  for (const role of NON_SUPER_ROLES) {
    it(`denies create, update and delete to ${role}`, () => {
      for (const name of ["create", "update", "delete"]) {
        assert.strictEqual(
          op(BlogPost, name)({ session: session(role) }),
          false,
          `${name} should be denied for ${role}`,
        );
      }
    });
  }

  it("allows create, update and delete to superAdmin", () => {
    for (const name of ["create", "update", "delete"]) {
      assert.strictEqual(
        op(BlogPost, name)({ session: session("superAdmin") }),
        true,
        `${name} should be allowed for superAdmin`,
      );
    }
  });
});

describe("BlogCategory access", () => {
  it("allows anonymous query", () => {
    assert.strictEqual(op(BlogCategory, "query")({ session: undefined }), true);
  });

  it("denies mutations to anonymous and non-superAdmin roles", () => {
    for (const name of ["create", "update", "delete"]) {
      assert.strictEqual(op(BlogCategory, name)({ session: undefined }), false);
      for (const role of NON_SUPER_ROLES) {
        assert.strictEqual(
          op(BlogCategory, name)({ session: session(role) }),
          false,
          `${name} should be denied for ${role}`,
        );
      }
    }
  });

  it("allows mutations to superAdmin", () => {
    for (const name of ["create", "update", "delete"]) {
      assert.strictEqual(
        op(BlogCategory, name)({ session: session("superAdmin") }),
        true,
      );
    }
  });
});

describe("hasInternalKey", () => {
  let saved: string | undefined;

  beforeEach(() => {
    saved = process.env.LEADS_INTERNAL_KEY;
    process.env.LEADS_INTERNAL_KEY = KEY;
  });

  afterEach(() => {
    if (saved === undefined) delete process.env.LEADS_INTERNAL_KEY;
    else process.env.LEADS_INTERNAL_KEY = saved;
  });

  it("returns true for the exact key", () => {
    assert.strictEqual(hasInternalKey({ context: ctxWithKey(KEY) } as any), true);
  });

  it("returns false when the header is missing", () => {
    assert.strictEqual(
      hasInternalKey({ context: ctxWithKey(undefined) } as any),
      false,
    );
  });

  it("returns false for a wrong key", () => {
    assert.strictEqual(
      hasInternalKey({ context: ctxWithKey("wrong-key-0123456789") } as any),
      false,
    );
  });

  it("returns false for a key with a different length (no prefix match)", () => {
    assert.strictEqual(
      hasInternalKey({ context: ctxWithKey(KEY.slice(0, 5)) } as any),
      false,
    );
  });

  it("fails closed when LEADS_INTERNAL_KEY is unset", () => {
    delete process.env.LEADS_INTERNAL_KEY;
    assert.strictEqual(
      hasInternalKey({ context: ctxWithKey(undefined) } as any),
      false,
    );
    assert.strictEqual(hasInternalKey({ context: ctxWithKey("") } as any), false);
  });

  it("fails closed when LEADS_INTERNAL_KEY is empty", () => {
    process.env.LEADS_INTERNAL_KEY = "";
    assert.strictEqual(hasInternalKey({ context: ctxWithKey("") } as any), false);
  });
});

describe("BlogLead access", () => {
  let saved: string | undefined;

  beforeEach(() => {
    saved = process.env.LEADS_INTERNAL_KEY;
    process.env.LEADS_INTERNAL_KEY = KEY;
  });

  afterEach(() => {
    if (saved === undefined) delete process.env.LEADS_INTERNAL_KEY;
    else process.env.LEADS_INTERNAL_KEY = saved;
  });

  it("allows create with the internal key, without a session", () => {
    assert.strictEqual(
      op(BlogLead, "create")({ session: undefined, context: ctxWithKey(KEY) }),
      true,
    );
  });

  it("denies create without the internal key, even for superAdmin", () => {
    assert.strictEqual(
      op(BlogLead, "create")({
        session: session("superAdmin"),
        context: ctxWithKey(undefined),
      }),
      false,
    );
  });

  it("denies create with a wrong key", () => {
    assert.strictEqual(
      op(BlogLead, "create")({
        session: undefined,
        context: ctxWithKey("nope-nope-nope-nope"),
      }),
      false,
    );
  });

  it("allows query, update and delete to superAdmin only", () => {
    for (const name of ["query", "update", "delete"]) {
      assert.strictEqual(
        op(BlogLead, name)({ session: session("superAdmin") }),
        true,
      );
      assert.strictEqual(op(BlogLead, name)({ session: undefined }), false);
      for (const role of NON_SUPER_ROLES) {
        assert.strictEqual(
          op(BlogLead, name)({ session: session(role) }),
          false,
          `${name} should be denied for ${role}`,
        );
      }
    }
  });
});

describe("isValidEmail", () => {
  it("accepts a normal address", () => {
    assert.strictEqual(isValidEmail("student@example.com"), true);
  });

  it("accepts an address with a subdomain and plus tag", () => {
    assert.strictEqual(isValidEmail("a+tag@mail.example.co.in"), true);
  });

  for (const bad of [
    undefined,
    null,
    "",
    "   ",
    "no-at-sign.com",
    "two@@example.com",
    "missing-domain@",
    "@missing-local.com",
    "space in@example.com",
    "no-dot@example",
  ]) {
    it(`rejects ${JSON.stringify(bad)}`, () => {
      assert.strictEqual(isValidEmail(bad as any), false);
    });
  }
});

describe("BlogLead.email validation", () => {
  const run = (resolvedData: Record<string, unknown>, operation: string) => {
    const errors: string[] = [];
    (BlogLead as any).hooks.validateInput({
      resolvedData,
      operation,
      addValidationError: (msg: string) => errors.push(msg),
    });
    return errors;
  };

  it("rejects a create with no email", () => {
    assert.strictEqual(run({ name: "A" }, "create").length, 1);
  });

  it("rejects a create with a malformed email", () => {
    assert.strictEqual(run({ email: "bad@" }, "create").length, 1);
  });

  it("accepts a create with a valid email", () => {
    assert.strictEqual(run({ email: "ok@example.com" }, "create").length, 0);
  });

  it("rejects an update that sets an invalid email", () => {
    assert.strictEqual(run({ email: "bad" }, "update").length, 1);
  });

  it("does not check email on an update that leaves it alone", () => {
    assert.strictEqual(run({ name: "B" }, "update").length, 0);
  });
});
