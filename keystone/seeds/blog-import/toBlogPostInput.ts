import path from "node:path";
import { sanitizeContent } from "./sanitizeContent";
import { rewriteInternalLinks } from "./rewriteInternalLinks";
import type { BlogPostInput, WpPost } from "./types";

export type ImportContext = {
  cdnUrl: string;
  slugSet: Set<string>;
  redirectMap: Record<string, string>;
};

/**
 * Maps one WordPress post to the BlogPost fields. Pure: no DB, no network.
 * The author email is dropped here and never reaches the database.
 */
export function toBlogPostInput(
  wp: WpPost,
  ctx: ImportContext,
): { input: BlogPostInput; unknownLinks: string[] } {
  const { html, unknown } = rewriteInternalLinks(
    sanitizeContent(wp.contentHtml),
    ctx.slugSet,
    ctx.redirectMap,
  );
  const img = wp.featuredImage;

  return {
    unknownLinks: unknown,
    input: {
      postId: Number(wp.wpPostId),
      slug: wp.slug,
      title: wp.title,
      status: wp.status,
      publishedAt: new Date(wp.publishedAt),
      modifiedAt: new Date(wp.updatedAt),
      authorName: wp.author.name,
      excerpt: wp.excerpt,
      contentHtml: html,
      headings: wp.headings,
      faqs: wp.faqs,
      tags: wp.tags.map((t) => t.name),
      featuredImageUrl: img
        ? `${ctx.cdnUrl}/blog/${wp.slug}${path.extname(img.stagedPath)}`
        : "",
      featuredImageAlt: img?.alt ?? "",
      featuredImageWidth: img?.width ?? null,
      featuredImageHeight: img?.height ?? null,
      metaTitle: wp.seo.metaTitle || wp.title,
      metaDescription: wp.seo.metaDescription || wp.excerpt,
      focusKeywords: wp.seo.focusKeywords ?? [],
      wordCount: wp.stats.wordCount,
      readingTimeMinutes: wp.stats.readingTimeMinutes,
      primaryCategorySlug: wp.primaryCategory?.slug ?? null,
      categorySlugs: wp.categories.map((c) => c.slug),
    },
  };
}
