/**
 * Blog import helper tests. They run against the real WordPress export in ../output,
 * so the fidelity checks cover every post, not a hand-written sample.
 * Run: npm run test
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  sanitizeContent,
  rewriteInternalLinks,
  toBlogPostInput,
  buildRedirectMap,
  buildLegacyRedirects,
} from "../seeds/blog-import";
import { parseBody } from "../seeds/blog-import/dom";
import type {
  WpPost,
  WpRedirect,
  ImageManifestRow,
} from "../seeds/blog-import/types";

const OUTPUT = path.join(__dirname, "..", "..", "output");
const load = <T>(file: string): T =>
  JSON.parse(readFileSync(path.join(OUTPUT, file), "utf8")) as T;

const posts = load<WpPost[]>("blogs.json");
const redirects = load<WpRedirect[]>("redirects.json");
const manifest = load<ImageManifestRow[]>("images-manifest.json");

const published = posts.filter((p) => p.status === "published");
const slugSet = new Set(published.map((p) => p.slug));
const redirectMap = buildRedirectMap(redirects);
const CDN = "https://cdn.abroadkart.com";
const ctx = { cdnUrl: CDN, slugSet, redirectMap };

const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const body = parseBody;
const text = (html: string) => norm(body(html).textContent ?? "");
const byPost = (slug: string) => posts.find((p) => p.slug === slug)!;

describe("sanitizeContent", () => {
  it("preserves visible text for all posts", () => {
    for (const p of posts) {
      assert.strictEqual(text(sanitizeContent(p.contentHtml)), text(p.contentHtml), p.slug);
    }
  });

  it("preserves every heading id", () => {
    let total = 0;
    for (const p of posts) {
      const ids = (html: string) =>
        [...body(html).querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => h.id);
      const before = ids(p.contentHtml);
      total += before.length;
      assert.deepStrictEqual(ids(sanitizeContent(p.contentHtml)), before, p.slug);
    }
    assert.ok(total > 2000, `expected thousands of headings, saw ${total}`);
  });

  it("strips class and style attributes and unwraps div and article", () => {
    for (const p of posts) {
      const doc = body(sanitizeContent(p.contentHtml));
      assert.strictEqual(doc.querySelectorAll("[class],[style]").length, 0, p.slug);
      assert.strictEqual(doc.querySelectorAll("div,article").length, 0, p.slug);
    }
  });

  it("leaves every other tag count unchanged", () => {
    const count = (html: string) => {
      const out: Record<string, number> = {};
      for (const el of body(html).querySelectorAll("*")) {
        const t = el.tagName.toLowerCase();
        if (t === "div" || t === "article") continue;
        out[t] = (out[t] ?? 0) + 1;
      }
      return out;
    };
    for (const p of posts) {
      assert.deepStrictEqual(count(sanitizeContent(p.contentHtml)), count(p.contentHtml), p.slug);
    }
  });

  it("unwraps the ChatGPT wrappers in johns-hopkins-university", () => {
    const src = byPost("johns-hopkins-university").contentHtml;
    assert.ok(/<div|<article/.test(src), "fixture should contain wrappers");
    const out = sanitizeContent(src);
    assert.ok(!/<div|<article|class=|style=/.test(out));
    assert.strictEqual(text(out), text(src));
  });

  it("does not change href values", () => {
    const hrefs = (html: string) =>
      [...body(html).querySelectorAll("a")].map((a) => a.getAttribute("href"));
    for (const p of posts) {
      assert.deepStrictEqual(hrefs(sanitizeContent(p.contentHtml)), hrefs(p.contentHtml), p.slug);
    }
  });
});

describe("rewriteInternalLinks", () => {
  const run = (html: string) => rewriteInternalLinks(html, slugSet, redirectMap);
  const aSlug = [...slugSet][0];

  it("rewrites /<slug>/ to /blogs/<slug>", () => {
    const { html, unknown } = run(`<a href="/${aSlug}/">x</a>`);
    assert.strictEqual(html, `<a href="/blogs/${aSlug}">x</a>`);
    assert.deepStrictEqual(unknown, []);
  });

  it("follows a legacy redirect to the final slug in one hop", () => {
    const { html } = run(`<a href="/ms-in-computer-science-usa/">x</a>`);
    assert.strictEqual(html, `<a href="/blogs/ms-in-computer-science-in-usa">x</a>`);
  });

  it("rewrites absolute abroadkart.com links, with and without www", () => {
    assert.strictEqual(
      run(`<a href="https://abroadkart.com/${aSlug}/">x</a>`).html,
      `<a href="/blogs/${aSlug}">x</a>`,
    );
    assert.strictEqual(
      run(`<a href="https://www.abroadkart.com/${aSlug}">x</a>`).html,
      `<a href="/blogs/${aSlug}">x</a>`,
    );
  });

  it("keeps a #fragment and leaves external links and link text alone", () => {
    assert.strictEqual(
      run(`<a href="/${aSlug}/#faq">Read <b>this</b></a>`).html,
      `<a href="/blogs/${aSlug}#faq">Read <b>this</b></a>`,
    );
    const ext = `<a href="https://example.com/${aSlug}/">x</a>`;
    assert.strictEqual(run(ext).html, ext);
  });

  it("sends an unknown internal link to /blogs and reports it", () => {
    const { html, unknown } = run(`<a href="/no-such-page/">x</a>`);
    assert.strictEqual(html, `<a href="/blogs">x</a>`);
    assert.deepStrictEqual(unknown, ["/no-such-page/"]);
  });

  it("reports exactly one unknown link across all posts", () => {
    const all = posts.flatMap((p) => rewriteInternalLinks(p.contentHtml, slugSet, redirectMap).unknown);
    assert.deepStrictEqual(all, ["/course-country-university-selection/"]);
  });

  it("only changes href attributes (text stays identical for all posts)", () => {
    for (const p of posts) {
      const out = rewriteInternalLinks(p.contentHtml, slugSet, redirectMap).html;
      assert.strictEqual(text(out), text(p.contentHtml), p.slug);
    }
  });
});

describe("toBlogPostInput", () => {
  const first = byPost("one-year-masters-in-usa-for-indian-students");
  const map = (p: WpPost) => toBlogPostInput(p, ctx);

  it("converts wpPostId to a numeric postId", () => {
    assert.strictEqual(map(first).input.postId, Number(first.wpPostId));
  });

  it("keeps the original dates exactly", () => {
    for (const p of posts) {
      const { input } = map(p);
      assert.strictEqual(input.publishedAt.getTime(), new Date(p.publishedAt).getTime(), p.slug);
      assert.strictEqual(input.modifiedAt.getTime(), new Date(p.updatedAt).getTime(), p.slug);
    }
  });

  it("never carries an email address", () => {
    for (const p of posts) {
      const json = JSON.stringify(map(p).input);
      assert.ok(!json.includes(p.author.email), p.slug);
      assert.ok(!/[\w.+-]+@[\w-]+\.[\w.]+/.test(json), p.slug);
    }
  });

  it("keeps the author name as plain text", () => {
    assert.strictEqual(map(first).input.authorName, first.author.name);
  });

  it("falls back to excerpt for an empty metaDescription and to title for metaTitle", () => {
    const empty = posts.filter((p) => !p.seo.metaDescription);
    assert.ok(empty.length > 0);
    for (const p of empty) {
      assert.strictEqual(map(p).input.metaDescription, p.excerpt, p.slug);
    }
    for (const p of posts) {
      assert.ok(map(p).input.metaTitle.length > 0, p.slug);
    }
  });

  it("never produces an empty metaDescription", () => {
    for (const p of posts) assert.ok(map(p).input.metaDescription.length > 0, p.slug);
  });

  it("keeps the draft as a draft, without an image, and does not throw", () => {
    const draft = posts.find((p) => p.status === "draft")!;
    const { input } = map(draft);
    assert.strictEqual(input.status, "draft");
    assert.strictEqual(input.featuredImageUrl, "");
  });

  it("maps tags to names and passes headings and faqs through unchanged", () => {
    for (const p of posts) {
      const { input } = map(p);
      assert.deepStrictEqual(input.tags, p.tags.map((t) => t.name), p.slug);
      assert.deepStrictEqual(input.headings, p.headings, p.slug);
      assert.deepStrictEqual(input.faqs, p.faqs, p.slug);
      assert.deepStrictEqual(input.focusKeywords, p.seo.focusKeywords ?? [], p.slug);
    }
  });

  it("builds the CDN image URL from the slug and staged extension", () => {
    const { input } = map(first);
    assert.strictEqual(input.featuredImageUrl, `${CDN}/blog/${first.slug}.webp`);
    assert.strictEqual(input.featuredImageWidth, first.featuredImage!.width);
    assert.strictEqual(input.featuredImageHeight, first.featuredImage!.height);
    assert.strictEqual(input.featuredImageAlt, first.featuredImage!.alt);
  });

  it("exposes category slugs and cleaned content", () => {
    const { input } = map(first);
    assert.strictEqual(input.primaryCategorySlug, first.primaryCategory!.slug);
    assert.deepStrictEqual(input.categorySlugs, first.categories.map((c) => c.slug));
    assert.strictEqual(text(input.contentHtml), text(first.contentHtml));
  });

  it("carries wordCount and readingTimeMinutes", () => {
    const { input } = map(first);
    assert.strictEqual(input.wordCount, first.stats.wordCount);
    assert.strictEqual(input.readingTimeMinutes, first.stats.readingTimeMinutes);
  });
});

describe("buildLegacyRedirects", () => {
  const rules = buildLegacyRedirects(posts, redirects, manifest, CDN);
  const stripSlash = (s: string) => (s.length > 1 ? s.replace(/\/$/, "") : s);
  const sources = new Set(rules.map((r) => stripSlash(r.source)));

  it("has no chains: no destination is another rule's source", () => {
    for (const r of rules) {
      assert.ok(!sources.has(stripSlash(r.destination)), `${r.source} -> ${r.destination}`);
    }
  });

  it("covers every published slug and excludes drafts", () => {
    for (const s of slugSet) {
      const rule = rules.find((r) => stripSlash(r.source) === `/${s}`);
      assert.ok(rule, `missing ${s}`);
      assert.strictEqual(rule!.destination, `/blogs/${s}`);
    }
    for (const d of posts.filter((p) => p.status === "draft")) {
      assert.ok(!sources.has(`/${d.slug}`), "draft must not be redirected");
    }
  });

  it("sends the 9 legacy redirects straight to the final /blogs URL", () => {
    assert.strictEqual(redirects.length, 9);
    for (const r of redirects) {
      const rule = rules.find((x) => stripSlash(x.source) === stripSlash(r.source));
      assert.ok(rule, r.source);
      assert.strictEqual(rule!.destination, `/blogs/${r.destination.replace(/^\/|\/$/g, "")}`);
    }
  });

  it("includes the taxonomy, feed and blog rules", () => {
    const get = (s: string) => rules.find((r) => r.source === s)?.destination;
    assert.strictEqual(get("/category/:c"), "/blogs/category/:c");
    assert.strictEqual(get("/author/:a*"), "/blogs");
    assert.strictEqual(get("/tag/:t*"), "/blogs");
    assert.strictEqual(get("/feed"), "/blogs");
    assert.strictEqual(get("/blog/:path*"), "/blogs");
  });

  it("maps each uploaded image and its renditions to the CDN, with a catch-all last", () => {
    const row = manifest[0];
    const ext = path.extname(row.stagedPath);
    const orig = rules.find((r) => r.source === `/${row.sourcePath}`);
    assert.strictEqual(orig?.destination, `${CDN}/blog/${row.slug}${ext}`);
    const withRenditions = posts.find((p) => p.slug === row.slug)!.featuredImage!.renditions;
    assert.ok(withRenditions.length > 0);
    for (const r of withRenditions) {
      const rule = rules.find((x) => x.source === `/${r.sourcePath}`);
      assert.strictEqual(rule?.destination, `${CDN}/blog/${row.slug}${ext}`, r.sourcePath);
    }
    const last = rules[rules.length - 1];
    assert.strictEqual(last.source, "/wp-content/uploads/:path*");
    assert.strictEqual(last.destination, "/blogs");
  });

  it("is valid for next.config redirects()", () => {
    const seen = new Set<string>();
    for (const r of rules) {
      assert.ok(r.source.startsWith("/"), r.source);
      assert.strictEqual(r.permanent, true);
      assert.ok(!seen.has(r.source), `duplicate ${r.source}`);
      seen.add(r.source);
      if (!r.source.includes(":")) {
        assert.ok(!/[()*?{}]/.test(r.source), `unescaped pattern chars in ${r.source}`);
      }
    }
    assert.ok(rules.length < 1000, `${rules.length} rules`);
  });

  it("is deterministic", () => {
    assert.deepStrictEqual(buildLegacyRedirects(posts, redirects, manifest, CDN), rules);
  });
});
