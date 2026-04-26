import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGraphQLClient } from '@app/lib/graphql-client';
import {
  GET_FULFILMENT_LOANS,
  GET_FULFILMENT_LOAN,
  GET_ACTIVITY_LOGS_FOR_LOAN,
} from '@app/graphql/queries/fulfilment-loans';
import { UPDATE_LOAN_STATUS, ASSIGN_FULFILMENT_EXEC } from '@app/graphql/mutations/fulfilment-loans';
import type { ActivityLogItem, LoanApplication, LoanListItem } from '@app/graphql/types';

export interface FulfilmentLoansQueryVariables {
  [key: string]: unknown;
  where: Record<string, unknown>;
  orderBy: Array<Record<string, string>>;
  take?: number;
  skip: number;
}

export interface GetFulfilmentLoansResult {
  loanApplications: LoanListItem[];
  loanApplicationsCount: number;
}

export function useFulfilmentLoans(variables: FulfilmentLoansQueryVariables) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ['fulfilment-loans', variables],
    queryFn: async () => client.request<GetFulfilmentLoansResult>(GET_FULFILMENT_LOANS, variables),
    staleTime: 30 * 1000,
  });
}

export function useFulfilmentLoan(id: string | null | undefined) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ['fulfilment-loan', id],
    queryFn: async () => {
      const result = await client.request<{ loanApplication: LoanApplication }>(GET_FULFILMENT_LOAN, {
        id: id!,
      });
      return result.loanApplication;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useUpdateLoanStatus() {
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
      const result = await client.request<{ updateLoanApplication: LoanListItem }>(
        UPDATE_LOAN_STATUS,
        { id, data }
      );
      return result.updateLoanApplication;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['fulfilment-loans'] });
      queryClient.invalidateQueries({ queryKey: ['fulfilment-loan', id] });
      queryClient.invalidateQueries({ queryKey: ['fulfilment-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loan', id] });
    },
  });
}

export function useActivityLogsForLoan(loanId: string | null | undefined) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ['activity-logs', 'loan', loanId],
    queryFn: async () => {
      const result = await client.request<{ activityLogs: ActivityLogItem[] }>(
        GET_ACTIVITY_LOGS_FOR_LOAN,
        {
          where: {
            entityType: { equals: 'LoanApplication' },
            entityId: { equals: loanId! },
          },
          take: 50,
        }
      );
      return result.activityLogs;
    },
    enabled: !!loanId,
    staleTime: 30 * 1000,
  });
}

export function useAssignFulfilmentExec() {
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
      const result = await client.request<{ updateLoanApplication: LoanListItem }>(
        ASSIGN_FULFILMENT_EXEC,
        { id, data }
      );
      return result.updateLoanApplication;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['fulfilment-loans'] });
      queryClient.invalidateQueries({ queryKey: ['fulfilment-loan', id] });
    },
  });
}
