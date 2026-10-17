// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../route";

const mockFetch = vi.fn();

const KEYSTONE = "http://keystone.test";
const KEY = "test-internal-key";

let nextIp = 0;
/** A fresh client IP per test, so the in-memory rate limit does not leak between tests. */
function freshIp() {
  nextIp += 1;
  return `10.0.0.${nextIp}`;
}

function leadRequest(body: unknown, ip: string) {
  return new NextRequest("http://localhost:3000/api/blog-leads", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const keystoneOk = () => ({
  ok: true,
  status: 200,
  json: async () => ({ data: { createBlogLead: { id: "lead-1" } } }),
});

describe("POST /api/blog-leads", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation(async () => keystoneOk());
    vi.stubGlobal("fetch", mockFetch);
    process.env.KEYSTONE_INTERNAL_URL = KEYSTONE;
    process.env.LEADS_INTERNAL_KEY = KEY;
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns 400 when the email is missing", async () => {
    const response = await POST(leadRequest({ name: "Asha" }, freshIp()));
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.ok).toBe(false);
    expect(json.errors.email).toBeDefined();
  });

  it("returns 400 when the body is not JSON", async () => {
    const response = await POST(leadRequest("not json", freshIp()));
    expect(response.status).toBe(400);
  });

  it("returns 201 and stores the lead, sending the internal key to Keystone", async () => {
    const response = await POST(
      leadRequest(
        {
          email: "student@example.com",
          name: "Asha",
          sourceSlug: "visa-tips",
          sourceUrl: "https://abroadkart.com/blogs/visa-tips",
          utmSource: "google",
        },
        freshIp()
      )
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ ok: true, email: "student@example.com" });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(`${KEYSTONE}/api/graphql`);
    expect(init.headers["x-internal-key"]).toBe(KEY);

    const variables = JSON.parse(init.body).variables.data;
    expect(variables).toMatchObject({
      email: "student@example.com",
      name: "Asha",
      sourceSlug: "visa-tips",
      utmSource: "google",
    });
  });

  it("silently accepts and stores nothing when the honeypot is filled", async () => {
    const response = await POST(
      leadRequest({ email: "bot@example.com", website: "http://spam.example" }, freshIp())
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns 429 with Retry-After once the per-IP limit is exceeded", async () => {
    const ip = freshIp();
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const response = await POST(leadRequest({ email: `q${i}@example.com` }, ip));
      statuses.push(response.status);
      if (response.status === 429) {
        expect(Number(response.headers.get("Retry-After"))).toBeGreaterThan(0);
      }
    }

    expect(statuses).toEqual([201, 201, 201, 201, 201, 429]);
  });

  it("returns 502 when Keystone rejects the write", async () => {
    mockFetch.mockImplementation(async () => ({
      ok: false,
      status: 500,
      json: async () => ({}),
    }));

    const response = await POST(leadRequest({ email: "student@example.com" }, freshIp()));
    expect(response.status).toBe(502);
    expect((await response.json()).ok).toBe(false);
  });
});
