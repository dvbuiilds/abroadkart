/**
 * Internal paths in the WordPress bodies that are not in the export, mapped to where
 * the reader should go. Keys are the path as written in the HTML, with its trailing
 * slash. Add an entry only after a decision on the target.
 */
export const LINK_OVERRIDES: Record<string, string> = {
  // "cost" in accommodation-for-students-in-the-usa. Decided 2026-10-19: the
  // Course & University Selection category.
  "/course-country-university-selection/": "/blogs/category/course-university-selection",
};
