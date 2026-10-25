import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

/**
 * POST /api/revalidate
 * Revalidates blog cache tags when called with the correct secret.
 *
 * Header: x-revalidate-secret (compared in constant time)
 * Body: { slug?, previousSlug?, scope? }
 *   slug: slug to revalidate (revalidates blog:<slug>)
 *   previousSlug: old slug if it was renamed (revalidates blog:<previousSlug>)
 *   scope: "categories" to also revalidate blog:categories
 *
 * Always revalidates blog:list.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = request.headers.get("x-revalidate-secret");
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected || !secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const a = Buffer.from(secret);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slug = body.slug as string | undefined;
  const previousSlug = body.previousSlug as string | undefined;
  const scope = body.scope as string | undefined;

  const tags: string[] = ["blog:list"];

  if (slug) {
    tags.push(`blog:${slug}`);
  }
  if (previousSlug) {
    tags.push(`blog:${previousSlug}`);
  }
  if (scope === "categories") {
    tags.push("blog:categories");
  }

  for (const tag of tags) {
    revalidateTag(tag);
  }

  return NextResponse.json({ revalidated: tags, now: Date.now() });
}
