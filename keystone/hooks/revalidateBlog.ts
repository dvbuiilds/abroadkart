import { timingSafeEqual } from "crypto";

/**
 * Keystone hook: triggers Next.js cache revalidation via POST /api/revalidate
 * when blog content changes. Fire-and-forget with a short timeout.
 *
 * Requires: REVALIDATE_SECRET and NEXT_INTERNAL_URL env vars.
 * Attached to: BlogPost and BlogCategory afterOperation hooks.
 */
export const revalidateBlogHook = {
  /**
   * `scope: "categories"` is passed by the BlogCategory list. Category items also
   * have a slug, so the scope cannot be inferred from the item.
   */
  async afterOperation(args: {
    item?: Record<string, unknown> | null;
    originalItem?: Record<string, unknown> | null;
    scope?: "categories";
  }): Promise<void> {
    const secret = process.env.REVALIDATE_SECRET;
    const nextUrl = process.env.NEXT_INTERNAL_URL || process.env.PUBLIC_APP_URL;

    if (!secret || !nextUrl) {
      return;
    }

    const endpoint = `${nextUrl.replace(/\/+$/, "")}/api/revalidate`;
    const item = args.item || args.originalItem;
    const slug = item?.slug as string | undefined;
    const previousSlug = args.originalItem?.slug as string | undefined;

    let body: Record<string, unknown> = {};

    if (slug) {
      body.slug = slug;
    }

    if (previousSlug && previousSlug !== slug) {
      body.previousSlug = previousSlug;
    }

    if (args.scope === "categories") {
      body.scope = "categories";
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      // Fire and forget: a failed revalidation must not fail the Keystone write.
      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-revalidate-secret": secret,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
        .catch((error) => console.error("[revalidateBlog] revalidate request failed:", error))
        .finally(() => clearTimeout(timeout));
    } catch (error) {
      console.error("[revalidateBlog] fetch error:", error);
    }
  },
};
