"use client";

/**
 * React hook: GraphQL client with better-auth JWT (Keystone verifies via JWKS).
 */

import { ClientError, GraphQLClient, type ResponseMiddleware } from "graphql-request";
import { useMemo, useEffect, useRef } from "react";
import { getKeystoneInternalUrl } from "@app/lib/keystone-url";
import { authClient } from "@app/lib/auth-client";

const devGraphqlResponseMiddleware: ResponseMiddleware = (response) => {
  if (process.env.NODE_ENV !== "development") return;
  if (!(response instanceof Error)) return;
  if (response instanceof ClientError) {
    const q = response.request.query;
    const queryPreview =
      typeof q === "string"
        ? q.replace(/\s+/g, " ").slice(0, 140)
        : "[DocumentNode]";
    console.error("[graphql-client] request failed", {
      httpStatus: response.response.status,
      graphqlMessages: response.response.errors?.map((e) => e.message),
      extensions: response.response.errors?.map(
        (e) => (e as { extensions?: unknown }).extensions,
      ),
      queryPreview,
      variables: response.request.variables,
    });
    return;
  }
  console.error("[graphql-client] request failed (non-GraphQL error)", {
    name: response.name,
    message: response.message,
  });
};

async function fetchAuthJwt(): Promise<string | null> {
  const res = await fetch("/api/auth/token", {
    credentials: "include",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { token?: string };
  return data.token ?? null;
}

/**
 * Hook to get authenticated GraphQL client (Bearer JWT for Keystone).
 */
export function useGraphQLClient() {
  const { data: session } = authClient.useSession();
  const sessionUserId = session?.user?.id;
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    tokenRef.current = null;
  }, [sessionUserId]);

  const client = useMemo(() => {
    // Browser: same-origin proxy avoids cross-origin GraphQL to Keystone (CORS / cookie issues).
    // Server (SSR): call Keystone directly; Node has no "current origin" for relative URLs.
    const endpoint =
      typeof window === "undefined"
        ? `${getKeystoneInternalUrl()}/api/graphql`
        : "/api/graphql";

    return new GraphQLClient(endpoint, {
      responseMiddleware: devGraphqlResponseMiddleware,
      requestMiddleware: async (request) => {
        let token = tokenRef.current;
        if (!token && sessionUserId) {
          token = await fetchAuthJwt();
          tokenRef.current = token;
        }
        return {
          ...request,
          headers: {
            ...request.headers,
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
        };
      },
    });
  }, [sessionUserId]);

  return client;
}
