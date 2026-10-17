import type { BlogCategory, BlogPost, BlogPostSummary } from "@app/lib/blog/types";

/** Shaped like rows from output/blogs.json, trimmed to what the UI reads. */

export const visaCategory: BlogCategory = {
  id: "cat-visa",
  name: "Visa",
  slug: "visa",
  description: "Visa process guides for students.",
  postCount: 7,
};

export const counsellingCategory: BlogCategory = {
  id: "cat-counselling",
  name: "Counselling",
  slug: "counselling",
  postCount: 20,
};

export const summaryWithImage: BlogPostSummary = {
  id: "post-1",
  slug: "how-to-fill-the-ds-160-form",
  title: "How to Fill the DS-160 Form, Step by Step",
  excerpt: "A walkthrough of every section of the US visa application form.",
  publishedAt: new Date("2024-07-12T10:00:00.000Z"),
  modifiedAt: new Date("2025-03-03T09:00:00.000Z"),
  authorName: "Rahul Sharma",
  featuredImageUrl: "https://cdn.abroadkart.com/blog/how-to-fill-the-ds-160-form.webp",
  featuredImageAlt: "DS-160 form on a laptop screen",
  featuredImageWidth: 840,
  featuredImageHeight: 427,
  primaryCategory: visaCategory,
  readingTimeMinutes: 6,
  wordCount: 1287,
};

export const summaryWithoutImage: BlogPostSummary = {
  id: "post-2",
  slug: "gre-or-gmat-which-to-take",
  title: "GRE or GMAT: Which Should You Take?",
  excerpt: "Compare the two tests on format, cost and what schools accept.",
  publishedAt: new Date("2024-08-01T10:00:00.000Z"),
  modifiedAt: new Date("2024-08-01T10:00:00.000Z"),
  authorName: "Priya Nair",
  primaryCategory: counsellingCategory,
  readingTimeMinutes: 4,
};

export const fullPost: BlogPost = {
  ...summaryWithImage,
  status: "published",
  contentHtml: "<h2 id=\"step-one\">Step one</h2><p>Begin the form.</p>",
  headings: [{ level: 2, text: "Step one", id: "step-one" }],
  faqs: [],
  categories: [visaCategory],
  metaTitle: undefined,
  metaDescription: undefined,
  tags: [],
};
