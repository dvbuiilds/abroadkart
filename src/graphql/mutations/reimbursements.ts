/**
 * GraphQL mutations for Reimbursement (fulfilment status updates)
 */

export const UPDATE_REIMBURSEMENT = `
  mutation UpdateReimbursement($id: ID!, $data: ReimbursementUpdateInput!) {
    updateReimbursement(where: { id: $id }, data: $data) {
      id
      status
      approvedAt
      reimbursedAt
      remarks
    }
  }
`;
