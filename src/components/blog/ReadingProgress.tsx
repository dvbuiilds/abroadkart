/**
 * Thin progress bar under the navbar. The width is driven by scroll position in
 * CSS (see .reading-progress in styles/blog.css), so this needs no JavaScript.
 * Browsers without scroll-driven animations show nothing.
 */
export function ReadingProgress() {
  return (
    <div
      aria-hidden="true"
      className="reading-progress pointer-events-none fixed inset-x-0 top-16 z-40 h-[3px] origin-left bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400"
    />
  );
}
