import { test, expect } from "@playwright/test";
import { published, authors, type SourcePost } from "./helpers/source";
import { comparableText, parseDocument, plainText } from "./helpers/text";

// Runs only in the `chromium-nojs` project (JavaScript disabled). Every check
// reads the server HTML, so crawlers that never run JS see the full content.

const mbaPgdm = requirePost("mba-vs-pgdm-guide");
const johnsHopkins = requirePost("johns-hopkins-university");
// Three representative posts, per the plan: FAQs and tables, a post with no
// FAQs and no tables, and the post that had leftover ChatGPT wrappers.
const noFaqNoTable = published.find(
  (post) => post.faqs.length === 0 && !post.contentHtml.includes("<table"),
);
if (!noFaqNoTable) throw new Error("No post without FAQs or tables in the export");

const POSTS: Array<{ label: string; post: SourcePost }> = [
  { label: "with FAQs and tables", post: mbaPgdm },
  { label: "without FAQs", post: noFaqNoTable },
  { label: "johns-hopkins-university (former ChatGPT wrappers)", post: johnsHopkins },
];

function requirePost(slug: string): SourcePost {
  const post = published.find((candidate) => candidate.slug === slug);
  if (!post) throw new Error(`${slug} is missing from the export`);
  return post;
}

interface JsonLdNode {
  "@type"?: string | string[];
  [key: string]: unknown;
}

function jsonLdNodes(doc: Document): JsonLdNode[] {
  const nodes: JsonLdNode[] = [];
  for (const script of doc.querySelectorAll('script[type="application/ld+json"]')) {
    const parsed = JSON.parse(script.textContent ?? "null");
    const items = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of items) {
      if (item && Array.isArray(item["@graph"])) nodes.push(...item["@graph"]);
      else if (item) nodes.push(item);
    }
  }
  return nodes;
}

function ofType(nodes: JsonLdNode[], type: string): JsonLdNode | undefined {
  return nodes.find((node) => {
    const nodeType = node["@type"];
    return Array.isArray(nodeType) ? nodeType.includes(type) : nodeType === type;
  });
}

for (const { label, post } of POSTS) {
  test.describe(`${post.slug}: ${label}`, () => {
    test("is served with 200 and one H1 equal to the title", async ({ request }) => {
      const response = await request.get(`/blogs/${post.slug}`);
      expect(response.status()).toBe(200);
      const doc = parseDocument(await response.text());

      const h1s = doc.querySelectorAll("h1");
      expect(h1s.length).toBe(1);
      expect(comparableText(h1s[0].innerHTML)).toBe(comparableText(post.title));
    });

    test("a browser with JavaScript disabled renders the H1 and body", async ({ page }) => {
      await page.goto(`/blogs/${post.slug}`);
      await expect(page.locator("h1")).toHaveText(post.title);
      await expect(page.locator("article#article-body")).toContainText(
        plainText(post.contentHtml).slice(0, 60),
      );
    });

    test("the final paragraph of the body is in the server HTML", async ({ request }) => {
      const response = await request.get(`/blogs/${post.slug}`);
      const html = await response.text();

      const paragraphs = parseDocument(post.contentHtml).querySelectorAll("p");
      const last = paragraphs[paragraphs.length - 1];
      expect(last, "source has a paragraph").toBeDefined();
      expect(comparableText(html)).toContain(comparableText(last.innerHTML));
    });

    test("FAQ answers are in the server HTML, or there is no FAQ section", async ({ request }) => {
      const response = await request.get(`/blogs/${post.slug}`);
      const html = await response.text();
      const text = comparableText(html);

      if (post.faqs.length === 0) {
        expect(plainText(html)).not.toContain("Frequently Asked Questions");
        return;
      }
      expect(plainText(html)).toContain("Frequently Asked Questions");
      for (const faq of post.faqs) {
        expect(text, `FAQ answer ${faq.order}`).toContain(comparableText(faq.answer));
      }
    });

    test("canonical, Open Graph and article times match the source", async ({ request }) => {
      const response = await request.get(`/blogs/${post.slug}`);
      const doc = parseDocument(await response.text());
      const meta = (selector: string) => doc.querySelector(selector)?.getAttribute("content") ?? "";

      const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "";
      expect(canonical).toMatch(/^https?:\/\//);
      expect(new URL(canonical).pathname).toBe(`/blogs/${post.slug}`);

      expect(meta('meta[property="og:title"]').length).toBeGreaterThan(0);
      expect(meta('meta[property="og:type"]')).toBe("article");
      expect(meta('meta[property="og:image"]')).toMatch(/^https?:\/\//);
      expect(meta('meta[property="og:image:width"]')).toMatch(/^\d+$/);
      expect(meta('meta[property="og:image:height"]')).toMatch(/^\d+$/);

      expect(new Date(meta('meta[property="article:published_time"]')).getTime()).toBe(
        new Date(post.publishedAt).getTime(),
      );
      expect(new Date(meta('meta[property="article:modified_time"]')).getTime()).toBe(
        new Date(post.updatedAt).getTime(),
      );
    });

    test("the post is indexable", async ({ request }) => {
      const response = await request.get(`/blogs/${post.slug}`);
      const robots = parseDocument(await response.text())
        .querySelector('meta[name="robots"]')
        ?.getAttribute("content") ?? "";
      expect(robots).toContain("index");
      expect(robots).not.toContain("noindex");
    });

    test("JSON-LD parses and describes the post", async ({ request }) => {
      const response = await request.get(`/blogs/${post.slug}`);
      const nodes = jsonLdNodes(parseDocument(await response.text()));

      const blogPosting = ofType(nodes, "BlogPosting");
      expect(blogPosting, "BlogPosting node").toBeDefined();
      expect(blogPosting!.headline).toBe(post.title);

      // Author carries a name only: no URL, image or email.
      const author = blogPosting!.author as Record<string, unknown>;
      expect(author["@type"]).toBe("Person");
      expect(author.name).toEqual(expect.any(String));
      for (const forbidden of ["url", "image", "email", "sameAs"]) {
        expect(author[forbidden], `author.${forbidden}`).toBeUndefined();
      }

      const breadcrumbs = ofType(nodes, "BreadcrumbList") as
        | { itemListElement?: unknown[] }
        | undefined;
      expect(breadcrumbs?.itemListElement).toHaveLength(3);

      const faqPage = ofType(nodes, "FAQPage") as
        | { mainEntity?: Array<{ name: string; acceptedAnswer: { text: string } }> }
        | undefined;
      if (post.faqs.length === 0) {
        expect(faqPage).toBeUndefined();
      } else {
        expect(faqPage?.mainEntity).toHaveLength(post.faqs.length);
        post.faqs.forEach((faq, index) => {
          const entity = faqPage!.mainEntity![index];
          expect(comparableText(entity.name)).toBe(comparableText(faq.question));
          expect(comparableText(entity.acceptedAnswer.text)).toBe(comparableText(faq.answer));
        });
      }
    });

    test("no author email appears in the page", async ({ request }) => {
      const html = await (await request.get(`/blogs/${post.slug}`)).text();
      for (const author of authors) {
        expect(html).not.toContain(author.email);
      }
    });
  });
}

test.describe("listing pages without JavaScript", () => {
  test("/blogs has one H1 and links to posts", async ({ request }) => {
    const response = await request.get("/blogs");
    expect(response.status()).toBe(200);
    const doc = parseDocument(await response.text());
    expect(doc.querySelectorAll("h1").length).toBe(1);
    expect(doc.querySelectorAll('a[href^="/blogs/"]').length).toBeGreaterThan(0);
  });

  test("a category page has one H1 and links to posts", async ({ request }) => {
    const response = await request.get("/blogs/category/counselling");
    expect(response.status()).toBe(200);
    const doc = parseDocument(await response.text());
    expect(doc.querySelectorAll("h1").length).toBe(1);
    expect(doc.querySelectorAll('a[href^="/blogs/"]').length).toBeGreaterThan(0);
  });
});
