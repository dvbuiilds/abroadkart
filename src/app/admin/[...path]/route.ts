import { NextRequest } from "next/server";
import { getAdminAuth } from "@app/lib/admin-auth";

const KEYSTONE_URL =
  process.env.NEXT_PUBLIC_KEYSTONE_URL || "http://localhost:3001";
type RouteContext = { params: Promise<{ path?: string[] }> };

function buildTargetUrl(req: NextRequest, path: string[] | undefined): URL {
  const pathname = path && path.length ? `/admin/${path.join("/")}` : "/admin";
  const target = new URL(pathname, KEYSTONE_URL);
  target.search = req.nextUrl.search;
  return target;
}

async function proxyToKeystone(
  req: NextRequest,
  ctx: RouteContext,
) {
  const authResult = await getAdminAuth();

  if (authResult.status === "unauthenticated") {
    return new Response("Unauthorized", { status: 401 });
  }

  if (authResult.status === "forbidden") {
    return new Response("Forbidden", { status: 403 });
  }

  const { path } = await ctx.params;
  const target = buildTargetUrl(req, path);
  const headers = new Headers(req.headers);
  headers.set("authorization", `Bearer ${authResult.token}`);
  headers.delete("host");

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const upstreamResponse = await fetch(target, {
    method: req.method,
    headers,
    body: hasBody ? await req.arrayBuffer() : undefined,
    redirect: "manual",
  });

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: upstreamResponse.headers,
  });
}

export async function GET(
  req: NextRequest,
  ctx: RouteContext,
) {
  return proxyToKeystone(req, ctx);
}

export async function POST(
  req: NextRequest,
  ctx: RouteContext,
) {
  return proxyToKeystone(req, ctx);
}

export async function PUT(
  req: NextRequest,
  ctx: RouteContext,
) {
  return proxyToKeystone(req, ctx);
}

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext,
) {
  return proxyToKeystone(req, ctx);
}

export async function DELETE(
  req: NextRequest,
  ctx: RouteContext,
) {
  return proxyToKeystone(req, ctx);
}

export async function HEAD(
  req: NextRequest,
  ctx: RouteContext,
) {
  return proxyToKeystone(req, ctx);
}

export async function OPTIONS(
  req: NextRequest,
  ctx: RouteContext,
) {
  return proxyToKeystone(req, ctx);
}
