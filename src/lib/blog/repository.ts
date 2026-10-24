import { cache } from "react";
import { getKeystoneInternalUrl } from "@app/lib/keystone-url";
import type {
  BlogPost,
  BlogPostSummary,
  BlogCategory,
  Faq,
  Heading,
} from "./types";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
  tags: string[] = ["blog:list"]
): Promise<T> {
  const endpoint = `${getKeystoneInternalUrl()}/api/graphql`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: {
      revalidate: 3600,
      tags,
    },
  });

  if (!response.ok) {
    throw new Error(`GraphQL request failed: ${response.statusText}`);
  }

  const result = (await response.json()) as GraphQLResponse<T>;

  if (result.errors && result.errors.length > 0) {
    throw new Error(`GraphQL error: ${result.errors[0].message}`);
  }

  return result.data as T;
}

// ── Mapping: Keystone returns dates as ISO strings and may return nulls ──

type RawDate = string | Date;

function toDate(value: RawDate): Date {
  return value instanceof Date ? value : new Date(value);
}

type RawSummary = Omit<BlogPostSummary, "publishedAt" | "modifiedAt"> & {
  publishedAt: RawDate;
  modifiedAt: RawDate;
};

function mapSummary(raw: RawSummary): BlogPostSummary {
  return {
    ...raw,
    publishedAt: toDate(raw.publishedAt),
    modifiedAt: toDate(raw.modifiedAt),
  };
}

type RawPost = Omit<
  BlogPost,
  "publishedAt" | "modifiedAt" | "headings" | "faqs" | "categories"
> & {
  publishedAt: RawDate;
  modifiedAt: RawDate;
  headings?: Heading[] | null;
  faqs?: Faq[] | null;
  categories?: BlogCategory[] | null;
};

function mapPost(raw: RawPost): BlogPost {
  return {
    ...raw,
    publishedAt: toDate(raw.publishedAt),
    modifiedAt: toDate(raw.modifiedAt),
    headings: raw.headings ?? [],
    faqs: [...(raw.faqs ?? [])].sort((a, b) => a.order - b.order),
    categories: raw.categories ?? [],
  };
}

// ── Query fragments ──────────────────────────────────────────────────────

const SUMMARY_FIELDS = `
  id
  slug
  title
  status
  publishedAt
  modifiedAt
  authorName
  excerpt
  wordCount
  readingTimeMinutes
  featuredImageUrl
  featuredImageAlt
  featuredImageWidth
  featuredImageHeight
  primaryCategory {
    id
    name
    slug
  }
`;

const PUBLISHED = { status: { equals: "published" } };

/** Matches a post whose primary category, or any of its categories, has this slug. */
function inCategory(slug: string) {
  return {
    OR: [
      { primaryCategory: { slug: { equals: slug } } },
      { categories: { some: { slug: { equals: slug } } } },
    ],
  };
}

// ── Public API ───────────────────────────────────────────────────────────

/**
 * Fetch a single blog post by slug, including contentHtml.
 * Returns null if not found. Throws on GraphQL errors.
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const query = `
    query GetPostBySlug($slug: String!) {
      blogPosts(where: { slug: { equals: $slug } }) {
        id
        postId
        slug
        title
        status
        publishedAt
        modifiedAt
        authorName
        excerpt
        contentHtml
        headings
        faqs
        metaTitle
        metaDescription
        focusKeywords
        tags
        wordCount
        readingTimeMinutes
        featuredImageUrl
        featuredImageAlt
        featuredImageWidth
        featuredImageHeight
        primaryCategory {
          id
          name
          slug
          description
        }
        categories {
          id
          name
          slug
          description
        }
      }
    }
  `;

  const response = await graphqlRequest<{ blogPosts: RawPost[] }>(
    query,
    { slug },
    [`blog:${slug}`, "blog:list"]
  );
  const raw = response.blogPosts?.[0];
  return raw ? mapPost(raw) : null;
}

/**
 * Same as {@link getPostBySlug}, memoised per React request. Use it from
 * `generateMetadata` and the page so the post is fetched once per render.
 */
export const getPostBySlugCached = cache(getPostBySlug);

interface PostSummariesResult {
  items: BlogPostSummary[];
  totalCount: number;
}

/**
 * Fetch one page of published post summaries, newest first.
 * The category filter is sent as a GraphQL variable, never as query text.
 * Does NOT include contentHtml.
 */
export async function getPostSummaries({
  skip,
  take,
  categorySlug,
}: {
  skip: number;
  take: number;
  categorySlug?: string;
}): Promise<PostSummariesResult> {
  const where = categorySlug
    ? { ...PUBLISHED, ...inCategory(categorySlug) }
    : PUBLISHED;

  const query = `
    query GetPostSummaries($where: BlogPostWhereInput!, $skip: Int!, $take: Int!) {
      items: blogPosts(
        where: $where
        orderBy: { publishedAt: desc }
        skip: $skip
        take: $take
      ) {
        ${SUMMARY_FIELDS}
      }
      totalCount: blogPostsCount(where: $where)
    }
  `;

  const response = await graphqlRequest<{
    items: RawSummary[];
    totalCount: number;
  }>(query, { where, skip, take });

  return {
    items: (response.items ?? []).map(mapSummary),
    totalCount: response.totalCount ?? 0,
  };
}

/**
 * Get all published post slugs.
 * Returns empty array on any error (safe for next build when Keystone is down).
 */
export async function getAllSlugs(): Promise<string[]> {
  const query = `
    query GetAllSlugs {
      blogPosts(where: { status: { equals: "published" } }) {
        slug
      }
    }
  `;

  try {
    const response = await graphqlRequest<{ blogPosts: Array<{ slug: string }> }>(
      query
    );
    return response.blogPosts?.map((p) => p.slug) ?? [];
  } catch {
    return [];
  }
}

/**
 * Fetch categories that have at least one published post, busiest first.
 * A post that is both primary and secondary in a category is counted once.
 */
export async function getCategories(): Promise<BlogCategory[]> {
  const query = `
    query GetCategories {
      blogCategories {
        id
        name
        slug
        description
        posts(where: { status: { equals: "published" } }) {
          id
        }
        primaryPosts(where: { status: { equals: "published" } }) {
          id
        }
      }
    }
  `;

  type RawCategory = BlogCategory & {
    posts: Array<{ id: string }>;
    primaryPosts: Array<{ id: string }>;
  };

  const response = await graphqlRequest<{ blogCategories: RawCategory[] }>(query);

  return (response.blogCategories ?? [])
    .map(({ posts, primaryPosts, ...category }) => ({
      ...category,
      postCount: new Set([...posts, ...primaryPosts].map((p) => p.id)).size,
    }))
    .filter((category) => (category.postCount ?? 0) > 0)
    .sort(
      (a, b) =>
        (b.postCount ?? 0) - (a.postCount ?? 0) || a.name.localeCompare(b.name)
    );
}

/**
 * Fetch a single category by slug.
 * Returns null if not found.
 */
export async function getCategoryBySlug(
  slug: string
): Promise<BlogCategory | null> {
  const query = `
    query GetCategoryBySlug($slug: String!) {
      blogCategories(where: { slug: { equals: $slug } }) {
        id
        name
        slug
        description
      }
    }
  `;

  const response = await graphqlRequest<{ blogCategories: BlogCategory[] }>(query, {
    slug,
  });
  return response.blogCategories?.[0] ?? null;
}

const RELATED_IN_CATEGORY = `
  query GetRelatedInCategory($categorySlug: String!, $limit: Int!, $exclude: String!) {
    blogPosts(
      where: {
        status: { equals: "published" }
        slug: { not: { equals: $exclude } }
        primaryCategory: { slug: { equals: $categorySlug } }
      }
      orderBy: { publishedAt: desc }
      take: $limit
    ) {
      ${SUMMARY_FIELDS}
    }
  }
`;

const LATEST_POSTS = `
  query GetLatestPosts($limit: Int!) {
    blogPosts(
      where: { status: { equals: "published" } }
      orderBy: { publishedAt: desc }
      take: $limit
    ) {
      ${SUMMARY_FIELDS}
    }
  }
`;

async function fetchSummaries(
  query: string,
  variables: Record<string, unknown>
): Promise<BlogPostSummary[]> {
  const response = await graphqlRequest<{ blogPosts: RawSummary[] }>(
    query,
    variables
  );
  return (response.blogPosts ?? []).map(mapSummary);
}

/**
 * Posts to show under an article: the same primary category first, then the
 * latest published posts to fill any gap. Never includes the current post and
 * never repeats a post.
 * Does NOT include contentHtml.
 */
export async function getRelatedPosts(
  post: { slug: string; primaryCategory?: BlogCategory },
  limit = 3
): Promise<BlogPostSummary[]> {
  const sameCategory = post.primaryCategory
    ? await fetchSummaries(RELATED_IN_CATEGORY, {
        categorySlug: post.primaryCategory.slug,
        limit,
        exclude: post.slug,
      })
    : [];

  const picked = sameCategory
    .filter((p) => p.slug !== post.slug)
    .slice(0, limit);
  if (picked.length >= limit) return picked;

  const taken = new Set([post.slug, ...picked.map((p) => p.slug)]);
  const latest = await fetchSummaries(LATEST_POSTS, {
    limit: limit + taken.size,
  });

  for (const candidate of latest) {
    if (picked.length >= limit) break;
    if (taken.has(candidate.slug)) continue;
    taken.add(candidate.slug);
    picked.push(candidate);
  }

  return picked;
}

/**
 * Get all published posts for the sitemap (slug + modifiedAt only).
 */
export async function getSitemapEntries(): Promise<
  Array<{ slug: string; modifiedAt: string }>
> {
  const query = `
    query GetSitemapEntries {
      blogPosts(where: { status: { equals: "published" } }) {
        slug
        modifiedAt
      }
    }
  `;

  const response = await graphqlRequest<{
    blogPosts: Array<{ slug: string; modifiedAt: string }>;
  }>(query);
  return response.blogPosts ?? [];
}
