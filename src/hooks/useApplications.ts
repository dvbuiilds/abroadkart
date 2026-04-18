import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGraphQLClient } from "@app/lib/graphql-client";
import {
  GET_APPLICATIONS,
  GET_APPLICATION,
} from "@app/graphql/queries/applications";
import {
  CREATE_APPLICATION,
  UPDATE_APPLICATION,
} from "@app/graphql/mutations/applications";
import type { Application, ApplicationListItem } from "@app/graphql/types";

export interface ApplicationsQueryVariables {
  [key: string]: unknown;
  where: Record<string, unknown>;
  orderBy: Array<Record<string, string>>;
  take?: number;
  skip: number;
}

export interface GetApplicationsResult {
  applications: ApplicationListItem[];
  applicationsCount: number;
}

export function useApplications(variables: ApplicationsQueryVariables) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ["applications", variables],
    queryFn: async () =>
      client.request<GetApplicationsResult>(GET_APPLICATIONS, variables),
    staleTime: 60 * 1000,
  });
}

export function useApplication(id: string | null | undefined) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ["application", id],
    queryFn: async () => {
      const result = await client.request<{ application: Application }>(
        GET_APPLICATION,
        { id: id! },
      );
      return result.application;
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useCreateApplication() {
  const client = useGraphQLClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const result = await client.request<{
        createApplication: ApplicationListItem;
      }>(CREATE_APPLICATION, { data });
      return result.createApplication;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["student"] });
    },
  });
}

export function useUpdateApplication() {
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
      const result = await client.request<{
        updateApplication: ApplicationListItem;
      }>(UPDATE_APPLICATION, { id, data });
      return result.updateApplication;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["student"] });
    },
  });
}
