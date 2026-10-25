/**
 * GraphQL mutations for StudentDocument verification (fulfilment-only)
 */

export const VERIFY_DOCUMENT = `
  mutation VerifyDocument($id: ID!, $data: StudentDocumentUpdateInput!) {
    updateStudentDocument(where: { id: $id }, data: $data) {
      id
      verificationStatus
      verificationRemarks
    }
  }
`;
