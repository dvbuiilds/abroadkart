import { readFileSync } from "node:fs";
import path from "node:path";

// Source of truth for Phase 6: the WordPress export in output/. Counts are
// asserted on load so that a wrong or partial export fails the whole suite
// instead of quietly testing fewer posts.

export interface SourceFaq {
  order: number;
  question: string;
  answer: string;
}

export interface SourceHeading {
  level: number;
  text: string;
  id: string;
}

export interface SourcePost {
  wpPostId: number;
  slug: string;
  title: string;
  status: "published" | "draft";
  publishedAt: string;
  updatedAt: string;
  excerpt: string;
  contentHtml: string;
  headings: SourceHeading[];
  faqs: SourceFaq[];
  categories: Array<{ slug: string } | string>;
  author: { name: string; email: string };
}

export interface SourceCategory {
  slug: string;
  name: string;
  postCount: number;
}

export interface SourceRedirect {
  source: string;
  destination: string;
  permanent: boolean;
}

export interface SourceAuthor {
  name: string;
  slug: string;
  email: string;
}

const OUTPUT_DIR = path.resolve(__dirname, "../../output");

function load<T>(file: string): T {
  return JSON.parse(readFileSync(path.join(OUTPUT_DIR, file), "utf8")) as T;
}

const allPosts = load<SourcePost[]>("blogs.json");
const allCategories = load<SourceCategory[]>("categories.json");
const allRedirects = load<SourceRedirect[]>("redirects.json");
const allAuthors = load<SourceAuthor[]>("authors.json");

export const published = allPosts.filter((post) => post.status === "published");
export const drafts = allPosts.filter((post) => post.status === "draft");
export const categories = allCategories;
export const redirects = allRedirects;
export const authors = allAuthors;

/** The one draft post. Its slug must 404 on /blogs. */
export const draft = drafts[0];

/** Legacy WordPress source paths, e.g. "/ms-in-computer-science-usa/". */
export const legacyPaths = redirects.map((redirect) => redirect.source);

if (published.length !== 110 || drafts.length !== 1) {
  throw new Error(
    `Unexpected export: ${published.length} published, ${drafts.length} drafts (expected 110 and 1)`,
  );
}
if (categories.length !== 11) {
  throw new Error(`Unexpected export: ${categories.length} categories (expected 11)`);
}
if (redirects.length !== 9) {
  throw new Error(`Unexpected export: ${redirects.length} redirects (expected 9)`);
}
