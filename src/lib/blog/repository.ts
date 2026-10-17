import { getKeystoneInternalUrl } from "@app/lib/keystone-url";
import type { BlogPost, BlogPostSummary, BlogCategory } from "./types";

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

  try {
    const response = await graphqlRequest<{ blogPosts: BlogPost[] }>(
      query,
      { slug },
      [`blog:${slug}`, "blog:list"]
    );
    return response.blogPosts?.[0] ?? null;
  } catch (error) {
    throw error;
  }
}

interface PostSummariesResult {
  items: BlogPostSummary[];
  totalCount: number;
}

/**
 * Fetch blog post summaries with pagination.
 * Does NOT include contentHtml.
 */
export async function getPostSummaries({
  page = 1,
  pageSize = 10,
  categorySlug,
}: {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
}): Promise<PostSummariesResult> {
  const skip = (page - 1) * pageSize;

  let whereClause = `where: { status: { equals: "published" }`;
  if (categorySlug) {
    whereClause += `, OR: [
      { primaryCategory: { slug: { equals: "${categorySlug}" } } }
      { categories: { some: { slug: { equals: "${categorySlug}" } } } }
    ]`;
  }
  whereClause += " }";

  const query = `
    query GetPostSummaries($skip: Int!, $take: Int!, $categorySlug: String) {
      blogPostsConnection(
        ${whereClause}
        orderBy: { publishedAt: desc }
        skip: $skip
        take: $take
      ) {
        edges {
          node {
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
          }
        }
        pageInfo {
          hasNextPage
        }
        totalCount
      }
    }
  `;

  const response = await graphqlRequest<{
    blogPostsConnection: {
      edges: Array<{ node: BlogPostSummary }>;
      pageInfo: { hasNextPage: boolean };
      totalCount: number;
    };
  }>(query, { skip, take: pageSize, categorySlug });

  return {
    items: response.blogPostsConnection.edges.map((e) => e.node),
    totalCount: response.blogPostsConnection.totalCount,
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
 * Fetch all blog categories.
 */
export async function getCategories(): Promise<BlogCategory[]> {
  const query = `
    query GetCategories {
      blogCategories {
        id
        name
        slug
        description
      }
    }
  `;

  const response = await graphqlRequest<{ blogCategories: BlogCategory[] }>(query);
  return response.blogCategories ?? [];
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

/**
 * Get related posts from the same primary category.
 * Does NOT include contentHtml.
 */
export async function getRelatedPosts(
  post: { primaryCategory?: BlogCategory },
  limit = 3
): Promise<BlogPostSummary[]> {
  if (!post.primaryCategory) {
    return [];
  }

  const query = `
    query GetRelatedPosts($categorySlug: String!, $limit: Int!) {
      blogPosts(
        where: {
          status: { equals: "published" }
          primaryCategory: { slug: { equals: $categorySlug } }
        }
        orderBy: { publishedAt: desc }
        take: $limit
      ) {
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
      }
    }
  `;

  const response = await graphqlRequest<{ blogPosts: BlogPostSummary[] }>(query, {
    categorySlug: post.primaryCategory.slug,
    limit,
  });
  return response.blogPosts ?? [];
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
