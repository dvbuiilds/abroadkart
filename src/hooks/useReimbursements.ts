import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGraphQLClient } from '@app/lib/graphql-client';
import { GET_REIMBURSEMENTS } from '@app/graphql/queries/reimbursements';
import { UPDATE_REIMBURSEMENT } from '@app/graphql/mutations/reimbursements';
import type { ReimbursementListItem } from '@app/graphql/types';

export interface ReimbursementsQueryVariables {
  [key: string]: unknown;
  where: Record<string, unknown>;
  orderBy: Array<Record<string, string>>;
  take?: number;
  skip: number;
}

export interface GetReimbursementsResult {
  reimbursements: ReimbursementListItem[];
  reimbursementsCount: number;
}

export function useReimbursements(variables: ReimbursementsQueryVariables) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ['reimbursements', variables],
    queryFn: async () => client.request<GetReimbursementsResult>(GET_REIMBURSEMENTS, variables),
    staleTime: 60 * 1000,
  });
}

export function useUpdateReimbursement() {
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
      const result = await client.request<{ updateReimbursement: ReimbursementListItem }>(
        UPDATE_REIMBURSEMENT,
        { id, data }
      );
      return result.updateReimbursement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reimbursements'] });
      queryClient.invalidateQueries({ queryKey: ['fulfilment-dashboard'] });
    },
  });
}
