import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { useGraphQLClient } from '@app/lib/graphql';
import { GET_CURRENT_USER } from '@app/graphql/queries/users';
import type { CurrentUser } from '@app/graphql/types';

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
  const { userId } = useAuth();
  const client = useGraphQLClient();

  const query = useQuery({
    queryKey: ['currentUser', userId],
    queryFn: async (): Promise<CurrentUser | null> => {
      if (!userId) return null;
      const result = await client.request<GetCurrentUserResult>(GET_CURRENT_USER, { clerkUserId: userId });
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
    enabled: !!userId,
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
