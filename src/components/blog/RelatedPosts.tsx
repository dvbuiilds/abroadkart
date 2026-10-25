import Link from "next/link";
import type { BlogCategory, BlogPostSummary } from "@app/lib/blog/types";
import { BlogCard } from "./BlogCard";

/**
 * "Keep reading" band under an article. Hidden entirely when there is nothing to show.
 */
export function RelatedPosts({
  posts,
  category,
}: {
  posts: BlogPostSummary[];
  category?: Pick<BlogCategory, "name" | "slug">;
}) {
  if (posts.length === 0) return null;

  return (
    <section
      aria-labelledby="related-heading"
      className="border-t border-gray-100 bg-gray-50 py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2
            id="related-heading"
            className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl"
          >
            Keep reading
          </h2>
          {category && (
            <Link
              href={`/blogs/category/${category.slug}`}
              className="text-sm font-semibold text-blue-700 hover:text-blue-800 hover:underline"
            >
              View all in {category.name} →
            </Link>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
