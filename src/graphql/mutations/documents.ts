/**
 * GraphQL mutations for StudentDocument entity (upload)
 * File upload uses Keystone's file field; multipart upload may be required.
 */

export const CREATE_STUDENT_DOCUMENT = `
  mutation CreateStudentDocument($data: StudentDocumentCreateInput!) {
    createStudentDocument(data: $data) {
      id
      documentType
      verificationStatus
      uploadedAt
      student { id fullName }
    }
  }
`;
