import { useQuery } from '@tanstack/react-query';
import { useGraphQLClient } from '@app/lib/graphql';
import {
  GET_LOAN_STATUS_COUNTS,
  GET_LOANS_FOR_ANALYTICS,
  GET_DOCUMENTS_FOR_ANALYTICS,
} from '@app/graphql/queries/fulfilment-analytics';

const baseWhere = { isDeleted: { not: { equals: true } } };

export interface LoanStatusCounts {
  initiated: number;
  documentsPending: number;
  underReview: number;
  approved: number;
  rejected: number;
  disbursed: number;
  closed: number;
}

export function useLoanStatusCounts() {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ['fulfilment-analytics', 'loan-status-counts'],
    queryFn: async () =>
      client.request<LoanStatusCounts>(GET_LOAN_STATUS_COUNTS, {
        whereInitiated: { ...baseWhere, status: { equals: 'initiated' } },
        whereDocumentsPending: { ...baseWhere, status: { equals: 'documentsPending' } },
        whereUnderReview: { ...baseWhere, status: { equals: 'underReview' } },
        whereApproved: { ...baseWhere, status: { equals: 'approved' } },
        whereRejected: { ...baseWhere, status: { equals: 'rejected' } },
        whereDisbursed: { ...baseWhere, status: { equals: 'disbursed' } },
        whereClosed: { ...baseWhere, status: { equals: 'closed' } },
      }),
    staleTime: 60 * 1000,
  });
}

export interface LoanForAnalytics {
  id: string;
  status: string | null;
  createdAt: string | null;
  approvedAt: string | null;
  disburseDate: string | null;
  tenant: { id: string; name: string | null } | null;
}

export function useLoansForAnalytics(take = 500) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ['fulfilment-analytics', 'loans', take],
    queryFn: async () =>
      client.request<{ loanApplications: LoanForAnalytics[] }>(GET_LOANS_FOR_ANALYTICS, {
        where: baseWhere,
        take,
      }),
    staleTime: 60 * 1000,
  });
}

export interface DocumentForAnalytics {
  id: string;
  documentType: string | null;
  verificationStatus: string | null;
}

export function useDocumentsForAnalytics(take = 1000) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ['fulfilment-analytics', 'documents', take],
    queryFn: async () =>
      client.request<{ studentDocuments: DocumentForAnalytics[] }>(GET_DOCUMENTS_FOR_ANALYTICS, {
        where: {},
        take,
      }),
    staleTime: 60 * 1000,
  });
}
