// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { buildPostMetadata, buildPostJsonLd, serializeJsonLd } from "../seo";
import type { BlogPost } from "../types";
import { getPublicAppUrl } from "@app/lib/public-urls";

describe("SEO helpers", () => {
  let publishedPost: BlogPost;
  let draftPost: BlogPost;
  let postWithFaqs: BlogPost;

  beforeEach(() => {
    publishedPost = {
      id: "1",
      slug: "test-post",
      title: "Test Post",
      status: "published",
      publishedAt: new Date("2026-01-15T10:00:00Z"),
      modifiedAt: new Date("2026-02-01T15:30:00Z"),
      excerpt:
        "This is a short excerpt that is under 160 characters and should not be truncated at all.",
      contentHtml: "<p>Content</p>",
      headings: [],
      faqs: [],
      categories: [],
      metaTitle: "Custom Title",
      metaDescription: "Custom description for SEO",
    };

    draftPost = {
      ...publishedPost,
      id: "2",
      slug: "draft-post",
      status: "draft",
      metaTitle: undefined,
      metaDescription: undefined,
    };

    postWithFaqs = {
      ...publishedPost,
      id: "3",
      slug: "faq-post",
      title: "FAQ Post",
      faqs: [
        { order: 1, question: "First Q?", answer: "First answer" },
        { order: 2, question: "Second Q?", answer: "Second answer" },
      ],
      headings: [
        { level: 2, text: "Section 1", id: "section-1" },
        { level: 3, text: "Subsection 1.1", id: "sub-1-1" },
      ],
    };
  });

  describe("buildPostMetadata", () => {
    it("uses metaTitle when present", () => {
      const meta = buildPostMetadata(publishedPost);
      expect(meta.title).toBe("Custom Title");
    });

    it("falls back to title when metaTitle is absent", () => {
      const post = { ...publishedPost, metaTitle: undefined };
      const meta = buildPostMetadata(post);
      expect(meta.title).toBe("Test Post");
    });

    it("uses metaDescription when present", () => {
      const meta = buildPostMetadata(publishedPost);
      expect(meta.description).toBe("Custom description for SEO");
    });

    it("falls back to excerpt when metaDescription is absent", () => {
      const post = { ...publishedPost, metaDescription: undefined };
      const meta = buildPostMetadata(post);
      expect(meta.description).toBe(publishedPost.excerpt);
    });

    it("truncates description to 160 characters at word boundary", () => {
      const longExcerpt =
        "This is a very long excerpt that should be truncated because it exceeds one hundred and sixty characters and should stop at a word boundary before this continuation text that definitely should not appear";
      const post = {
        ...publishedPost,
        excerpt: longExcerpt,
        metaDescription: undefined,
      };
      const meta = buildPostMetadata(post);
      expect(meta.description?.length).toBeLessThanOrEqual(160);
      expect(meta.description).toMatch(/\S…$/);
      expect(meta.description).not.toContain("continuation");
    });

    it("does not truncate short descriptions", () => {
      const shortExcerpt = "Short excerpt";
      const post = {
        ...publishedPost,
        excerpt: shortExcerpt,
        metaDescription: undefined,
      };
      const meta = buildPostMetadata(post);
      expect(meta.description).toBe(shortExcerpt);
    });

    it("sets canonical to absolute URL", () => {
      const meta = buildPostMetadata(publishedPost);
      expect(meta.alternates?.canonical).toBe(
        `${getPublicAppUrl()}/blogs/${publishedPost.slug}`
      );
      expect(meta.alternates?.canonical).toMatch(/^https?:\/\//);
    });

    it("sets openGraph type to article", () => {
      const meta = buildPostMetadata(publishedPost);
      expect((meta.openGraph as Record<string, unknown>)?.type).toBe("article");
    });

    it("sets openGraph times to ISO dates", () => {
      const meta = buildPostMetadata(publishedPost);
      const og = meta.openGraph as Record<string, unknown>;
      expect(og?.publishedTime).toBe(publishedPost.publishedAt.toISOString());
      expect(og?.modifiedTime).toBe(publishedPost.modifiedAt.toISOString());
    });

    it("includes openGraph image with width and height", () => {
      const post = {
        ...publishedPost,
        featuredImageUrl: "https://cdn.example.com/image.jpg",
        featuredImageAlt: "Test image",
        featuredImageWidth: 1200,
        featuredImageHeight: 630,
      };
      const meta = buildPostMetadata(post);
      expect(meta.openGraph?.images).toEqual([
        {
          url: "https://cdn.example.com/image.jpg",
          alt: "Test image",
          width: 1200,
          height: 630,
        },
      ]);
    });

    it("sets twitter card to summary_large_image", () => {
      const meta = buildPostMetadata(publishedPost);
      expect((meta.twitter as Record<string, unknown>)?.card).toBe("summary_large_image");
    });

    it("sets robots to index for published posts", () => {
      const meta = buildPostMetadata(publishedPost);
      expect(meta.robots).toContain("index");
      expect(meta.robots).toContain("follow");
    });

    it("sets robots to noindex for drafts", () => {
      const meta = buildPostMetadata(draftPost);
      expect(meta.robots).toContain("noindex");
    });

    it("includes primary category as section", () => {
      const post = {
        ...publishedPost,
        primaryCategory: { id: "cat1", name: "Travel", slug: "travel" },
      };
      const meta = buildPostMetadata(post);
      expect((meta.openGraph as Record<string, unknown>)?.section).toBe("Travel");
    });

    it("includes tags", () => {
      const post = { ...publishedPost, tags: ["tag1", "tag2"] };
      const meta = buildPostMetadata(post);
      expect((meta.openGraph as Record<string, unknown>)?.tags).toEqual(["tag1", "tag2"]);
    });

    it("falls back to focus keywords when a post has no tags", () => {
      const post = { ...publishedPost, tags: [], focusKeywords: ["visa", "f-1"] };
      const meta = buildPostMetadata(post);
      expect((meta.openGraph as Record<string, unknown>)?.tags).toEqual(["visa", "f-1"]);
    });

    it("prefers tags over focus keywords when both exist", () => {
      const post = { ...publishedPost, tags: ["tag1"], focusKeywords: ["visa"] };
      const meta = buildPostMetadata(post);
      expect((meta.openGraph as Record<string, unknown>)?.tags).toEqual(["tag1"]);
    });
  });

  describe("buildPostJsonLd", () => {
    it("returns a @graph with BlogPosting, BreadcrumbList, and FAQPage when FAQs exist", () => {
      const ld = buildPostJsonLd(postWithFaqs);
      expect(ld["@context"]).toBe("https://schema.org");
      expect(Array.isArray(ld["@graph"])).toBe(true);

      const graph = ld["@graph"] as Record<string, unknown>[];
      const types = graph.map((item) => (item as Record<string, unknown>)["@type"]);
      expect(types).toContain("BlogPosting");
      expect(types).toContain("BreadcrumbList");
      expect(types).toContain("FAQPage");
    });

    it("returns @graph without FAQPage when no FAQs", () => {
      const ld = buildPostJsonLd(publishedPost);
      const graph = ld["@graph"] as Record<string, unknown>[];
      const types = graph.map((item) => (item as Record<string, unknown>)["@type"]);
      expect(types).toContain("BlogPosting");
      expect(types).toContain("BreadcrumbList");
      expect(types).not.toContain("FAQPage");
    });

    it("BlogPosting has author with name only (no url or image)", () => {
      const post = { ...publishedPost, authorName: "John Doe" };
      const ld = buildPostJsonLd(post);
      const graph = ld["@graph"] as Record<string, unknown>[];
      const posting = graph.find((item) => (item as Record<string, unknown>)["@type"] === "BlogPosting") as Record<string, unknown>;
      const author = posting.author as Record<string, unknown>;
      expect(author["@type"]).toBe("Person");
      expect(author.name).toBe("John Doe");
      expect(author.url).toBeUndefined();
      expect(author.image).toBeUndefined();
    });

    it("BreadcrumbList has exactly 3 items", () => {
      const ld = buildPostJsonLd(publishedPost);
      const graph = ld["@graph"] as Record<string, unknown>[];
      const breadcrumbs = graph.find((item) => (item as Record<string, unknown>)["@type"] === "BreadcrumbList") as Record<string, unknown>;
      const items = breadcrumbs.itemListElement as Record<string, unknown>[];
      expect(items).toHaveLength(3);
      expect(items[0].name).toBe("Home");
      expect(items[1].name).toBe("Blogs");
      expect(items[2].name).toBe("Test Post");
    });

    it("FAQPage text matches source FAQ text exactly", () => {
      const ld = buildPostJsonLd(postWithFaqs);
      const graph = ld["@graph"] as Record<string, unknown>[];
      const faqPage = graph.find((item) => (item as Record<string, unknown>)["@type"] === "FAQPage") as Record<string, unknown>;
      const items = faqPage.mainEntity as Array<Record<string, unknown>>;
      expect((items[0]?.acceptedAnswer as Record<string, unknown>)?.text).toBe("First answer");
      expect((items[1]?.acceptedAnswer as Record<string, unknown>)?.text).toBe("Second answer");
    });

    it("FAQPage text is plain text even when the stored answer contains markup", () => {
      const post = {
        ...postWithFaqs,
        faqs: [{ order: 0, question: "Is it free?", answer: '<p class="p1">Yes, <strong>mostly</strong>.</p>' }],
      };
      const ld = buildPostJsonLd(post);
      const graph = ld["@graph"] as Record<string, unknown>[];
      const faqPage = graph.find((item) => (item as Record<string, unknown>)["@type"] === "FAQPage") as Record<string, unknown>;
      const items = faqPage.mainEntity as Array<Record<string, unknown>>;
      expect((items[0]?.acceptedAnswer as Record<string, unknown>)?.text).toBe("Yes, mostly.");
    });

    it("survives JSON.parse(JSON.stringify(x))", () => {
      const ld = buildPostJsonLd(postWithFaqs);
      const serialized = JSON.stringify(ld);
      expect(() => JSON.parse(serialized)).not.toThrow();
      const deserialized = JSON.parse(serialized);
      expect(deserialized["@context"]).toBe("https://schema.org");
    });
  });

  describe("serializeJsonLd", () => {
    it("escapes < as \\u003c to prevent </script> breakout", () => {
      const obj = {
        text: "<script>alert('xss')</script>",
      };
      const serialized = serializeJsonLd(obj);
      expect(serialized).not.toContain("</script>");
      expect(serialized).toContain("\\u003c");
    });

    it("handles nested structures", () => {
      const obj = {
        "@graph": [
          {
            text: "Safe text",
            content: "<p>HTML with < bracket</p>",
          },
        ],
      };
      const serialized = serializeJsonLd(obj);
      expect(serialized).toContain("\\u003c");
    });
  });
});
