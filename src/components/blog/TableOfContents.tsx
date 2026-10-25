import { ChevronDown } from "lucide-react";
import type { TocItem } from "@app/lib/blog/types";

const linkBase =
  "-ml-px block border-l-2 border-transparent py-1.5 pl-3 text-sm leading-snug text-gray-600 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 aria-[current=location]:border-blue-600 aria-[current=location]:font-medium aria-[current=location]:text-gray-900";

function TocList({ items, nested = false }: { items: TocItem[]; nested?: boolean }) {
  return (
    <ol className="list-none pl-0">
      {items.map((item) => (
        <li key={item.id}>
          <a href={`#${item.id}`} className={`${linkBase} ${nested ? "pl-6 text-[13px]" : ""}`}>
            {item.text}
          </a>
          {item.children && item.children.length > 0 && (
            <TocList items={item.children} nested />
          )}
        </li>
      ))}
    </ol>
  );
}

/**
 * Table of contents. The sidebar variant is sticky on wide screens; the inline
 * variant is a disclosure for narrow screens. Both are plain anchor links, so
 * they work without JavaScript. TocHighlighter adds the current-section mark.
 */
export function TableOfContents({
  items,
  variant,
}: {
  items: TocItem[];
  variant: "sidebar" | "inline";
}) {
  if (items.length === 0) return null;

  if (variant === "inline") {
    return (
      <details className="group rounded-xl border border-gray-200 bg-gray-50/60">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 [&::-webkit-details-marker]:hidden">
          <span>On this page · {items.length} sections</span>
          <ChevronDown
            aria-hidden="true"
            className="size-4 text-gray-500 transition-transform duration-200 group-open:rotate-180"
          />
        </summary>
        <nav aria-label="Table of contents" className="px-4 pb-4">
          <TocList items={items} />
        </nav>
      </details>
    );
  }

  return (
    <aside className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        On this page
      </p>
      <nav aria-label="Table of contents">
        <TocList items={items} />
      </nav>
      <a
        href="#top"
        className="mt-4 inline-block pl-3 text-xs font-medium text-gray-500 transition-colors hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        ↑ Back to top
      </a>
    </aside>
  );
}
