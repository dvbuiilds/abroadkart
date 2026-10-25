/**
 * GraphQL queries for PrepaidCard entity (fulfilment cross-tenant)
 */

export const GET_PREPAID_CARDS = `
  query GetPrepaidCards(
    $where: PrepaidCardWhereInput!
    $orderBy: [PrepaidCardOrderByInput!]!
    $take: Int
    $skip: Int!
  ) {
    prepaidCards(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {
      id
      cardNumber
      balance
      currency
      status
      cardProvider
      issuedAt
      expiryDate
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
    prepaidCardsCount(where: $where)
  }
`;

export const GET_PREPAID_CARD = `
  query GetPrepaidCard($id: ID!) {
    prepaidCard(where: { id: $id }) {
      id
      cardNumber
      balance
      currency
      status
      cardProvider
      issuedAt
      expiryDate
      createdAt
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
