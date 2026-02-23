import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";

const KEYSTONE_URL =
  process.env.NEXT_PUBLIC_KEYSTONE_URL || "http://localhost:3001";

export async function GET(req: NextRequest) {
  return proxyGraphQL(req);
}

export async function POST(req: NextRequest) {
  return proxyGraphQL(req);
}

async function proxyGraphQL(req: NextRequest) {
  try {
    const { getToken } = await auth();
    const token = await getToken();

    const target = new URL("/api/graphql", KEYSTONE_URL);
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
