import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGraphQLClient } from "@app/lib/graphql-client";
import { GET_DOCUMENTS } from "@app/graphql/queries/documents";
import { CREATE_STUDENT_DOCUMENT } from "@app/graphql/mutations/documents";
import {
  uploadDocument,
  type UploadDocumentParams,
} from "@app/lib/documents/upload";
import type { StudentDocumentListItem } from "@app/graphql/types";

export interface DocumentsQueryVariables {
  [key: string]: unknown;
  where: Record<string, unknown>;
  orderBy: Array<Record<string, string>>;
  take?: number;
  skip: number;
}

export interface GetDocumentsResult {
  studentDocuments: StudentDocumentListItem[];
  studentDocumentsCount: number;
}

export function useDocuments(variables: DocumentsQueryVariables) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ["documents", variables],
    queryFn: async () =>
      client.request<GetDocumentsResult>(GET_DOCUMENTS, variables),
    staleTime: 60 * 1000,
  });
}

export function useUploadDocument() {
  const client = useGraphQLClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const result = await client.request<{
        createStudentDocument: StudentDocumentListItem;
      }>(CREATE_STUDENT_DOCUMENT, { data });
      return result.createStudentDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["student"] });
    },
  });
}

async function getClientAuthJwt(): Promise<string | null> {
  const res = await fetch("/api/auth/token", { credentials: "include" });
  if (!res.ok) return null;
  const data = (await res.json()) as { token?: string };
  return data.token ?? null;
}

export function useUploadDocumentWithFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: UploadDocumentParams) => {
      const token = await getClientAuthJwt();
      return uploadDocument(params, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["student"] });
    },
  });
}
