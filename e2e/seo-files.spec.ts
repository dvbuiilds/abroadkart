import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";
import path from "node:path";
import { published, draft, categories } from "./helpers/source";

// The sitemap is generated (src/app/sitemap.ts). Expected size is fixed:
// 4 static pages + 11 category archives + 110 published posts = 125.
const EXPECTED_URLS = 4 + categories.length + published.length;

interface SitemapEntry {
  loc: string;
  lastmod: string | null;
}

function parseSitemap(xml: string): SitemapEntry[] {
  const blocks = xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
  return blocks.map((block) => {
    const loc = block.match(/<loc>([^<]+)<\/loc>/)?.[1] ?? "";
    const lastmod = block.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1] ?? null;
    return { loc: loc.trim(), lastmod };
  });
}

test.describe("robots.txt", () => {
  test("is served as text with the private areas disallowed", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/plain");

    const body = await response.text();
    for (const rule of [
      "/api/",
      "/admin",
      "/consultant",
      "/fulfilment",
      "/dashboard",
      "/ba",
      "/sign-in",
      "/sign-up",
      "/forgot-password",
    ]) {
      expect(body).toContain(`Disallow: ${rule}`);
    }
  });

  test("does not disallow the blog", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    const disallowed = body
      .split("\n")
      .filter((line) => line.startsWith("Disallow:"))
      .map((line) => line.replace("Disallow:", "").trim());
    // A rule blocks /blogs if it is "/" or a prefix of "/blogs".
    expect(disallowed.some((rule) => rule === "/" || "/blogs".startsWith(rule))).toBe(false);
  });

  test("points to an absolute sitemap URL on the same origin", async ({ request, baseURL }) => {
    const body = await (await request.get("/robots.txt")).text();
    const sitemapLine = body.split("\n").find((line) => line.startsWith("Sitemap:"));
    expect(sitemapLine).toBeDefined();

    const sitemapUrl = new URL(sitemapLine!.replace("Sitemap:", "").trim());
    expect(sitemapUrl.pathname).toBe("/sitemap.xml");
    expect(sitemapUrl.origin).toBe(new URL(baseURL!).origin);
  });
});

test.describe("sitemap.xml", () => {
  let entries: SitemapEntry[] = [];
  let xml = "";

  test.beforeAll(async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/xml");
    xml = await response.text();
    entries = parseSitemap(xml);
  });

  test("is well-formed XML with a urlset root", () => {
    expect(xml).toMatch(/^<\?xml[^>]*\?>/);
    expect(xml).toContain("<urlset");
    expect(xml.trim().endsWith("</urlset>")).toBe(true);
  });

  test(`lists exactly ${EXPECTED_URLS} URLs (4 static, ${categories.length} categories, ${published.length} posts)`, () => {
    expect(entries).toHaveLength(EXPECTED_URLS);
  });

  test("includes every published post and no draft", () => {
    const locs = new Set(entries.map((entry) => new URL(entry.loc).pathname));
    for (const post of published) {
      expect(locs.has(`/blogs/${post.slug}`), `missing /blogs/${post.slug}`).toBe(true);
    }
    expect(locs.has(`/blogs/${draft.slug}`)).toBe(false);
  });

  test("includes every category archive", () => {
    const locs = new Set(entries.map((entry) => new URL(entry.loc).pathname));
    for (const category of categories) {
      expect(locs.has(`/blogs/category/${category.slug}`)).toBe(true);
    }
  });

  test("post lastmod equals the source updatedAt", () => {
    for (const post of published) {
      const entry = entries.find((e) => new URL(e.loc).pathname === `/blogs/${post.slug}`);
      expect(entry, `no entry for ${post.slug}`).toBeDefined();
      expect(new Date(entry!.lastmod!).getTime()).toBe(new Date(post.updatedAt).getTime());
    }
  });

  test("every URL has one origin", () => {
    const origins = new Set(entries.map((entry) => new URL(entry.loc).origin));
    expect(origins.size).toBe(1);
  });

  test("sampled URLs resolve with 200", async ({ request }) => {
    // Every 25th entry, so the check is deterministic and still covers the list.
    const sample = entries.filter((_, index) => index % 25 === 0);
    for (const entry of sample) {
      const response = await request.get(new URL(entry.loc).pathname);
      expect(response.status(), entry.loc).toBe(200);
    }
  });
});

test.describe("static leftovers are removed", () => {
  test("public/robots.txt and public/sitemap.xml no longer exist", () => {
    const publicDir = path.resolve(__dirname, "../public");
    expect(existsSync(path.join(publicDir, "robots.txt"))).toBe(false);
    expect(existsSync(path.join(publicDir, "sitemap.xml"))).toBe(false);
  });
});
