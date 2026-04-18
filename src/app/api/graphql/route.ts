import { NextRequest } from "next/server";
import {
  getKeystoneBaseUrl,
  keystoneSelfProxyErrorResponse,
} from "@app/lib/keystone-url";
import { getBetterAuthJwtFromNextRequest } from "@app/lib/auth-server";

export async function GET(req: NextRequest) {
  return proxyGraphQL(req);
}

export async function POST(req: NextRequest) {
  return proxyGraphQL(req);
}

/** Node fetch failures often nest ECONNREFUSED on `error.cause`. */
function getNestedErrnoCode(err: unknown): string | undefined {
  let cur: unknown = err;
  for (let i = 0; i < 4 && cur && typeof cur === "object"; i++) {
    const code = (cur as { code?: string }).code;
    if (typeof code === "string") return code;
    cur = (cur as Error).cause;
  }
  return undefined;
}

async function proxyGraphQL(req: NextRequest) {
  const misconfig = keystoneSelfProxyErrorResponse(req.nextUrl.origin);
  if (misconfig) return misconfig;

  let token: string | null = null;
  try {
    token = await getBetterAuthJwtFromNextRequest(req);

    const base = getKeystoneBaseUrl();
    const target = new URL("/api/graphql", `${base}/`);
    target.search = req.nextUrl.search;

    const headers = new Headers(req.headers);
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    headers.delete("host");

    const hasBody = req.method === "POST";
    if (process.env.NODE_ENV === "development") {
      console.info("[graphql proxy] forwarding to Keystone", {
        method: req.method,
        upstream: target.toString(),
        hasBearer: !!token,
      });
    }

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
    const base = getKeystoneBaseUrl();
    const code = getNestedErrnoCode(err);
    const unreachable = code === "ECONNREFUSED" || code === "ENOTFOUND";

    const cause =
      err instanceof Error && err.cause instanceof Error
        ? { name: err.cause.name, message: err.cause.message }
        : err instanceof Error && err.cause && typeof err.cause === "object"
          ? { detail: String((err.cause as { code?: string }).code ?? err.cause) }
          : undefined;

    console.error(
      "[graphql proxy]",
      unreachable ? "upstream unreachable" : "proxy error",
      {
        upstreamBase: base,
        upstreamGraphql: new URL("/api/graphql", `${base}/`).toString(),
        errnoCode: code ?? "unknown",
        hadBearer: !!token?.length,
        cause,
      },
      err,
    );
    if (process.env.NODE_ENV === "development" && unreachable) {
      console.error(
        `[graphql proxy] Start Keystone so this URL is listening (e.g. cd keystone && yarn dev): ${base}`,
      );
    }

    const message = unreachable
      ? `Keystone GraphQL is unreachable at ${base}. Is Keystone running?`
      : "Failed to proxy GraphQL to Keystone.";

    return new Response(
      JSON.stringify({
        errors: [{ message, extensions: { code: "KEYSTONE_UNREACHABLE" } }],
      }),
      {
        status: unreachable ? 503 : 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
