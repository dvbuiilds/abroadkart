import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
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

function isStaticAsset(pathStr: string): boolean {
  return (
    pathStr.includes("_next") ||
    pathStr.includes("__next") ||
    /\.(js|css|woff2?|ico|png|svg|map)$/i.test(pathStr)
  );
}

async function proxyToKeystone(
  req: NextRequest,
  ctx: RouteContext,
) {
  const { path } = await ctx.params;
  const pathStr = path?.join("/") ?? "";

  let token: string | null = null;

  if (isStaticAsset(pathStr)) {
    const { userId, getToken } = await auth();
    if (userId) token = await getToken();
    if (!token) return new Response("Unauthorized", { status: 401 });
  } else {
    const authResult = await getAdminAuth();
    if (authResult.status === "unauthenticated") {
      return new Response("Unauthorized", { status: 401 });
    }
    if (authResult.status === "forbidden") {
      return new Response("Forbidden", { status: 403 });
    }
    token = authResult.token;
  }

  const target = buildTargetUrl(req, path);
  const headers = new Headers(req.headers);
  headers.set("authorization", `Bearer ${token}`);
  headers.delete("host");

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const upstreamResponse = await fetch(target, {
    method: req.method,
    headers,
    body: hasBody ? await req.arrayBuffer() : undefined,
    redirect: "manual",
  });

  const responseHeaders = new Headers(upstreamResponse.headers);
  responseHeaders.delete("Content-Encoding");
  responseHeaders.delete("Transfer-Encoding");

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
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
