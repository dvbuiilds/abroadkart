import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGraphQLClient } from "@app/lib/graphql-client";
import {
  GET_STUDENTS,
  GET_STUDENT,
  GET_ALL_STUDENTS,
  CSV_EXPORT_LIMIT,
} from "@app/graphql/queries/students";
import {
  CREATE_STUDENT,
  UPDATE_STUDENT,
} from "@app/graphql/mutations/students";
import type { Student, StudentListItem } from "@app/graphql/types";

export interface StudentsQueryVariables {
  [key: string]: unknown;
  where: Record<string, unknown>;
  orderBy: Array<Record<string, string>>;
  take?: number;
  skip: number;
}

export interface GetStudentsResult {
  students: StudentListItem[];
  studentsCount: number;
}

export interface GetAllStudentsResult {
  students: Student[];
}

export function useStudents(variables: StudentsQueryVariables) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ["students", variables],
    queryFn: async () =>
      client.request<GetStudentsResult>(GET_STUDENTS, variables),
    staleTime: 60 * 1000,
  });
}

export function useStudent(id: string | null | undefined) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ["student", id],
    queryFn: async () => {
      const result = await client.request<{ student: Student }>(GET_STUDENT, {
        id: id!,
      });
      return result.student;
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}

export function useAllStudents(where: Record<string, unknown>) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ["students-export", where],
    queryFn: async () =>
      client.request<GetAllStudentsResult>(GET_ALL_STUDENTS, {
        where,
        orderBy: [{ createdAt: "desc" }],
        take: CSV_EXPORT_LIMIT,
      }),
    staleTime: 60 * 1000,
    enabled: false,
  });
}

export function useCreateStudent() {
  const client = useGraphQLClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const result = await client.request<{ createStudent: StudentListItem }>(
        CREATE_STUDENT,
        { data },
      );
      return result.createStudent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useUpdateStudent() {
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
      const result = await client.request<{ updateStudent: StudentListItem }>(
        UPDATE_STUDENT,
        { id, data },
      );
      return result.updateStudent;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student", id] });
    },
  });
}
