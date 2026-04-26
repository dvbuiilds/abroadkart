import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@app/lib/admin-auth";
import { getBetterAuthJwtFromNextRequest } from "@app/lib/auth-server";
import {
  getKeystoneBaseUrl,
  getKeystoneInternalUrl,
  keystoneSelfProxyErrorResponse,
} from "@app/lib/keystone-url";

type RouteContext = { params: Promise<{ path?: string[] }> };

function buildTargetUrl(req: NextRequest, path: string[] | undefined): URL {
  const pathname = path && path.length ? `/admin/${path.join("/")}` : "/admin";
  const target = new URL(pathname, `${getKeystoneInternalUrl()}/`);
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

async function proxyToKeystone(req: NextRequest, ctx: RouteContext) {
  const misconfig = keystoneSelfProxyErrorResponse(req.nextUrl.origin);
  if (misconfig) return misconfig;

  const { path } = await ctx.params;
  const pathStr = path?.join("/") ?? "";

  let token: string | null = null;

  if (isStaticAsset(pathStr)) {
    token = await getBetterAuthJwtFromNextRequest(req);
    if (!token) return new Response("Unauthorized", { status: 401 });
  } else {
    const authResult = await getAdminAuth();
    if (authResult.status === "unauthenticated") {
      return new Response("Unauthorized", { status: 401 });
    }
    if (authResult.status === "forbidden") {
      return new Response("Forbidden", { status: 403 });
    }
    if (req.method === "GET" || req.method === "HEAD") {
      const base = getKeystoneBaseUrl();
      const suffix = pathStr ? `/${pathStr}` : "";
      const dest = new URL(`/admin${suffix}`, `${base}/`);
      dest.search = req.nextUrl.search;
      return NextResponse.redirect(dest.toString(), 307);
    }
    token = authResult.token;
  }

  const target = buildTargetUrl(req, path);
  const headers = new Headers(req.headers);
  headers.set("authorization", `Bearer ${token as string}`);
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

export async function GET(req: NextRequest, ctx: RouteContext) {
  return proxyToKeystone(req, ctx);
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  return proxyToKeystone(req, ctx);
}

export async function PUT(req: NextRequest, ctx: RouteContext) {
  return proxyToKeystone(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return proxyToKeystone(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return proxyToKeystone(req, ctx);
}

export async function HEAD(req: NextRequest, ctx: RouteContext) {
  return proxyToKeystone(req, ctx);
}

export async function OPTIONS(req: NextRequest, ctx: RouteContext) {
  return proxyToKeystone(req, ctx);
}
