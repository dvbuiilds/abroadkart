import { test, expect } from "@playwright/test";
import { published, type SourcePost } from "./helpers/source";
import { comparableText, parseDocument } from "./helpers/text";

// Content fidelity (plan §5): for every published post the rendered article
// must carry the same text as the WordPress export. Comparison is done with
// comparableText(), which removes all whitespace. The 26 table posts differ
// from the source only in whitespace between cells, so an exact compare would
// fail by design. Every word and character is still checked.
//
// A failure here is a real fidelity bug. Do not loosen the comparison to make
// it pass.

// Known unresolved link (open item 2 in BLOG_PHASE5_UI_PLAN.md). The target
// slug is not in the export, so the link is allowed through until the product
// owner provides a mapping.
const KNOWN_UNRESOLVED: Record<string, string[]> = {
  "accommodation-for-students-in-the-usa": ["/course-country-university-selection/"],
};

const WP_STYLE_HREF = /^\/[a-z0-9-]+\/?$/i;

test.describe.configure({ mode: "parallel" });

for (const post of published) {
  test(`${post.slug} matches its source`, async ({ request }) => {
    const response = await request.get(`/blogs/${post.slug}`);
    expect(response.status()).toBe(200);
    const doc = parseDocument(await response.text());

    await checkBodyText(doc, post);
    checkTitle(doc, post);
    checkHeadingIds(doc, post);
    checkDates(doc, post);
    checkInternalLinks(doc, post);
    checkMetaDescription(doc);
  });
}

async function checkBodyText(doc: Document, post: SourcePost) {
  const article = doc.querySelector("article#article-body");
  expect(article, "article#article-body is rendered").not.toBeNull();
  expect(comparableText(article!.innerHTML)).toBe(comparableText(post.contentHtml));
}

function checkTitle(doc: Document, post: SourcePost) {
  const h1s = doc.querySelectorAll("h1");
  expect(h1s.length, "exactly one H1").toBe(1);
  expect(comparableText(h1s[0].innerHTML)).toBe(comparableText(post.title));
}

function checkHeadingIds(doc: Document, post: SourcePost) {
  const article = doc.querySelector("article#article-body")!;
  const counts = new Map<string, number>();
  for (const el of article.querySelectorAll("[id]")) {
    counts.set(el.id, (counts.get(el.id) ?? 0) + 1);
  }
  for (const heading of post.headings) {
    expect(counts.get(heading.id), `heading id "${heading.id}" appears once`).toBe(1);
  }
}

function checkDates(doc: Document, post: SourcePost) {
  // The meta row renders Published first, then Updated when the dates differ.
  const times = Array.from(doc.querySelectorAll("time[datetime]"));
  expect(times.length).toBeGreaterThanOrEqual(1);
  expect(new Date(times[0].getAttribute("datetime")!).getTime()).toBe(
    new Date(post.publishedAt).getTime(),
  );

  // PostMeta shows "Updated" when the publish and update dates fall on
  // different calendar days in IST, not when the instants differ.
  if (istDay(post.publishedAt) !== istDay(post.updatedAt)) {
    expect(times.length).toBeGreaterThanOrEqual(2);
    expect(new Date(times[1].getAttribute("datetime")!).getTime()).toBe(
      new Date(post.updatedAt).getTime(),
    );
  }
}

function checkInternalLinks(doc: Document, post: SourcePost) {
  const article = doc.querySelector("article#article-body")!;
  const allowed = new Set(KNOWN_UNRESOLVED[post.slug] ?? []);

  for (const anchor of article.querySelectorAll("a[href]")) {
    const href = anchor.getAttribute("href")!;
    if (allowed.has(href)) continue;

    if (href === "/blogs") continue; // the blog index, which is an app route
    expect(href, `no WordPress-style link in ${post.slug}`).not.toMatch(WP_STYLE_HREF);
    if (href.startsWith("/blogs/")) {
      const slug = href.slice("/blogs/".length);
      expect(published.some((p) => p.slug === slug), `${post.slug} links to ${href}`).toBe(true);
    }
  }
}

function istDay(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(iso));
}

function checkMetaDescription(doc: Document) {
  const description = doc.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
  expect(description.length).toBeGreaterThan(0);
  expect(description.length).toBeLessThanOrEqual(160);
}
