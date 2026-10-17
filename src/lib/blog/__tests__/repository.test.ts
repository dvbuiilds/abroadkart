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

/** Wraps a `data` payload in the shape `fetch().json()` returns. */
function gqlOk(data: unknown) {
  return { ok: true, json: async () => ({ data }) };
}

/** Answers every GraphQL call from `handler`, which sees the request variables. */
function respondToGraphQL(
  handler: (variables: Record<string, unknown>, query: string) => unknown
) {
  mockFetch.mockImplementation(async (_url: string, init: { body: string }) => {
    const body = JSON.parse(init.body);
    return gqlOk(handler(body.variables ?? {}, body.query));
  });
}

describe("Blog Repository", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getPostBySlug", () => {
    it("fetches a post by slug and returns it with contentHtml", async () => {
      mockFetch.mockResolvedValueOnce(gqlOk({ blogPosts: [mockPost] }));

      const post = await getPostBySlug("test-post");
      expect(post).toEqual(mockPost);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const call = mockFetch.mock.calls[0];
      expect(call[0]).toContain("/api/graphql");
      expect(call[1]?.method).toBe("POST");
      expect(call[1]?.headers?.["Content-Type"]).toBe("application/json");
    });

    it("returns null when post is not found", async () => {
      mockFetch.mockResolvedValueOnce(gqlOk({ blogPosts: [] }));

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
      mockFetch.mockResolvedValueOnce(gqlOk({ blogPosts: [mockPost] }));

      await getPostBySlug("test-post");
      const options = mockFetch.mock.calls[0][1];
      expect(options.next).toBeDefined();
      expect(options.next.revalidate).toBe(3600);
      expect(options.next.tags).toContain("blog:test-post");
      expect(options.next.tags).toContain("blog:list");
    });

    it("converts the ISO date strings from GraphQL into Date objects", async () => {
      mockFetch.mockResolvedValueOnce(
        gqlOk({
          blogPosts: [
            {
              ...mockPost,
              publishedAt: "2026-01-15T10:00:00.000Z",
              modifiedAt: "2026-02-01T15:30:00.000Z",
            },
          ],
        })
      );

      const post = await getPostBySlug("test-post");
      expect(post?.publishedAt).toBeInstanceOf(Date);
      expect(post?.modifiedAt).toBeInstanceOf(Date);
      expect(post?.publishedAt.toISOString()).toBe("2026-01-15T10:00:00.000Z");
      expect(post?.modifiedAt.toISOString()).toBe("2026-02-01T15:30:00.000Z");
    });

    it("sorts FAQs by their order field", async () => {
      mockFetch.mockResolvedValueOnce(
        gqlOk({
          blogPosts: [
            {
              ...mockPost,
              faqs: [
                { order: 2, question: "Second?", answer: "b" },
                { order: 0, question: "First?", answer: "a" },
                { order: 1, question: "Middle?", answer: "c" },
              ],
            },
          ],
        })
      );

      const post = await getPostBySlug("test-post");
      expect(post?.faqs.map((f) => f.question)).toEqual([
        "First?",
        "Middle?",
        "Second?",
      ]);
    });

    it("defaults missing headings, faqs and categories to empty arrays", async () => {
      mockFetch.mockResolvedValueOnce(
        gqlOk({
          blogPosts: [
            {
              id: mockPost.id,
              slug: mockPost.slug,
              title: mockPost.title,
              status: mockPost.status,
              publishedAt: "2026-01-15T10:00:00.000Z",
              modifiedAt: "2026-02-01T15:30:00.000Z",
              excerpt: mockPost.excerpt,
              contentHtml: mockPost.contentHtml,
              faqs: null,
              headings: null,
              categories: null,
            },
          ],
        })
      );

      const post = await getPostBySlug("test-post");
      expect(post?.headings).toEqual([]);
      expect(post?.faqs).toEqual([]);
      expect(post?.categories).toEqual([]);
    });
  });

  describe("getPostSummaries", () => {
    it("fetches post summaries without contentHtml", async () => {
      mockFetch.mockResolvedValueOnce(
        gqlOk({
          items: [mockSummary],
          totalCount: 1,
        })
      );

      const result = await getPostSummaries({ skip: 0, take: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(result.items[0]).toEqual(mockSummary);

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query).not.toContain("contentHtml");
    });

    it("passes skip and take as GraphQL variables", async () => {
      mockFetch.mockResolvedValueOnce(
        gqlOk({
          items: [],
          totalCount: 0,
        })
      );

      await getPostSummaries({ skip: 13, take: 12 });
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.variables).toMatchObject({ skip: 13, take: 12 });
    });

    it("orders by publishedAt descending", async () => {
      mockFetch.mockResolvedValueOnce(
        gqlOk({
          items: [],
          totalCount: 0,
        })
      );

      await getPostSummaries({ skip: 0, take: 10 });
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query).toContain("orderBy");
    });

    it("filters by categorySlug through a GraphQL variable", async () => {
      mockFetch.mockResolvedValueOnce(
        gqlOk({
          items: [],
          totalCount: 0,
        })
      );

      await getPostSummaries({ skip: 0, take: 10, categorySlug: "travel" });
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(JSON.stringify(body.variables.where)).toContain("travel");
      expect(body.query).not.toContain("travel");
    });

    it("keeps a hostile categorySlug out of the query text", async () => {
      mockFetch.mockResolvedValueOnce(
        gqlOk({
          items: [],
          totalCount: 0,
        })
      );

      const hostile = 'x" } }) { id } } query { secret';
      await getPostSummaries({ skip: 0, take: 10, categorySlug: hostile });
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.query).not.toContain("secret");
      expect(body.variables.where.OR).toBeDefined();
    });

    it("converts dates on summaries returned from GraphQL", async () => {
      mockFetch.mockResolvedValueOnce(
        gqlOk({
          items: [
            {
              ...mockSummary,
              publishedAt: "2026-01-15T10:00:00.000Z",
              modifiedAt: "2026-02-01T15:30:00.000Z",
            },
          ],
          totalCount: 1,
        })
      );

      const result = await getPostSummaries({ skip: 0, take: 10 });
      expect(result.items[0].publishedAt).toBeInstanceOf(Date);
      expect(result.items[0].modifiedAt).toBeInstanceOf(Date);
    });

    it("includes blog:list tag in revalidate", async () => {
      mockFetch.mockResolvedValueOnce(
        gqlOk({
          items: [],
          totalCount: 0,
        })
      );

      await getPostSummaries({ skip: 0, take: 10 });
      const options = mockFetch.mock.calls[0][1];
      expect(options.next.tags).toContain("blog:list");
    });
  });

  describe("getAllSlugs", () => {
    it("returns all published post slugs", async () => {
      mockFetch.mockResolvedValueOnce(
        gqlOk({
          blogPosts: [
            { slug: "post-1" },
            { slug: "post-2" },
            { slug: "post-3" },
          ],
        })
      );

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
    const post = (id: string) => ({ id });

    it("drops categories that have no published posts", async () => {
      respondToGraphQL(() => ({
        blogCategories: [
          { ...mockCategory, posts: [], primaryPosts: [] },
          {
            ...mockCategory,
            id: "cat2",
            slug: "visa",
            name: "Visa",
            posts: [post("p1")],
            primaryPosts: [],
          },
        ],
      }));

      const categories = await getCategories();
      expect(categories.map((c) => c.slug)).toEqual(["visa"]);
    });

    it("orders categories by published post count, highest first", async () => {
      respondToGraphQL(() => ({
        blogCategories: [
          { ...mockCategory, slug: "a", name: "A", posts: [post("1")], primaryPosts: [] },
          { ...mockCategory, slug: "b", name: "B", posts: [post("1"), post("2"), post("3")], primaryPosts: [] },
          { ...mockCategory, slug: "c", name: "C", posts: [post("1"), post("2")], primaryPosts: [] },
        ],
      }));

      const categories = await getCategories();
      expect(categories.map((c) => c.slug)).toEqual(["b", "c", "a"]);
    });

    it("counts a post once when it is both primary and secondary in the category", async () => {
      respondToGraphQL(() => ({
        blogCategories: [
          {
            ...mockCategory,
            posts: [post("1"), post("2")],
            primaryPosts: [post("2")],
          },
        ],
      }));

      const categories = await getCategories();
      expect(categories[0].postCount).toBe(2);
    });

    it("includes blog:list tag", async () => {
      respondToGraphQL(() => ({ blogCategories: [] }));

      await getCategories();
      const options = mockFetch.mock.calls[0][1];
      expect(options.next.tags).toContain("blog:list");
    });
  });

  describe("getCategoryBySlug", () => {
    it("fetches a category by slug", async () => {
      mockFetch.mockResolvedValueOnce(
        gqlOk({
          blogCategories: [mockCategory],
        })
      );

      const category = await getCategoryBySlug("travel");
      expect(category).toEqual(mockCategory);
    });

    it("returns null when category is not found", async () => {
      mockFetch.mockResolvedValueOnce(
        gqlOk({
          blogCategories: [],
        })
      );

      const category = await getCategoryBySlug("nonexistent");
      expect(category).toBeNull();
    });
  });

  describe("getRelatedPosts", () => {
    const current = {
      ...mockSummary,
      slug: "current",
      primaryCategory: mockCategory,
    };
    const summary = (slug: string): BlogPostSummary => ({
      ...mockSummary,
      id: slug,
      slug,
      title: slug,
    });

    it("returns posts from the same primary category", async () => {
      respondToGraphQL((variables) =>
        variables.categorySlug
          ? { blogPosts: [summary("b"), summary("c"), summary("d")] }
          : { blogPosts: [] }
      );

      const related = await getRelatedPosts(current, 3);
      expect(related.map((p) => p.slug)).toEqual(["b", "c", "d"]);
    });

    it("excludes the current post, even if the API returns it", async () => {
      respondToGraphQL((variables) =>
        variables.categorySlug
          ? { blogPosts: [summary("current"), summary("b"), summary("c")] }
          : { blogPosts: [] }
      );

      const related = await getRelatedPosts(current, 3);
      expect(related.map((p) => p.slug)).toEqual(["b", "c"]);
    });

    it("tops up from the latest posts when the category has too few", async () => {
      respondToGraphQL((variables) =>
        variables.categorySlug
          ? { blogPosts: [summary("b")] }
          : { blogPosts: [summary("current"), summary("x"), summary("y"), summary("z")] }
      );

      const related = await getRelatedPosts(current, 3);
      expect(related.map((p) => p.slug)).toEqual(["b", "x", "y"]);
    });

    it("never returns the same post twice", async () => {
      respondToGraphQL((variables) =>
        variables.categorySlug
          ? { blogPosts: [summary("b")] }
          : { blogPosts: [summary("b"), summary("x"), summary("y")] }
      );

      const related = await getRelatedPosts(current, 3);
      const slugs = related.map((p) => p.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
      expect(slugs).toEqual(["b", "x", "y"]);
    });

    it("falls back to the latest posts when the post has no category", async () => {
      respondToGraphQL(() => ({
        blogPosts: [summary("current"), summary("x"), summary("y"), summary("z")],
      }));

      const related = await getRelatedPosts(
        { ...current, primaryCategory: undefined },
        3
      );
      expect(related.map((p) => p.slug)).toEqual(["x", "y", "z"]);
    });

    it("returns at most the requested limit", async () => {
      respondToGraphQL((variables) =>
        variables.categorySlug
          ? { blogPosts: [summary("b"), summary("c"), summary("d"), summary("e")] }
          : { blogPosts: [] }
      );

      const related = await getRelatedPosts(current, 2);
      expect(related).toHaveLength(2);
    });

    it("passes the limit to the GraphQL query", async () => {
      respondToGraphQL(() => ({ blogPosts: [] }));

      await getRelatedPosts(current, 2);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.variables?.limit).toBe(2);
    });
  });

  describe("getSitemapEntries", () => {
    it("returns blog entries with slug and modifiedAt only", async () => {
      mockFetch.mockResolvedValueOnce(
        gqlOk({
          blogPosts: [
            { slug: "post-1", modifiedAt: "2026-02-01T15:30:00Z" },
            { slug: "post-2", modifiedAt: "2026-01-15T10:00:00Z" },
          ],
        })
      );

      const entries = await getSitemapEntries();
      expect(entries).toHaveLength(2);
      expect(entries[0]).toHaveProperty("slug");
      expect(entries[0]).toHaveProperty("modifiedAt");
      expect(entries[0]).not.toHaveProperty("contentHtml");
    });

    it("includes blog:list tag", async () => {
      mockFetch.mockResolvedValueOnce(gqlOk({ blogPosts: [] }));

      await getSitemapEntries();
      const options = mockFetch.mock.calls[0][1];
      expect(options.next.tags).toContain("blog:list");
    });
  });
});
