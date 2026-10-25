import { useQuery } from '@tanstack/react-query';
import { useGraphQLClient } from '@app/lib/graphql-client';
import { GET_DASHBOARD_KPIS, GET_RECENT_ACTIVITY, GET_PIPELINE_COUNTS } from '@app/graphql/queries/dashboard';

export interface DashboardKPIsResult {
  totalStudents: number;
  activeApplications: number;
  loansInProcess: number;
  enrolledStudents: number;
}

const defaultWhereNotDeleted = { isDeleted: { not: { equals: true } } };
const defaultWhereApplicationsActive = {
  isDeleted: { not: { equals: true } },
  status: { notIn: ['rejected'] },
};
const defaultWhereLoansInProcess = {
  isDeleted: { not: { equals: true } },
  status: { in: ['initiated', 'documentsPending', 'underReview'] },
};
const defaultWhereCreatedRecently = {
  ...defaultWhereNotDeleted,
  createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
};

export function useDashboardKPIs() {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: async () =>
      client.request<DashboardKPIsResult>(GET_DASHBOARD_KPIS, {
        whereStudents: defaultWhereNotDeleted,
        whereApplications: defaultWhereApplicationsActive,
        whereLoans: defaultWhereLoansInProcess,
      }),
    staleTime: 60 * 1000,
  });
}

export interface RecentActivityResult {
  recentStudents: Array<{ id: string; fullName: string | null; email: string | null; createdAt: string | null }>;
  recentApplications: Array<{
    id: string;
    status: string | null;
    applicationDate: string | null;
    student: { fullName: string | null } | null;
    program: { name: string | null; university: { name: string | null } | null } | null;
  }>;
  recentLoans: Array<{
    id: string;
    status: string | null;
    loanAmountRequested: number | null;
    createdAt: string | null;
    student: { fullName: string | null } | null;
  }>;
}

export function useRecentActivity(take = 5) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ['dashboard', 'recentActivity', take],
    queryFn: async () =>
      client.request<RecentActivityResult>(GET_RECENT_ACTIVITY, {
        whereStudents: defaultWhereCreatedRecently,
        whereApplications: { ...defaultWhereNotDeleted, applicationDate: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() } },
        whereLoans: defaultWhereCreatedRecently,
        take,
      }),
    staleTime: 60 * 1000,
  });
}

export interface PipelineCountsResult {
  lead: number;
  prospect: number;
  applied: number;
  inLoanProcess: number;
  enrolled: number;
  graduated: number;
}

const baseWhere = defaultWhereNotDeleted;

export function usePipelineCounts() {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ['dashboard', 'pipeline'],
    queryFn: async () =>
      client.request<PipelineCountsResult>(GET_PIPELINE_COUNTS, {
        whereLead: { ...baseWhere, currentStage: { equals: 'lead' } },
        whereProspect: { ...baseWhere, currentStage: { equals: 'prospect' } },
        whereApplied: { ...baseWhere, currentStage: { equals: 'applied' } },
        whereInLoanProcess: { ...baseWhere, currentStage: { equals: 'inLoanProcess' } },
        whereEnrolled: { ...baseWhere, currentStage: { equals: 'enrolled' } },
        whereGraduated: { ...baseWhere, currentStage: { equals: 'graduated' } },
      }),
    staleTime: 60 * 1000,
  });
}
