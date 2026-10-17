/**
 * Test the blog revalidation hook.
 * Run: npm run test
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import { vi } from "vitest";

describe("Blog revalidation hook", () => {
  let mockFetch: any;

  beforeEach(() => {
    process.env.REVALIDATE_SECRET = "test-secret";
    process.env.NEXT_INTERNAL_URL = "http://nextjs:3000";
    mockFetch = vi.fn();
    global.fetch = mockFetch as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
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

    await revalidateBlogHook.afterOperation({ item: operation.item } as any);
    assert.strictEqual(mockFetch.mock.calls.length, 0);
  });

  it("should call revalidate endpoint on create with slug", async () => {
    const { revalidateBlogHook } = await import("../hooks/revalidateBlog");
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });

    const item = { slug: "new-post", id: "1" };
    await revalidateBlogHook.afterOperation({ item } as any);

    assert.strictEqual(mockFetch.mock.calls.length, 1);
    const call = mockFetch.mock.calls[0];
    assert.strictEqual(call[0], "http://nextjs:3000/api/revalidate");
    assert.strictEqual(call[1].method, "POST");
    assert.strictEqual(call[1].headers["x-revalidate-secret"], "test-secret");
  });

  it("should include previousSlug when slug changes on update", async () => {
    const { revalidateBlogHook } = await import("../hooks/revalidateBlog");
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });

    const item = { slug: "new-slug", id: "1" };
    const originalItem = { slug: "old-slug", id: "1" };

    await revalidateBlogHook.afterOperation({ item, originalItem } as any);

    assert.strictEqual(mockFetch.mock.calls.length, 1);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    assert.strictEqual(body.slug, "new-slug");
    assert.strictEqual(body.previousSlug, "old-slug");
  });

  it("should not fail when fetch rejects", async () => {
    const { revalidateBlogHook } = await import("../hooks/revalidateBlog");
    mockFetch.mockRejectedValue(new Error("Network error"));

    const item = { slug: "test", id: "1" };
    await revalidateBlogHook.afterOperation({ item } as any);

    assert.strictEqual(mockFetch.mock.calls.length, 1);
  });

  it("should handle category updates", async () => {
    const { revalidateBlogHook } = await import("../hooks/revalidateBlog");
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });

    const item = { slug: "travel", id: "cat-1" };
    await revalidateBlogHook.afterOperation({ item } as any);

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    assert.strictEqual(body.scope, "categories");
  });
});
