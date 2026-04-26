/**
 * GraphQL client factory for server-side usage (no React hooks).
 */

import { GraphQLClient } from "graphql-request";
import { getKeystoneInternalUrl } from "@app/lib/keystone-url";

/**
 * Create a GraphQL client (for server-side usage)
 */
export function createGraphQLClient(token?: string) {
  const base = getKeystoneInternalUrl();
  return new GraphQLClient(`${base}/api/graphql`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });
}
