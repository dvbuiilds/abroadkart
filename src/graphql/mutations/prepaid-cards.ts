/**
 * GraphQL mutations for PrepaidCard (fulfilment create/update)
 */

export const CREATE_PREPAID_CARD = `
  mutation CreatePrepaidCard($data: PrepaidCardCreateInput!) {
    createPrepaidCard(data: $data) {
      id
      cardNumber
      balance
      currency
      status
      cardProvider
      issuedAt
      student {
        id
        fullName
      }
    }
  }
`;

export const UPDATE_PREPAID_CARD = `
  mutation UpdatePrepaidCard($id: ID!, $data: PrepaidCardUpdateInput!) {
    updatePrepaidCard(where: { id: $id }, data: $data) {
      id
      status
      balance
    }
  }
`;
