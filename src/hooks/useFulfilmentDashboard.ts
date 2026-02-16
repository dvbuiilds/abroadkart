import { useQuery } from '@tanstack/react-query';
import { useGraphQLClient } from '@app/lib/graphql';
import {
  GET_FULFILMENT_KPIS,
  GET_FULFILMENT_RECENT_LOANS,
  GET_FULFILMENT_OVERDUE_ITEMS,
} from '@app/graphql/queries/fulfilment-dashboard';
import type { FulfilmentDashboardKPIs } from '@app/graphql/types';

const TAT_THRESHOLD_MS = 48 * 60 * 60 * 1000;
const cutoff = new Date(Date.now() - TAT_THRESHOLD_MS).toISOString();

export function useFulfilmentKPIs() {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ['fulfilment-dashboard', 'kpis'],
    queryFn: async () =>
      client.request<FulfilmentDashboardKPIs>(GET_FULFILMENT_KPIS, {
        whereUnderReview: { isDeleted: { not: { equals: true } }, status: { equals: 'underReview' } },
        whereApproved: { isDeleted: { not: { equals: true } }, status: { equals: 'approved' } },
        whereDisbursed: { isDeleted: { not: { equals: true } }, status: { equals: 'disbursed' } },
        wherePendingDocs: { verificationStatus: { equals: 'pending' } },
        wherePendingReimb: { status: { equals: 'pending' } },
      }),
    staleTime: 30 * 1000,
  });
}

export interface FulfilmentRecentLoan {
  id: string;
  status: string | null;
  loanAmountRequested: number | null;
  loanAmountApproved: number | null;
  createdAt: string | null;
  student: { id: string; fullName: string | null; email: string | null } | null;
  tenant: { id: string; name: string | null } | null;
}

export function useFulfilmentRecentLoans(take = 10) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ['fulfilment-dashboard', 'recentLoans', take],
    queryFn: async () =>
      client.request<{ loanApplications: FulfilmentRecentLoan[] }>(GET_FULFILMENT_RECENT_LOANS, {
        where: { isDeleted: { not: { equals: true } } },
        take,
      }),
    staleTime: 30 * 1000,
  });
}

export interface OverdueLoansResult {
  overdueLoans: Array<{
    id: string;
    status: string | null;
    createdAt: string | null;
    student: { fullName: string | null } | null;
    tenant: { name: string | null } | null;
  }>;
  overdueDocuments: Array<{
    id: string;
    documentType: string | null;
    uploadedAt: string | null;
    student: { fullName: string | null } | null;
  }>;
}

export function useOverdueItems(take = 10) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ['fulfilment-dashboard', 'overdue', take],
    queryFn: async () =>
      client.request<OverdueLoansResult>(GET_FULFILMENT_OVERDUE_ITEMS, {
        whereLoans: {
          isDeleted: { not: { equals: true } },
          status: { in: ['underReview', 'documentsPending'] },
          createdAt: { lte: cutoff },
        },
        whereDocs: {
          verificationStatus: { equals: 'pending' },
          uploadedAt: { lte: cutoff },
        },
        take,
      }),
    staleTime: 30 * 1000,
  });
}
