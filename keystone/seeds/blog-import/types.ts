/** Shapes of the WordPress export files in /output (only the fields the import reads). */

export type WpTerm = { term_id: string; name: string; slug: string; description?: string };

export type WpRendition = { name: string; sourcePath: string };

export type WpFeaturedImage = {
  alt: string;
  width: number;
  height: number;
  stagedPath: string;
  mimeType: string;
  sourcePath: string;
  renditions: WpRendition[];
};

export type WpPost = {
  wpPostId: string;
  slug: string;
  title: string;
  status: "published" | "draft";
  publishedAt: string;
  updatedAt: string;
  author: { name: string; email: string };
  excerpt: string;
  contentHtml: string;
  headings: { level: number; text: string; id: string }[];
  faqs: { order: number; question: string; answer: string }[];
  featuredImage: WpFeaturedImage | null;
  primaryCategory: WpTerm | null;
  categories: WpTerm[];
  tags: WpTerm[];
  seo: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    focusKeywords?: string[] | null;
  };
  stats: { wordCount: number; readingTimeMinutes: number };
};

export type WpCategory = { termId: string; name: string; slug: string; description: string };

export type WpRedirect = { source: string; destination: string; permanent: boolean };

export type ImageManifestRow = {
  slug: string;
  sourcePath: string;
  stagedPath: string;
  mimeType: string;
};

export type NextRedirect = { source: string; destination: string; permanent: true };

export type BlogPostInput = {
  postId: number;
  slug: string;
  title: string;
  status: "published" | "draft";
  publishedAt: Date;
  modifiedAt: Date;
  authorName: string;
  excerpt: string;
  contentHtml: string;
  headings: WpPost["headings"];
  faqs: WpPost["faqs"];
  tags: string[];
  featuredImageUrl: string;
  featuredImageAlt: string;
  featuredImageWidth: number | null;
  featuredImageHeight: number | null;
  metaTitle: string;
  metaDescription: string;
  focusKeywords: string[];
  wordCount: number;
  readingTimeMinutes: number;
  primaryCategorySlug: string | null;
  categorySlugs: string[];
};
