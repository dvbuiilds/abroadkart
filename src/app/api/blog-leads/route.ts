import { NextRequest, NextResponse } from "next/server";
import { createBlogLead } from "@app/lib/blog/leads";
import { createRateLimiter } from "@app/lib/rate-limit";
import { blogLeadPayloadSchema } from "@app/lib/validations/blog-lead";

/** Five submissions per client per ten minutes. */
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });

function clientIp(request: NextRequest): string {
  const cloudflare = request.headers.get("cf-connecting-ip");
  if (cloudflare) return cloudflare;
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

const blank = (value: string | undefined) => (value && value.trim() ? value.trim() : undefined);

/**
 * POST /api/blog-leads
 *
 * 429  rate limit exceeded
 * 400  not JSON, or the payload fails validation
 * 200  honeypot filled: accepted silently, nothing stored
 * 201  stored
 * 502  Keystone refused the write
 */
export async function POST(request: NextRequest) {
  const limit = limiter.check(clientIp(request));
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const honeypot = (body as { website?: unknown } | null)?.website;
  if (typeof honeypot === "string" && honeypot.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const parsed = blogLeadPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const lead = parsed.data;
  try {
    await createBlogLead({
      email: lead.email,
      name: blank(lead.name),
      phone: blank(lead.phone),
      message: blank(lead.message),
      sourceSlug: blank(lead.sourceSlug),
      sourceUrl: blank(lead.sourceUrl),
      utmSource: blank(lead.utmSource),
      utmMedium: blank(lead.utmMedium),
      utmCampaign: blank(lead.utmCampaign),
    });
  } catch (error) {
    // Log the failure without the lead's contact details.
    console.error("blog lead write failed", error instanceof Error ? error.name : "unknown");
    return NextResponse.json({ ok: false, error: "store_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, email: lead.email }, { status: 201 });
}
