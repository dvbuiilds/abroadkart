import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { BlogPostSummary } from "@app/lib/blog/types";
import { formatPostDate } from "@app/lib/blog/format";

interface BlogCardProps {
  post: BlogPostSummary;
  variant?: "default" | "featured";
  /** Heading level for the title. Use 2 when the card sits directly under the page H1. */
  headingLevel?: 2 | 3;
}

/**
 * A post tile for index and related lists. The whole card is one link: the
 * title link is stretched over the card with an absolutely positioned pseudo
 * element, so there are no nested interactive elements.
 */
export function BlogCard({ post, variant = "default", headingLevel = 3 }: BlogCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const featured = variant === "featured";
  const alt = post.featuredImageAlt || post.title;

  return (
    <article
      className={[
        "group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 focus-within:ring-2 focus-within:ring-blue-600",
        "motion-safe:hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-900/5",
        featured ? "md:grid md:grid-cols-[1.15fr_1fr]" : "",
      ].join(" ")}
    >
      <div className="relative aspect-[1.91/1] overflow-hidden bg-gradient-to-br from-blue-50 to-gray-100">
        {post.featuredImageUrl ? (
          <Image
            src={post.featuredImageUrl}
            alt={alt}
            width={post.featuredImageWidth}
            height={post.featuredImageHeight}
            sizes={
              featured
                ? "(min-width: 768px) 55vw, 100vw"
                : "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            }
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen aria-hidden="true" className="size-10 text-blue-300" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
        {post.primaryCategory && (
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            {post.primaryCategory.name}
          </span>
        )}

        <Heading
          className={[
            "font-semibold tracking-tight text-gray-900 transition-colors group-hover:text-blue-700",
            featured ? "text-2xl leading-tight md:text-3xl" : "text-lg leading-snug line-clamp-2",
          ].join(" ")}
        >
          <Link
            href={`/blogs/${post.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {post.title}
          </Link>
        </Heading>

        <p className={`text-sm leading-relaxed text-gray-600 ${featured ? "line-clamp-3" : "line-clamp-2"}`}>
          {post.excerpt}
        </p>

        <p className="mt-auto flex flex-wrap items-center gap-x-2 pt-2 text-xs text-gray-500">
          <time dateTime={post.publishedAt.toISOString()}>{formatPostDate(post.publishedAt)}</time>
          {post.readingTimeMinutes !== undefined && (
            <>
              <span aria-hidden="true">·</span>
              <span>{post.readingTimeMinutes} min read</span>
            </>
          )}
          {featured && (
            <span className="ml-auto font-medium text-blue-700 transition group-hover:translate-x-0.5">
              Read article
            </span>
          )}
        </p>
      </div>
    </article>
  );
}
