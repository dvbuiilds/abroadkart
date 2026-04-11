/**
 * GraphQL client setup with Clerk authentication
 */

import { GraphQLClient } from "graphql-request";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";
import { getKeystoneBaseUrl } from "@app/lib/keystone-url";

/**
 * Hook to get authenticated GraphQL client
 */
export function useGraphQLClient() {
  const { getToken } = useAuth();

  const client = useMemo(() => {
    const base = getKeystoneBaseUrl();
    return new GraphQLClient(`${base}/api/graphql`, {
      requestMiddleware: async (request) => {
        const token = await getToken();
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
  }, []);

  return client;
}

/**
 * Create a GraphQL client (for server-side usage)
 */
export function createGraphQLClient(token?: string) {
  const base = getKeystoneBaseUrl();
  return new GraphQLClient(`${base}/api/graphql`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });
}
