import type { Metadata } from "next";
import { getPublicAppUrl } from "@app/lib/public-urls";
import type { BlogPost } from "./types";
import { answerToPlainText } from "./faq";

/**
 * Truncates a string to a maximum length at a word boundary, adding ellipsis.
 * @param text The text to truncate
 * @param maxLength Maximum length (default 160)
 * @returns The truncated text, or the original if it fits
 */
function truncateAtWordBoundary(text: string, maxLength = 160): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace) + "…";
  }

  return truncated + "…";
}

/**
 * Builds Next.js Metadata for a blog post.
 * - Title: `metaTitle || title`
 * - Description: `metaDescription || excerpt`, max 160 chars at word boundary
 * - Canonical: absolute URL
 * - OpenGraph: article type, publish/mod times, section, tags (or focus keywords), images
 * - Twitter: summary_large_image
 * - Robots: index for published, noindex for drafts
 */
export function buildPostMetadata(post: BlogPost): Metadata {
  const baseUrl = getPublicAppUrl();
  const canonical = `${baseUrl}/blogs/${post.slug}`;
  const title = post.metaTitle || post.title;
  const description = truncateAtWordBoundary(
    post.metaDescription || post.excerpt || ""
  );

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      url: canonical,
      siteName: "AbroadKart",
      locale: "en_IN",
      title,
      description,
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.modifiedAt.toISOString(),
      section: post.primaryCategory?.name,
      // Most posts have no tags. Their focus keywords are the next best description of the topic.
      tags: post.tags?.length ? post.tags : post.focusKeywords,
      images: post.featuredImageUrl
        ? [
            {
              url: post.featuredImageUrl,
              alt: post.featuredImageAlt || "",
              width: post.featuredImageWidth,
              height: post.featuredImageHeight,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
    },
    robots:
      post.status === "published"
        ? "index, follow, max-image-preview:large"
        : "noindex",
  };
}

interface SchemaOrgEntity {
  "@context"?: string;
  "@type"?: string;
  "@graph"?: SchemaOrgEntity[];
  [key: string]: unknown;
}

/**
 * Builds JSON-LD structured data for a blog post.
 * Returns a @graph containing:
 * - BlogPosting (author is {name} only, no URL/image)
 * - BreadcrumbList (3 items: Home, Blogs, Post)
 * - FAQPage (only if FAQs exist; text matches exactly)
 */
export function buildPostJsonLd(post: BlogPost): SchemaOrgEntity {
  const baseUrl = getPublicAppUrl();
  const postUrl = `${baseUrl}/blogs/${post.slug}`;

  const graph: SchemaOrgEntity[] = [
    {
      "@type": "BlogPosting",
      "@id": postUrl,
      headline: post.title,
      description: post.metaDescription || post.excerpt,
      image: post.featuredImageUrl
        ? {
            "@type": "ImageObject",
            url: post.featuredImageUrl,
            width: post.featuredImageWidth,
            height: post.featuredImageHeight,
            alt: post.featuredImageAlt,
          }
        : undefined,
      datePublished: post.publishedAt.toISOString(),
      dateModified: post.modifiedAt.toISOString(),
      author: {
        "@type": "Person",
        name: post.authorName || "AbroadKart",
      },
      publisher: {
        "@type": "Organization",
        name: "AbroadKart",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": postUrl,
      },
      wordCount: post.wordCount,
      keywords: post.focusKeywords?.join(", "),
      articleSection: post.primaryCategory?.name,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blogs",
          item: `${baseUrl}/blogs`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: postUrl,
        },
      ],
    },
  ];

  if (post.faqs && post.faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: post.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answerToPlainText(faq.answer),
        },
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

/**
 * Serializes an object to JSON string, escaping < as < to prevent </script> breakout.
 * Use this when inserting JSON-LD into a <script> tag in HTML.
 */
export function serializeJsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

/**
 * Metadata for the blog index and category archives.
 * Later pages canonicalise to themselves (`?page=N`), so each page can be indexed.
 */
export function buildListingMetadata({
  path,
  title,
  description,
  page = 1,
}: {
  /** Path without query, e.g. "/blogs" or "/blogs/category/visa". */
  path: string;
  title: string;
  description: string;
  page?: number;
}): Metadata {
  const baseUrl = getPublicAppUrl();
  const pagePath = page > 1 ? `${path}?page=${page}` : path;
  const url = `${baseUrl}${pagePath}`;
  const pageTitle = page > 1 ? `${title} — Page ${page}` : title;

  return {
    title: pageTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: "AbroadKart",
      locale: "en_IN",
      title: pageTitle,
      description,
    },
    robots: "index, follow",
  };
}
