import type { BlogCategory, BlogPostSummary } from "@app/lib/blog/types";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";
import { BlogCard } from "./BlogCard";
import { CategoryChips } from "./CategoryChips";
import { Pagination } from "./Pagination";

interface BlogListingPageProps {
  eyebrow: string;
  title: string;
  intro?: string;
  breadcrumbs: Crumb[];
  categories: BlogCategory[];
  activeSlug?: string;
  items: BlogPostSummary[];
  page: number;
  totalPages: number;
  basePath: string;
}

/**
 * Shared layout for the blog index and category archives: hero, category
 * chips, a featured post on page 1, the card grid, and pagination.
 */
export function BlogListingPage({
  eyebrow,
  title,
  intro,
  breadcrumbs,
  categories,
  activeSlug,
  items,
  page,
  totalPages,
  basePath,
}: BlogListingPageProps) {
  const showFeatured = page === 1 && items.length > 0;
  const featured = showFeatured ? items[0] : undefined;
  const grid = showFeatured ? items.slice(1) : items;

  return (
    <>
      <header className="bg-gradient-to-b from-blue-50/60 to-white pt-28 pb-12 md:pt-32 md:pb-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="flex justify-center">
            <Breadcrumbs items={breadcrumbs} />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            {eyebrow}
          </p>
          {/* Slots sized to the longest title (2 lines) and intro (5 lines on phones,
              3 wider) so the chip bar does not move between categories. */}
          <h1 className="mt-3 min-h-[2lh] text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-gray-900 md:text-6xl">
            {title}
          </h1>
          {intro && (
            <p className="mx-auto mt-5 min-h-[5lh] max-w-2xl text-lg leading-relaxed text-gray-600 md:min-h-[3lh]">
              {intro}
            </p>
          )}
        </div>
      </header>

      <div className="sticky top-16 z-30 border-b border-gray-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <CategoryChips categories={categories} activeSlug={activeSlug} />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-12 pb-24 sm:px-6">
        {featured && (
          <section aria-label="Featured article" className="mb-14">
            <BlogCard post={featured} variant="featured" headingLevel={2} />
          </section>
        )}

        <h2
          className={
            showFeatured
              ? "mb-8 text-2xl font-bold tracking-tight text-gray-900"
              : "sr-only"
          }
        >
          Latest articles
        </h2>

        {grid.length > 0 ? (
          <ul className="grid list-none gap-x-6 gap-y-10 pl-0 sm:grid-cols-2 lg:grid-cols-3">
            {grid.map((post) => (
              <li key={post.slug}>
                <BlogCard post={post} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-16 text-center text-gray-600">No articles here yet. Check back soon.</p>
        )}

        <div className="mt-16">
          <Pagination page={page} totalPages={totalPages} basePath={basePath} />
        </div>
      </div>
    </>
  );
}
