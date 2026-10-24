/** Blog post and category types for the Next.js frontend. */

export interface Heading {
  level: number;
  text: string;
  id: string;
}

export interface Faq {
  order: number;
  question: string;
  answer: string;
}

export interface TocItem {
  level: number;
  text: string;
  id: string;
  children?: TocItem[];
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  /** Published posts in this category. Set by getCategories(). */
  postCount?: number;
}

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: Date;
  modifiedAt: Date;
  authorName?: string;
  featuredImageUrl?: string;
  featuredImageAlt?: string;
  featuredImageWidth?: number;
  featuredImageHeight?: number;
  primaryCategory?: BlogCategory;
  readingTimeMinutes?: number;
  wordCount?: number;
}

export interface BlogPost extends BlogPostSummary {
  status: "draft" | "published";
  contentHtml: string;
  headings: Heading[];
  faqs: Faq[];
  metaTitle?: string;
  metaDescription?: string;
  focusKeywords?: string[];
  tags?: string[];
  categories: BlogCategory[];
}
