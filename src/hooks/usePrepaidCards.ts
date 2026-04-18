import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGraphQLClient } from '@app/lib/graphql-client';
import { GET_PREPAID_CARDS } from '@app/graphql/queries/prepaid-cards';
import { CREATE_PREPAID_CARD, UPDATE_PREPAID_CARD } from '@app/graphql/mutations/prepaid-cards';
import type { PrepaidCardListItem } from '@app/graphql/types';

export interface PrepaidCardsQueryVariables {
  [key: string]: unknown;
  where: Record<string, unknown>;
  orderBy: Array<Record<string, string>>;
  take?: number;
  skip: number;
}

export interface GetPrepaidCardsResult {
  prepaidCards: PrepaidCardListItem[];
  prepaidCardsCount: number;
}

export function usePrepaidCards(variables: PrepaidCardsQueryVariables) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ['prepaid-cards', variables],
    queryFn: async () => client.request<GetPrepaidCardsResult>(GET_PREPAID_CARDS, variables),
    staleTime: 60 * 1000,
  });
}

export function useCreatePrepaidCard() {
  const client = useGraphQLClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const result = await client.request<{ createPrepaidCard: PrepaidCardListItem }>(
        CREATE_PREPAID_CARD,
        { data }
      );
      return result.createPrepaidCard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prepaid-cards'] });
    },
  });
}

export function useUpdatePrepaidCard() {
  const client = useGraphQLClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Record<string, unknown>;
    }) => {
      const result = await client.request<{ updatePrepaidCard: PrepaidCardListItem }>(
        UPDATE_PREPAID_CARD,
        { id, data }
      );
      return result.updatePrepaidCard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prepaid-cards'] });
    },
  });
}
