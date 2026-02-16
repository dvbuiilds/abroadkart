/**
 * GraphQL client setup with Clerk authentication
 */

import { GraphQLClient } from "graphql-request";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

const KEYSTONE_URL =
  process.env.NEXT_PUBLIC_KEYSTONE_URL || "http://localhost:3001";

/**
 * Hook to get authenticated GraphQL client
 */
export function useGraphQLClient() {
  const { getToken } = useAuth();

  const client = useMemo(() => {
    return new GraphQLClient(`${KEYSTONE_URL}/api/graphql`, {
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
  return new GraphQLClient(`${KEYSTONE_URL}/api/graphql`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });
}
