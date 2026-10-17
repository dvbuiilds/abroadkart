import { Clock } from "lucide-react";
import { formatPostDate, isSameIstDay } from "@app/lib/blog/format";

const Dot = () => (
  <span aria-hidden="true" className="text-gray-300">
    ·
  </span>
);

/**
 * Byline row: author, publish date, updated date (only when it differs), and
 * reading time. The author is plain text; the dates are <time> elements.
 */
export function PostMeta({
  authorName,
  publishedAt,
  modifiedAt,
  readingTimeMinutes,
}: {
  authorName?: string;
  publishedAt: Date;
  modifiedAt: Date;
  readingTimeMinutes?: number;
}) {
  const showUpdated = !isSameIstDay(publishedAt, modifiedAt);

  return (
    <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-gray-600">
      {authorName && (
        <>
          <span>By {authorName}</span>
          <Dot />
        </>
      )}
      <span>
        Published{" "}
        <time dateTime={publishedAt.toISOString()}>{formatPostDate(publishedAt)}</time>
      </span>
      {showUpdated && (
        <>
          <Dot />
          <span>
            Updated{" "}
            <time dateTime={modifiedAt.toISOString()}>{formatPostDate(modifiedAt)}</time>
          </span>
        </>
      )}
      {readingTimeMinutes !== undefined && (
        <>
          <Dot />
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden="true" className="size-3.5" />
            {readingTimeMinutes} min read
          </span>
        </>
      )}
    </p>
  );
}
