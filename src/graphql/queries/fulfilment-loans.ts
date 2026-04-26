/**
 * GraphQL queries for Fulfilment Loan Queue (cross-tenant)
 */

export const GET_FULFILMENT_LOANS = `
  query GetFulfilmentLoans(
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
      }
      tenant {
        id
        name
      }
    }
    loanApplicationsCount(where: $where)
  }
`;

export const GET_ACTIVITY_LOGS_FOR_LOAN = `
  query GetActivityLogsForLoan($where: ActivityLogWhereInput!, $take: Int!) {
    activityLogs(where: $where, orderBy: [{ createdAt: desc }], take: $take) {
      id
      entityType
      entityId
      action
      createdAt
      actor {
        id
        name
        email
      }
    }
  }
`;

export const GET_FULFILMENT_LOAN = `
  query GetFulfilmentLoan($id: ID!) {
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
      tenant {
        id
        name
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
        verificationRemarks
        uploadedAt
        file {
          filename
          filesize
          url
        }
      }
    }
  }
`;
