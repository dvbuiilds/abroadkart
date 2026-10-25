/**
 * GraphQL queries for Consultant entity (fulfilment filter dropdown)
 */

export const GET_CONSULTANTS = `
  query GetConsultants(
    $where: ConsultantWhereInput!
    $orderBy: [ConsultantOrderByInput!]!
    $take: Int
    $skip: Int!
  ) {
    consultants(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {
      id
      name
    }
    consultantsCount(where: $where)
  }
`;
