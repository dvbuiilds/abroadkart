import type { BlogPostInput } from "./types";

/** A database row as the import reads it back: relations come as `{ slug }` objects. */
type ExistingPost = {
  primaryCategory: { slug: string } | null;
  categories: { slug: string }[];
};

/**
 * Scalar part of a post, in a form that compares equal between a database row and
 * the mapped input. Relations, the database `id` and the mapper's category slugs are
 * removed, because a row stores categories as relations, not as those fields.
 */
export function comparable(p: Record<string, unknown>): string {
  const out: Record<string, unknown> = { ...p };
  for (const k of ["id", "primaryCategory", "categories", "primaryCategorySlug", "categorySlugs"]) {
    delete out[k];
  }
  for (const k of ["publishedAt", "modifiedAt"]) {
    out[k] = new Date(out[k] as string | Date).toISOString();
  }
  for (const k of ["featuredImageWidth", "featuredImageHeight"]) out[k] = out[k] ?? null;
  return JSON.stringify(out, Object.keys(out).sort());
}

/** True when the row's primary and secondary categories match the input, ignoring order. */
export function sameCategories(existing: ExistingPost, input: BlogPostInput): boolean {
  return (
    (existing.primaryCategory?.slug ?? null) === input.primaryCategorySlug &&
    JSON.stringify(existing.categories.map((c) => c.slug).sort()) ===
      JSON.stringify([...input.categorySlugs].sort())
  );
}
