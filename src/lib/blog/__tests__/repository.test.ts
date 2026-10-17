// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getPostBySlug,
  getPostSummaries,
  getAllSlugs,
  getCategories,
  getCategoryBySlug,
  getRelatedPosts,
  getSitemapEntries,
} from "../repository";
import type { BlogPost, BlogCategory, BlogPostSummary } from "../types";

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockPost: BlogPost = {
  id: "1",
  slug: "test-post",
  title: "Test Post",
  status: "published",
  publishedAt: new Date("2026-01-15T10:00:00Z"),
  modifiedAt: new Date("2026-02-01T15:30:00Z"),
  excerpt: "Test excerpt",
  contentHtml: "<p>Content</p>",
  headings: [],
  faqs: [],
  categories: [],
  authorName: "Author Name",
};

const mockSummary: BlogPostSummary = {
  id: "1",
  slug: "test-post",
  title: "Test Post",
  excerpt: "Test excerpt",
  publishedAt: new Date("2026-01-15T10:00:00Z"),
  modifiedAt: new Date("2026-02-01T15:30:00Z"),
  authorName: "Author Name",
};

const mockCategory: BlogCategory = {
  id: "cat1",
  name: "Travel",
  slug: "travel",
  description: "Travel posts",
};

describe("Blog Repository", () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getPostBySlug", () => {
    it("fetches a post by slug and returns it with contentHtml", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            blogPosts: [mockPost],
          },
        }),
      });

      const post = await getPostBySlug("test-post");
      expect(post).toEqual(mockPost);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain("/api/graphql");
      expect(call[1]?.method).toBe("POST");
      expect(call[1]?.headers?.["Content-Type"]).toBe("application/json");
    });

    it("returns null when post is not found", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            blogPosts: [],
          },
        }),
      });

      const post = await getPostBySlug("nonexistent");
      expect(post).toBeNull();
    });

    it("throws on GraphQL errors in 200 response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          errors: [{ message: "Query error" }],
        }),
      });

      await expect(getPostBySlug("test-post")).rejects.toThrow();
    });

    it("includes next.revalidate and tags in fetch options", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            blogPosts: [mockPost],
          },
        }),
      });

      await getPostBySlug("test-post");
      const options = mockFetch.mock.calls[0][1];
      expect(options.next).toBeDefined();
      expect(options.next.revalidate).toBe(3600);
      expect(options.next.tags).toContain("blog:test-post");
      expect(options.next.tags).toContain("blog:list");
    });
  });

  describe("getPostSummaries", () => {
    it("fetches post summaries without contentHtml", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            blogPostsConnection: {
              edges: [{ node: mockSummary }],
              pageInfo: { hasNextPage: false },
              totalCount: 1,
            },
          },
        }),
      });

      const result = await getPostSummaries({ page: 1, pageSize: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.items[0]).toEqual(mockSummary);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query).not.toContain("contentHtml");
    });

    it("orders by publishedAt descending", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            blogPostsConnection: {
              edges: [],
              pageInfo: { hasNextPage: false },
              totalCount: 0,
            },
          },
        }),
      });

      await getPostSummaries({ page: 1, pageSize: 10 });
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query).toContain("orderBy");
    });

    it("filters by categorySlug when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            blogPostsConnection: {
              edges: [],
              pageInfo: { hasNextPage: false },
              totalCount: 0,
            },
          },
        }),
      });

      await getPostSummaries({ page: 1, pageSize: 10, categorySlug: "travel" });
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.variables?.categorySlug).toBe("travel");
    });

    it("includes blog:list tag in revalidate", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            blogPostsConnection: {
              edges: [],
              pageInfo: { hasNextPage: false },
              totalCount: 0,
            },
          },
        }),
      });

      await getPostSummaries({ page: 1, pageSize: 10 });
      const options = mockFetch.mock.calls[0][1];
      expect(options.next.tags).toContain("blog:list");
    });
  });

  describe("getAllSlugs", () => {
    it("returns all published post slugs", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            blogPosts: [
              { slug: "post-1" },
              { slug: "post-2" },
              { slug: "post-3" },
            ],
          },
        }),
      });

      const slugs = await getAllSlugs();
      expect(slugs).toEqual(["post-1", "post-2", "post-3"]);
    });

    it("returns empty array when fetch fails", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const slugs = await getAllSlugs();
      expect(slugs).toEqual([]);
    });

    it("returns empty array on GraphQL errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          errors: [{ message: "Query error" }],
        }),
      });

      const slugs = await getAllSlugs();
      expect(slugs).toEqual([]);
    });

    it("does not throw on errors (safe for next build)", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      expect(async () => {
        await getAllSlugs();
      }).not.toThrow();
    });
  });

  describe("getCategories", () => {
    it("fetches all categories", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            blogCategories: [mockCategory],
          },
        }),
      });

      const categories = await getCategories();
      expect(categories).toHaveLength(1);
      expect(categories[0]).toEqual(mockCategory);
    });

    it("includes blog:list tag", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            blogCategories: [],
          },
        }),
      });

      await getCategories();
      const options = mockFetch.mock.calls[0][1];
      expect(options.next.tags).toContain("blog:list");
    });
  });

  describe("getCategoryBySlug", () => {
    it("fetches a category by slug", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            blogCategories: [mockCategory],
          },
        }),
      });

      const category = await getCategoryBySlug("travel");
      expect(category).toEqual(mockCategory);
    });

    it("returns null when category is not found", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            blogCategories: [],
          },
        }),
      });

      const category = await getCategoryBySlug("nonexistent");
      expect(category).toBeNull();
    });
  });

  describe("getRelatedPosts", () => {
    it("fetches posts from the same primary category", async () => {
      const post = { ...mockSummary, primaryCategory: mockCategory };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            blogPosts: [mockSummary],
          },
        }),
      });

      const related = await getRelatedPosts(post, 3);
      expect(related).toHaveLength(1);
      expect(related[0]).toEqual(mockSummary);
    });

    it("passes the limit to the GraphQL query", async () => {
      const post = { ...mockSummary, primaryCategory: mockCategory };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            blogPosts: [mockSummary, mockSummary],
          },
        }),
      });

      const related = await getRelatedPosts(post, 2);
      expect(related.length).toBe(2);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.variables?.limit).toBe(2);
    });
  });

  describe("getSitemapEntries", () => {
    it("returns blog entries with slug and modifiedAt only", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            blogPosts: [
              { slug: "post-1", modifiedAt: "2026-02-01T15:30:00Z" },
              { slug: "post-2", modifiedAt: "2026-01-15T10:00:00Z" },
            ],
          },
        }),
      });

      const entries = await getSitemapEntries();
      expect(entries).toHaveLength(2);
      expect(entries[0]).toHaveProperty("slug");
      expect(entries[0]).toHaveProperty("modifiedAt");
      expect(entries[0]).not.toHaveProperty("contentHtml");
    });

    it("includes blog:list tag", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            blogPosts: [],
          },
        }),
      });

      await getSitemapEntries();
      const options = mockFetch.mock.calls[0][1];
      expect(options.next.tags).toContain("blog:list");
    });
  });
});
