import { useQuery } from '@tanstack/react-query';
import { useGraphQLClient } from '@app/lib/graphql';
import { GET_CONSULTANTS } from '@app/graphql/queries/consultants';
import type { ConsultantListItem } from '@app/graphql/types';

export interface GetConsultantsResult {
  consultants: ConsultantListItem[];
  consultantsCount: number;
}

export function useConsultants() {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ['consultants'],
    queryFn: async () =>
      client.request<GetConsultantsResult>(GET_CONSULTANTS, {
        where: {},
        orderBy: [{ name: 'asc' }],
        take: 500,
        skip: 0,
      }),
    staleTime: 5 * 60 * 1000,
  });
}
