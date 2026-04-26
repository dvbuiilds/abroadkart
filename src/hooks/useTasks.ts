import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGraphQLClient } from "@app/lib/graphql-client";
import { GET_TASKS, GET_TASK } from "@app/graphql/queries/tasks";
import { CREATE_TASK, UPDATE_TASK } from "@app/graphql/mutations/tasks";
import type { Task, TaskListItem } from "@app/graphql/types";

export interface TasksQueryVariables {
  [key: string]: unknown;
  where: Record<string, unknown>;
  orderBy: Array<Record<string, string>>;
  take?: number;
  skip: number;
}

export interface GetTasksResult {
  tasks: TaskListItem[];
  tasksCount: number;
}

export function useTasks(variables: TasksQueryVariables) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ["tasks", variables],
    queryFn: async () => client.request<GetTasksResult>(GET_TASKS, variables),
    staleTime: 60 * 1000,
  });
}

export function useTask(id: string | null | undefined) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ["task", id],
    queryFn: async () => {
      const result = await client.request<{ task: Task }>(GET_TASK, {
        id: id!,
      });
      return result.task;
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useCreateTask() {
  const client = useGraphQLClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const result = await client.request<{ createTask: TaskListItem }>(
        CREATE_TASK,
        { data },
      );
      return result.createTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["student"] });
    },
  });
}

export function useUpdateTask() {
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
      const result = await client.request<{ updateTask: TaskListItem }>(
        UPDATE_TASK,
        { id, data },
      );
      return result.updateTask;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      queryClient.invalidateQueries({ queryKey: ["student"] });
    },
  });
}
