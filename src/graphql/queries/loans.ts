/**
 * GraphQL queries for LoanApplication entity
 */

export const GET_LOANS = `
  query GetLoans(
    $where: LoanApplicationWhereInput!
    $orderBy: [LoanApplicationOrderByInput!]!
    $take: Int
    $skip: Int!
  ) {
    loanApplications(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {
      id
      status
      loanAmountRequested
      loanAmountApproved
      currency
      loanTenure
      interestRate
      emi
      consultantRemarks
      fulfilmentRemarks
      approvedAt
      disburseDate
      createdAt
      student {
        id
        fullName
        email
        phone
      }
    }
    loanApplicationsCount(where: $where)
  }
`;

export const GET_LOAN = `
  query GetLoan($id: ID!) {
    loanApplication(where: { id: $id }) {
      id
      status
      loanAmountRequested
      loanAmountApproved
      currency
      loanTenure
      interestRate
      emi
      consultantRemarks
      fulfilmentRemarks
      approvedAt
      disburseDate
      createdAt
      updatedAt
      student {
        id
        fullName
        email
        phone
        currentStage
      }
      application {
        id
        status
        program {
          name
          university {
            name
          }
        }
      }
      documents {
        id
        documentType
        verificationStatus
      }
    }
  }
`;
