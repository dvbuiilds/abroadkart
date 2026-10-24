import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildPageList } from "@app/lib/blog/pagination";

const control =
  "inline-flex h-10 items-center justify-center gap-1 rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2";
const pageLink = "min-w-[2.5rem] text-gray-700 hover:bg-gray-100";
const pageCurrent = "min-w-[2.5rem] bg-gray-900 text-white";
const disabled = "text-gray-300";

/**
 * Numbered pager. Links are plain hrefs so the pages crawl without JS.
 * Page 1 links to the bare base path, never to ?page=1.
 */
export function Pagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (n: number) => (n === 1 ? basePath : `${basePath}?page=${n}`);
  const items = buildPageList(page, totalPages);

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={`${control} ${pageLink}`}>
          <ChevronLeft aria-hidden="true" className="size-4" />
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={`${control} ${disabled}`}>
          <ChevronLeft aria-hidden="true" className="size-4" />
          Previous
        </span>
      )}

      <ol className="flex list-none items-center gap-1 pl-0">
        {items.map((item, index) =>
          item === "…" ? (
            <li key={`gap-${index}`}>
              <span aria-hidden="true" className="px-2 text-gray-400">
                …
              </span>
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefFor(item)}
                aria-current={item === page ? "page" : undefined}
                className={`${control} ${item === page ? pageCurrent : pageLink}`}
              >
                {item}
              </Link>
            </li>
          )
        )}
      </ol>

      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} rel="next" className={`${control} ${pageLink}`}>
          Next
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span aria-disabled="true" className={`${control} ${disabled}`}>
          Next
          <ChevronRight aria-hidden="true" className="size-4" />
        </span>
      )}
    </nav>
  );
}
