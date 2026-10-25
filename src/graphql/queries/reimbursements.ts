/**
 * GraphQL queries for Reimbursement entity (fulfilment cross-tenant)
 */

export const GET_REIMBURSEMENTS = `
  query GetReimbursements(
    $where: ReimbursementWhereInput!
    $orderBy: [ReimbursementOrderByInput!]!
    $take: Int
    $skip: Int!
  ) {
    reimbursements(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {
      id
      category
      amount
      currency
      status
      requestedAt
      approvedAt
      reimbursedAt
      remarks
      createdAt
      student {
        id
        fullName
        email
      }
      tenant {
        id
        name
      }
    }
    reimbursementsCount(where: $where)
  }
`;

export const GET_REIMBURSEMENT = `
  query GetReimbursement($id: ID!) {
    reimbursement(where: { id: $id }) {
      id
      category
      amount
      currency
      status
      requestedAt
      approvedAt
      reimbursedAt
      remarks
      createdAt
      receipt {
        filename
        filesize
        url
      }
      student {
        id
        fullName
        email
        phone
      }
      tenant {
        id
        name
      }
    }
  }
`;
