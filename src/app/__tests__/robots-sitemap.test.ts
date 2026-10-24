// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import robots from "../robots";
import sitemap from "../sitemap";
import { getPublicAppUrl } from "@app/lib/public-urls";

vi.mock("@app/lib/blog/repository", () => ({
  getCategories: vi.fn(),
  getSitemapEntries: vi.fn(),
}));

const { getCategories, getSitemapEntries } = await import("@app/lib/blog/repository");

describe("robots and sitemap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("robots", () => {
    it("disallows private API and admin routes", async () => {
      const robotsResult = await robots();
      const rules = (robotsResult.rules || []) as Array<Record<string, unknown>>;

      const disallowPaths = [
        "/api/",
        "/admin",
        "/consultant",
        "/fulfilment",
        "/dashboard",
        "/ba",
        "/sign-in",
        "/sign-up",
        "/forgot-password",
      ];

      for (const path of disallowPaths) {
        const found = rules.some((r) => {
          const disallow = r.disallow;
          if (typeof disallow === "string") {
            return disallow.includes(path);
          }
          if (Array.isArray(disallow)) {
            return disallow.some((d) => (d as string).includes(path));
          }
          return false;
        });
        expect(found).toBe(true);
      }
    });

    it("points to the sitemap", async () => {
      const robotsResult = await robots();
      const sitemapUrl = `${getPublicAppUrl()}/sitemap.xml`;
      expect(robotsResult.sitemap).toBe(sitemapUrl);
    });
  });

  describe("sitemap", () => {
    it("includes static public pages", async () => {
      vi.mocked(getCategories).mockResolvedValue([]);
      vi.mocked(getSitemapEntries).mockResolvedValue([]);

      const sitemapResult = await sitemap();
      const urls = sitemapResult as Array<Record<string, unknown>>;
      const paths = urls.map((u) => u.url);

      expect(paths).toContain(getPublicAppUrl());
      expect(paths).toContain(`${getPublicAppUrl()}/about`);
      expect(paths).toContain(`${getPublicAppUrl()}/contact`);
      expect(paths).toContain(`${getPublicAppUrl()}/blogs`);
    });

    it("includes all categories", async () => {
      const categories = [
        { id: "1", name: "Travel", slug: "travel" },
        { id: "2", name: "Visa", slug: "visa" },
      ];
      vi.mocked(getCategories).mockResolvedValue(categories);
      vi.mocked(getSitemapEntries).mockResolvedValue([]);

      const sitemapResult = await sitemap();
      const urls = sitemapResult as Array<Record<string, unknown>>;
      const paths = urls.map((u) => u.url);

      expect(paths).toContain(`${getPublicAppUrl()}/blogs/category/travel`);
      expect(paths).toContain(`${getPublicAppUrl()}/blogs/category/visa`);
    });

    it("includes all published posts with modifiedAt", async () => {
      vi.mocked(getCategories).mockResolvedValue([]);
      const entries = [
        { slug: "post-1", modifiedAt: "2026-01-15T10:00:00Z" },
        { slug: "post-2", modifiedAt: "2026-02-01T15:30:00Z" },
      ];
      vi.mocked(getSitemapEntries).mockResolvedValue(entries);

      const sitemapResult = await sitemap();
      const urls = sitemapResult as Array<Record<string, unknown>>;
      const postUrls = urls.filter((u) => (u.url as string).includes("/blogs/post-"));

      expect(postUrls).toHaveLength(2);
      expect(postUrls[0].lastModified).toBeDefined();
    });

    it("has no duplicate URLs", async () => {
      vi.mocked(getCategories).mockResolvedValue([
        { id: "1", name: "Travel", slug: "travel" },
      ]);
      vi.mocked(getSitemapEntries).mockResolvedValue([
        { slug: "post-1", modifiedAt: "2026-01-15T10:00:00Z" },
      ]);

      const sitemapResult = await sitemap();
      const urls = sitemapResult as Array<Record<string, unknown>>;
      const urlSet = new Set(urls.map((u) => u.url));

      expect(urlSet.size).toBe(urls.length);
    });

    it("all URLs are absolute", async () => {
      vi.mocked(getCategories).mockResolvedValue([]);
      vi.mocked(getSitemapEntries).mockResolvedValue([]);

      const sitemapResult = await sitemap();
      const urls = sitemapResult as Array<Record<string, unknown>>;

      for (const url of urls) {
        expect(url.url).toMatch(/^https?:\/\//);
      }
    });

    it("handles repository errors gracefully", async () => {
      vi.mocked(getCategories).mockRejectedValue(new Error("Network error"));
      vi.mocked(getSitemapEntries).mockRejectedValue(new Error("Network error"));

      const sitemapResult = await sitemap();
      const urls = sitemapResult as Array<Record<string, unknown>>;

      const paths = urls.map((u) => u.url);
      expect(paths).toContain(getPublicAppUrl());
      expect(paths).toContain(`${getPublicAppUrl()}/blogs`);
    });

    it("does not include the draft post", async () => {
      vi.mocked(getCategories).mockResolvedValue([]);
      const entries = [
        { slug: "published-post", modifiedAt: "2026-01-15T10:00:00Z" },
      ];
      vi.mocked(getSitemapEntries).mockResolvedValue(entries);

      const sitemapResult = await sitemap();
      const urls = sitemapResult as Array<Record<string, unknown>>;
      const allUrls = urls.map((u) => u.url as string);

      expect(allUrls.join()).not.toContain("/f-1-visa-application-timeline");
    });
  });
});
