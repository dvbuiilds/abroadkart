import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useGraphQLClient } from '@app/lib/graphql';
import { GET_DOCUMENT_QUEUE } from '@app/graphql/queries/documents';
import { VERIFY_DOCUMENT } from '@app/graphql/mutations/fulfilment-documents';
import type { StudentDocumentListItem } from '@app/graphql/types';

export interface DocumentQueueQueryVariables {
  [key: string]: unknown;
  where: Record<string, unknown>;
  orderBy: Array<Record<string, string>>;
  take?: number;
  skip: number;
}

export interface GetDocumentQueueResult {
  studentDocuments: StudentDocumentListItem[];
  studentDocumentsCount: number;
}

export function useDocumentQueue(variables: DocumentQueueQueryVariables) {
  const client = useGraphQLClient();
  return useQuery({
    queryKey: ['document-queue', variables],
    queryFn: async () => client.request<GetDocumentQueueResult>(GET_DOCUMENT_QUEUE, variables),
    staleTime: 30 * 1000,
  });
}

export function useVerifyDocument() {
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
      const result = await client.request<{ updateStudentDocument: StudentDocumentListItem }>(
        VERIFY_DOCUMENT,
        { id, data }
      );
      return result.updateStudentDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-queue'] });
      queryClient.invalidateQueries({ queryKey: ['fulfilment-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['fulfilment-loan'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
