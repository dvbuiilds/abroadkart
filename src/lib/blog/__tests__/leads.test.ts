// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createBlogLead } from "../leads";

const mockFetch = vi.fn();

describe("createBlogLead", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: { createBlogLead: { id: "1" } } }),
    });
    vi.stubGlobal("fetch", mockFetch);
    process.env.KEYSTONE_INTERNAL_URL = "http://keystone.test/";
    process.env.LEADS_INTERNAL_KEY = "secret-key";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts a createBlogLead mutation to the internal Keystone endpoint", async () => {
    await createBlogLead({ email: "a@b.co", sourceSlug: "visa-tips" });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("http://keystone.test/api/graphql");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body).query).toContain("createBlogLead");
  });

  it("sends the internal key header and never caches the write", async () => {
    await createBlogLead({ email: "a@b.co" });

    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers["x-internal-key"]).toBe("secret-key");
    expect(init.cache).toBe("no-store");
  });

  it("passes the lead fields as the mutation data", async () => {
    await createBlogLead({
      email: "a@b.co",
      name: "Asha",
      message: "Tell me about costs",
      utmCampaign: "spring",
    });

    const variables = JSON.parse(mockFetch.mock.calls[0][1].body).variables;
    expect(variables.data).toEqual({
      email: "a@b.co",
      name: "Asha",
      message: "Tell me about costs",
      utmCampaign: "spring",
    });
  });

  it("refuses to send without the internal key configured", async () => {
    delete process.env.LEADS_INTERNAL_KEY;
    await expect(createBlogLead({ email: "a@b.co" })).rejects.toThrow(/LEADS_INTERNAL_KEY/);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("throws when Keystone responds with an HTTP error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) });
    await expect(createBlogLead({ email: "a@b.co" })).rejects.toThrow(/401/);
  });

  it("throws when Keystone returns GraphQL errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ errors: [{ message: "Access denied" }] }),
    });
    await expect(createBlogLead({ email: "a@b.co" })).rejects.toThrow(/Access denied/);
  });
});
