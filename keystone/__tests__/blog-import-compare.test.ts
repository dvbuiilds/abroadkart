/**
 * Change detection for the blog import. A re-run must report "unchanged" for a
 * row that already matches the export, so the database row (which has an id and
 * relation shapes) must compare equal to the mapped input.
 * Run: npm run test
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { comparable, sameCategories } from "../seeds/blog-import/comparable";
import type { BlogPostInput } from "../seeds/blog-import/types";

const input: BlogPostInput = {
  postId: 42,
  slug: "example-post",
  title: "Example",
  status: "published",
  publishedAt: new Date("2024-01-02T03:04:05.000Z"),
  modifiedAt: new Date("2024-02-03T04:05:06.000Z"),
  authorName: "Sana",
  excerpt: "An excerpt.",
  contentHtml: "<p>Body</p>",
  headings: [{ level: 2, text: "Intro", id: "intro" }],
  faqs: [{ order: 1, question: "Q?", answer: "A." }],
  tags: ["visa"],
  featuredImageUrl: "https://cdn.abroadkart.com/blog/example-post.webp",
  featuredImageAlt: "Alt",
  featuredImageWidth: 840,
  featuredImageHeight: 480,
  metaTitle: "Example",
  metaDescription: "An excerpt.",
  focusKeywords: ["visa"],
  wordCount: 100,
  readingTimeMinutes: 1,
  primaryCategorySlug: "visa",
  categorySlugs: ["visa", "study-cost"],
} as BlogPostInput;

/** The shape the Keystone query returns for an existing row. */
function dbRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "cuid-123",
    postId: 42,
    slug: "example-post",
    title: "Example",
    status: "published",
    publishedAt: "2024-01-02T03:04:05.000Z",
    modifiedAt: "2024-02-03T04:05:06.000Z",
    authorName: "Sana",
    excerpt: "An excerpt.",
    contentHtml: "<p>Body</p>",
    headings: [{ level: 2, text: "Intro", id: "intro" }],
    faqs: [{ order: 1, question: "Q?", answer: "A." }],
    tags: ["visa"],
    featuredImageUrl: "https://cdn.abroadkart.com/blog/example-post.webp",
    featuredImageAlt: "Alt",
    featuredImageWidth: 840,
    featuredImageHeight: 480,
    metaTitle: "Example",
    metaDescription: "An excerpt.",
    focusKeywords: ["visa"],
    wordCount: 100,
    readingTimeMinutes: 1,
    primaryCategory: { slug: "visa" },
    categories: [{ slug: "study-cost" }, { slug: "visa" }],
    ...overrides,
  };
}

describe("comparable", () => {
  it("treats a database row with an id as equal to the mapped input", () => {
    assert.strictEqual(
      comparable(dbRow() as unknown as Record<string, unknown>),
      comparable(input as unknown as Record<string, unknown>),
    );
  });

  it("ignores the id alone, so an identical re-run is unchanged", () => {
    const withOtherId = dbRow({ id: "a-different-id" });
    assert.strictEqual(
      comparable(withOtherId as unknown as Record<string, unknown>),
      comparable(dbRow() as unknown as Record<string, unknown>),
    );
  });

  it("still detects a real change in a scalar field", () => {
    assert.notStrictEqual(
      comparable(dbRow({ title: "Changed" }) as unknown as Record<string, unknown>),
      comparable(input as unknown as Record<string, unknown>),
    );
  });

  it("still detects a changed modifiedAt", () => {
    assert.notStrictEqual(
      comparable(
        dbRow({ modifiedAt: "2025-01-01T00:00:00.000Z" }) as unknown as Record<string, unknown>,
      ),
      comparable(input as unknown as Record<string, unknown>),
    );
  });
});

describe("sameCategories", () => {
  it("matches regardless of category order", () => {
    assert.ok(sameCategories(dbRow() as never, input));
  });

  it("detects a missing secondary category", () => {
    assert.ok(
      !sameCategories(dbRow({ categories: [{ slug: "visa" }] }) as never, input),
    );
  });

  it("detects a different primary category", () => {
    assert.ok(
      !sameCategories(dbRow({ primaryCategory: { slug: "study-cost" } }) as never, input),
    );
  });
});
