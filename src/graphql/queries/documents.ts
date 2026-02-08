/**
 * GraphQL queries for StudentDocument entity
 */

export const GET_DOCUMENTS = `
  query GetDocuments(
    $where: StudentDocumentWhereInput!
    $orderBy: [StudentDocumentOrderByInput!]!
    $take: Int
    $skip: Int!
  ) {
    studentDocuments(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {
      id
      documentType
      verificationStatus
      uploadedAt
      student {
        id
        fullName
        email
      }
      file {
        filename
        filesize
        url
      }
    }
    studentDocumentsCount(where: $where)
  }
`;
