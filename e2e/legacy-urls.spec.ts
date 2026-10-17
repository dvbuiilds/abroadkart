import { test, expect } from "@playwright/test";
import {
  published,
  draft,
  legacyPaths,
  categories,
} from "./helpers/source";

// D3 (amended 2026-10-17): legacy WordPress URLs return 404 with no redirect.
// Every request uses maxRedirects: 0, so a 301/307/308 fails the test.

const NO_REDIRECT = { maxRedirects: 0 } as const;

function expectBareNotFound(status: number, location: string | null | undefined, url: string) {
  expect(status, `${url} should be 404`).toBe(404);
  expect(location ?? null, `${url} should not redirect`).toBeNull();
}

test.describe("legacy WordPress URLs return 404 without redirect", () => {
  test.describe.configure({ mode: "parallel" });

  for (const post of published) {
    test(`/${post.slug} (no trailing slash)`, async ({ request }) => {
      const response = await request.get(`/${post.slug}`, NO_REDIRECT);
      expectBareNotFound(response.status(), response.headers()["location"], `/${post.slug}`);
    });

    test(`/${post.slug}/ (trailing slash)`, async ({ request }) => {
      const response = await request.get(`/${post.slug}/`, NO_REDIRECT);
      expectBareNotFound(response.status(), response.headers()["location"], `/${post.slug}/`);
    });
  }

  for (const source of legacyPaths) {
    test(`legacy redirect source ${source}`, async ({ request }) => {
      const response = await request.get(source, NO_REDIRECT);
      expectBareNotFound(response.status(), response.headers()["location"], source);
    });
  }

  const otherLegacy = [
    "/category/visa",
    "/category/visa/",
    "/author/admin",
    "/tag/visa",
    "/feed",
    "/feed/",
    "/blog/some-post",
    "/wp-content/uploads/2024/01/example.jpg",
    "/wp-admin",
    "/wp-login.php",
  ];
  for (const path of otherLegacy) {
    test(`legacy path ${path}`, async ({ request }) => {
      const response = await request.get(path, NO_REDIRECT);
      expectBareNotFound(response.status(), response.headers()["location"], path);
    });
  }
});

test.describe("blog URLs", () => {
  test("the draft post returns 404", async ({ request }) => {
    const response = await request.get(`/blogs/${draft.slug}`, NO_REDIRECT);
    expect(response.status()).toBe(404);
  });

  test("an unknown blog slug returns 404", async ({ request }) => {
    const response = await request.get("/blogs/does-not-exist", NO_REDIRECT);
    expect(response.status()).toBe(404);
  });

  for (const post of published) {
    test(`/blogs/${post.slug} returns 200`, async ({ request }) => {
      const response = await request.get(`/blogs/${post.slug}`, NO_REDIRECT);
      expect(response.status()).toBe(200);
    });
  }

  for (const category of categories) {
    test(`/blogs/category/${category.slug} returns 200`, async ({ request }) => {
      const response = await request.get(`/blogs/category/${category.slug}`, NO_REDIRECT);
      expect(response.status()).toBe(200);
    });
  }
});

test.describe("guards still work after the legacy change", () => {
  for (const path of ["/consultant", "/fulfilment", "/dashboard"]) {
    test(`${path} without a session redirects to sign-in`, async ({ request }) => {
      const response = await request.get(path, NO_REDIRECT);
      expect(response.status()).toBe(307);
      const location = new URL(response.headers()["location"], "http://localhost");
      expect(location.pathname).toBe("/sign-in");
      expect(location.searchParams.get("callbackUrl")).toBe(path);
    });
  }

  for (const path of ["/", "/about", "/contact"]) {
    test(`${path} stays public`, async ({ request }) => {
      const response = await request.get(path, NO_REDIRECT);
      expect(response.status()).toBe(200);
    });
  }
});
