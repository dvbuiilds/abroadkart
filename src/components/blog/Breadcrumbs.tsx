import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  /** Omit for the current page. */
  href?: string;
}

/**
 * Breadcrumb trail. The last crumb is the current page: it is not a link, and
 * it is hidden on small screens to keep the hero to one line.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-600">
      <ol className="flex list-none flex-wrap items-center gap-y-1 pl-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              className={`items-center gap-1.5 ${isLast ? "hidden min-w-0 sm:flex" : "flex"}`}
            >
              {index > 0 && (
                <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 text-gray-400" />
              )}
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? "truncate max-w-[28ch]" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="rounded-sm transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
