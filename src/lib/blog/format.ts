/**
 * Date helpers for the blog. Everything is pinned to the Indian calendar so a
 * post published at 00:30 IST shows the IST day, whatever timezone the server
 * or the reader is in.
 */

const TIME_ZONE = "Asia/Kolkata";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: TIME_ZONE,
});

/** "12 Jul 2024" */
export function formatPostDate(date: Date): string {
  return dateFormatter.format(date);
}

/** True when both instants fall on the same calendar day in India. */
export function isSameIstDay(a: Date, b: Date): boolean {
  return dayKeyFormatter.format(a) === dayKeyFormatter.format(b);
}
