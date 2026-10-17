import Link from "next/link";
import type { BlogCategory } from "@app/lib/blog/types";

const chipBase =
  "shrink-0 snap-start whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2";
const chipActive = "bg-gray-900 text-white";
const chipIdle = "border border-gray-200 bg-white text-gray-700 hover:border-gray-400";

/**
 * Horizontal row of category filters. Plain links, so it works without JS.
 * The row scrolls sideways on narrow screens.
 */
export function CategoryChips({
  categories,
  activeSlug,
}: {
  categories: BlogCategory[];
  activeSlug?: string;
}) {
  return (
    <nav aria-label="Blog categories">
      <ul className="flex list-none snap-x gap-2 overflow-x-auto pl-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <li>
          <Link
            href="/blogs"
            aria-current={activeSlug ? undefined : "page"}
            className={`${chipBase} ${activeSlug ? chipIdle : chipActive}`}
          >
            All
          </Link>
        </li>
        {categories.map((category) => {
          const active = category.slug === activeSlug;
          return (
            <li key={category.slug}>
              <Link
                href={`/blogs/category/${category.slug}`}
                aria-current={active ? "page" : undefined}
                className={`${chipBase} ${active ? chipActive : chipIdle} inline-flex items-center gap-2`}
              >
                {category.name}
                {category.postCount !== undefined && (
                  <span className={`text-xs ${active ? "text-white/60" : "text-gray-400"}`}>
                    {category.postCount}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
