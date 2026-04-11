import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getKeystoneBaseUrl,
  keystoneSelfProxyErrorResponse,
} from "@app/lib/keystone-url";

export async function GET(req: NextRequest) {
  return proxyGraphQL(req);
}

export async function POST(req: NextRequest) {
  return proxyGraphQL(req);
}

async function proxyGraphQL(req: NextRequest) {
  const misconfig = keystoneSelfProxyErrorResponse(req.nextUrl.origin);
  if (misconfig) return misconfig;

  try {
    const { getToken } = await auth();
    const token = await getToken();

    const base = getKeystoneBaseUrl();
    const target = new URL("/api/graphql", `${base}/`);
    target.search = req.nextUrl.search;

    const headers = new Headers(req.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.delete("host");

    const hasBody = req.method === "POST";
    const upstreamResponse = await fetch(target.toString(), {
      method: req.method,
      headers,
      body: hasBody ? await req.arrayBuffer() : undefined,
    });

    if (
      process.env.NODE_ENV === "development" &&
      upstreamResponse.status >= 400
    ) {
      console.warn(
        "[graphql proxy] upstream",
        upstreamResponse.status,
        target.toString(),
      );
    }

    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.delete("Content-Encoding");
    responseHeaders.delete("Transfer-Encoding");

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error("[graphql proxy]", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
