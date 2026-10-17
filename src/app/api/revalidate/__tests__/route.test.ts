// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

const mockRevalidateTag = await import("next/cache").then((m) => m.revalidateTag);

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.REVALIDATE_SECRET = "test-secret-123";
  });

  it("returns 401 when secret is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/revalidate", {
      method: "POST",
      body: JSON.stringify({ slug: "test" }),
      headers: {},
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns 401 when secret is wrong", async () => {
    const request = new NextRequest("http://localhost:3000/api/revalidate", {
      method: "POST",
      body: JSON.stringify({ slug: "test" }),
      headers: {
        "x-revalidate-secret": "wrong-secret",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns 400 on invalid JSON", async () => {
    const request = new NextRequest("http://localhost:3000/api/revalidate", {
      method: "POST",
      body: "not json",
      headers: {
        "x-revalidate-secret": "test-secret-123",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("revalidates with slug when secret is correct", async () => {
    const request = new NextRequest("http://localhost:3000/api/revalidate", {
      method: "POST",
      body: JSON.stringify({ slug: "test-post" }),
      headers: {
        "x-revalidate-secret": "test-secret-123",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockRevalidateTag).toHaveBeenCalledWith("blog:test-post");
    expect(mockRevalidateTag).toHaveBeenCalledWith("blog:list");
  });

  it("revalidates previousSlug when provided", async () => {
    const request = new NextRequest("http://localhost:3000/api/revalidate", {
      method: "POST",
      body: JSON.stringify({ slug: "new-slug", previousSlug: "old-slug" }),
      headers: {
        "x-revalidate-secret": "test-secret-123",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockRevalidateTag).toHaveBeenCalledWith("blog:new-slug");
    expect(mockRevalidateTag).toHaveBeenCalledWith("blog:old-slug");
    expect(mockRevalidateTag).toHaveBeenCalledWith("blog:list");
  });

  it("revalidates categories when scope is categories", async () => {
    const request = new NextRequest("http://localhost:3000/api/revalidate", {
      method: "POST",
      body: JSON.stringify({ scope: "categories" }),
      headers: {
        "x-revalidate-secret": "test-secret-123",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockRevalidateTag).toHaveBeenCalledWith("blog:list");
    expect(mockRevalidateTag).toHaveBeenCalledWith("blog:categories");
  });

  it("returns 200 with empty body when secret is correct", async () => {
    const request = new NextRequest("http://localhost:3000/api/revalidate", {
      method: "POST",
      body: JSON.stringify({}),
      headers: {
        "x-revalidate-secret": "test-secret-123",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockRevalidateTag).toHaveBeenCalledWith("blog:list");
  });
});
