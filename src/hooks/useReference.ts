import { useQuery } from '@tanstack/react-query';
import { useGraphQLClient } from '@app/lib/graphql-client';
import { GET_UNIVERSITIES, GET_PROGRAMS } from '@app/graphql/queries/reference';

export interface UniversityItem {
  id: string;
  name: string | null;
  country: string | null;
  city: string | null;
  slug: string | null;
}

export interface ProgramItem {
  id: string;
  name: string | null;
  level: string | null;
  field: string | null;
  tuitionFeePerYear: number | null;
  currency: string | null;
  university: { id: string; name: string | null; country: string | null } | null;
}

export interface GetUniversitiesResult {
  universities: UniversityItem[];
  universitiesCount: number;
}

export interface GetProgramsResult {
  programs: ProgramItem[];
  programsCount: number;
}

export function useUniversities(variables: {
  [key: string]: unknown;
  where: Record<string, unknown>;
  orderBy: Array<Record<string, string>>;
  take?: number;
  skip: number;
}) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ['universities', variables],
    queryFn: async () => client.request<GetUniversitiesResult>(GET_UNIVERSITIES, variables),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePrograms(variables: {
  [key: string]: unknown;
  where: Record<string, unknown>;
  orderBy: Array<Record<string, string>>;
  take?: number;
  skip: number;
}) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ['programs', variables],
    queryFn: async () => client.request<GetProgramsResult>(GET_PROGRAMS, variables),
    staleTime: 5 * 60 * 1000,
  });
}
