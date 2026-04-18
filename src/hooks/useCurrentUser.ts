import { useQuery } from "@tanstack/react-query";
import { useGraphQLClient } from "@app/lib/graphql-client";
import { GET_CURRENT_USER } from "@app/graphql/queries/users";
import type { CurrentUser } from "@app/graphql/types";
import { authClient } from "@app/lib/auth-client";

export interface GetCurrentUserResult {
  users: Array<{
    id: string;
    email: string | null;
    name: string | null;
    role: string | null;
    tenant: { id: string; name: string | null } | null;
  }>;
}

export function useCurrentUser() {
  const { data: session } = authClient.useSession();
  const authUserId = session?.user?.id;
  const client = useGraphQLClient();

  const query = useQuery({
    queryKey: ["currentUser", authUserId],
    queryFn: async (): Promise<CurrentUser | null> => {
      if (!authUserId) return null;
      const result = await client.request<GetCurrentUserResult>(
        GET_CURRENT_USER,
        { authUserId },
      );
      const user = result.users?.[0];
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenant: user.tenant,
      };
    },
    enabled: !!authUserId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
