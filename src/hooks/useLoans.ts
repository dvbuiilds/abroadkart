import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGraphQLClient } from '@app/lib/graphql-client';
import { GET_LOANS, GET_LOAN } from '@app/graphql/queries/loans';
import { CREATE_LOAN, UPDATE_LOAN_CONSULTANT_REMARKS } from '@app/graphql/mutations/loans';
import type { LoanApplication, LoanListItem } from '@app/graphql/types';

export interface LoansQueryVariables {
  [key: string]: unknown;
  where: Record<string, unknown>;
  orderBy: Array<Record<string, string>>;
  take?: number;
  skip: number;
}

export interface GetLoansResult {
  loanApplications: LoanListItem[];
  loanApplicationsCount: number;
}

export function useLoans(variables: LoansQueryVariables) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ['loans', variables],
    queryFn: async () => client.request<GetLoansResult>(GET_LOANS, variables),
    staleTime: 30 * 1000,
  });
}

export function useLoan(id: string | null | undefined) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ['loan', id],
    queryFn: async () => {
      const result = await client.request<{ loanApplication: LoanApplication }>(GET_LOAN, { id: id! });
      return result.loanApplication;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreateLoan() {
  const client = useGraphQLClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const result = await client.request<{ createLoanApplication: LoanListItem }>(CREATE_LOAN, { data });
      return result.createLoanApplication;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['student'] });
    },
  });
}

export function useUpdateLoanConsultantRemarks() {
  const client = useGraphQLClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const result = await client.request<{ updateLoanApplication: LoanListItem }>(UPDATE_LOAN_CONSULTANT_REMARKS, {
        id,
        data,
      });
      return result.updateLoanApplication;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loan', id] });
      queryClient.invalidateQueries({ queryKey: ['student'] });
    },
  });
}
