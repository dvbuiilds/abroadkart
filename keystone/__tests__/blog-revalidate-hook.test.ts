/**
 * Test the blog revalidation hook.
 * Run: npm run test
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";

/**
 * A fetch stand-in that records each call's arguments. It uses node:test, so the
 * suite does not need Vitest (the root Vitest config excludes keystone/).
 */
type RecordedInit = { method: string; headers: Record<string, string>; body: string };
type RecordedCall = [string, RecordedInit];

type FetchMock = ((input: string, init: RecordedInit) => Promise<unknown>) & {
  calls: RecordedCall[];
  mockResolvedValue(value: unknown): void;
  mockRejectedValue(error: unknown): void;
};

function createFetchMock(): FetchMock {
  let outcome: { value?: unknown; error?: unknown } = {};
  const fn = (async (input: string, init: RecordedInit) => {
    fn.calls.push([input, init]);
    if (outcome.error !== undefined) throw outcome.error;
    return outcome.value;
  }) as FetchMock;
  fn.calls = [];
  fn.mockResolvedValue = (value) => {
    outcome = { value };
  };
  fn.mockRejectedValue = (error) => {
    outcome = { error };
  };
  return fn;
}

describe("Blog revalidation hook", () => {
  let mockFetch: FetchMock;

  beforeEach(() => {
    process.env.REVALIDATE_SECRET = "test-secret";
    process.env.NEXT_INTERNAL_URL = "http://nextjs:3000";
    mockFetch = createFetchMock();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    delete process.env.REVALIDATE_SECRET;
    delete process.env.NEXT_INTERNAL_URL;
  });

  it("should not make fetch requests when REVALIDATE_SECRET is unset", async () => {
    delete process.env.REVALIDATE_SECRET;
    const { revalidateBlogHook } = await import("../hooks/revalidateBlog");

    const operation = {
      operation: "create",
      item: { slug: "test", id: "1" },
    };

    await revalidateBlogHook.afterOperation({ item: operation.item } as never);
    assert.strictEqual(mockFetch.calls.length, 0);
  });

  it("should call revalidate endpoint on create with slug", async () => {
    const { revalidateBlogHook } = await import("../hooks/revalidateBlog");
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });

    const item = { slug: "new-post", id: "1" };
    await revalidateBlogHook.afterOperation({ item } as never);

    assert.strictEqual(mockFetch.calls.length, 1);
    const call = mockFetch.calls[0];
    assert.strictEqual(call[0], "http://nextjs:3000/api/revalidate");
    assert.strictEqual(call[1].method, "POST");
    assert.strictEqual(call[1].headers["x-revalidate-secret"], "test-secret");
  });

  it("should include previousSlug when slug changes on update", async () => {
    const { revalidateBlogHook } = await import("../hooks/revalidateBlog");
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });

    const item = { slug: "new-slug", id: "1" };
    const originalItem = { slug: "old-slug", id: "1" };

    await revalidateBlogHook.afterOperation({ item, originalItem } as never);

    assert.strictEqual(mockFetch.calls.length, 1);
    const body = JSON.parse(mockFetch.calls[0][1].body);
    assert.strictEqual(body.slug, "new-slug");
    assert.strictEqual(body.previousSlug, "old-slug");
  });

  it("should not fail when fetch rejects", async () => {
    const { revalidateBlogHook } = await import("../hooks/revalidateBlog");
    mockFetch.mockRejectedValue(new Error("Network error"));

    const item = { slug: "test", id: "1" };
    await revalidateBlogHook.afterOperation({ item } as never);

    assert.strictEqual(mockFetch.calls.length, 1);
  });

  it("should handle category updates", async () => {
    const { revalidateBlogHook } = await import("../hooks/revalidateBlog");
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });

    const item = { slug: "travel", id: "cat-1" };
    await revalidateBlogHook.afterOperation({ item, scope: "categories" });

    const body = JSON.parse(mockFetch.calls[0][1].body);
    assert.strictEqual(body.scope, "categories");
  });
});
