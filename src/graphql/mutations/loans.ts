/**
 * GraphQL mutations for LoanApplication entity (consultant-initiated only)
 */

export const CREATE_LOAN = `
  mutation CreateLoanApplication($data: LoanApplicationCreateInput!) {
    createLoanApplication(data: $data) {
      id
      status
      loanAmountRequested
      currency
      loanTenure
      consultantRemarks
      createdAt
      student { id fullName }
    }
  }
`;

export const UPDATE_LOAN_CONSULTANT_REMARKS = `
  mutation UpdateLoanConsultantRemarks($id: ID!, $data: LoanApplicationUpdateInput!) {
    updateLoanApplication(where: { id: $id }, data: $data) {
      id
      consultantRemarks
      updatedAt
    }
  }
`;
