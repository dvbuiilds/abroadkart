import Link from "next/link";
import type { BlogCategory } from "@app/lib/blog/types";

const base =
  "inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 ring-1 ring-inset ring-blue-100";

/**
 * Category label. Links to the archive by default. Use `as="span"` inside a
 * card whose title is already the link, because nested links are invalid.
 */
export function CategoryChip({
  category,
  as = "link",
}: {
  category: Pick<BlogCategory, "name" | "slug">;
  as?: "link" | "span";
}) {
  if (as === "span") {
    return <span className={base}>{category.name}</span>;
  }

  return (
    <Link
      href={`/blogs/category/${category.slug}`}
      className={`${base} transition-colors hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2`}
    >
      {category.name}
    </Link>
  );
}
