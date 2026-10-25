/**
 * GraphQL mutations for LoanApplication (fulfilment-only fields)
 */

export const UPDATE_LOAN_STATUS = `
  mutation UpdateLoanStatus($id: ID!, $data: LoanApplicationUpdateInput!) {
    updateLoanApplication(where: { id: $id }, data: $data) {
      id
      status
      loanAmountApproved
      interestRate
      emi
      fulfilmentRemarks
      approvedAt
      disburseDate
      updatedAt
    }
  }
`;

export const ASSIGN_FULFILMENT_EXEC = `
  mutation AssignFulfilmentExec($id: ID!, $data: LoanApplicationUpdateInput!) {
    updateLoanApplication(where: { id: $id }, data: $data) {
      id
      assignedFulfilmentExec {
        id
        name
        email
      }
      updatedAt
    }
  }
`;
