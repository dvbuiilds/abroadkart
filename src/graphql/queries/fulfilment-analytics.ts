/**
 * GraphQL queries for Fulfilment Analytics
 * Aggregated counts for charts and metrics.
 */

export const GET_LOAN_STATUS_COUNTS = `
  query GetLoanStatusCounts(
    $whereInitiated: LoanApplicationWhereInput!
    $whereDocumentsPending: LoanApplicationWhereInput!
    $whereUnderReview: LoanApplicationWhereInput!
    $whereApproved: LoanApplicationWhereInput!
    $whereRejected: LoanApplicationWhereInput!
    $whereDisbursed: LoanApplicationWhereInput!
    $whereClosed: LoanApplicationWhereInput!
  ) {
    initiated: loanApplicationsCount(where: $whereInitiated)
    documentsPending: loanApplicationsCount(where: $whereDocumentsPending)
    underReview: loanApplicationsCount(where: $whereUnderReview)
    approved: loanApplicationsCount(where: $whereApproved)
    rejected: loanApplicationsCount(where: $whereRejected)
    disbursed: loanApplicationsCount(where: $whereDisbursed)
    closed: loanApplicationsCount(where: $whereClosed)
  }
`;

export const GET_LOANS_FOR_ANALYTICS = `
  query GetLoansForAnalytics(
    $where: LoanApplicationWhereInput!
    $take: Int!
  ) {
    loanApplications(where: $where, orderBy: [{ createdAt: "desc" }], take: $take) {
      id
      status
      createdAt
      approvedAt
      disburseDate
      tenant {
        id
        name
      }
    }
  }
`;

export const GET_DOCUMENTS_FOR_ANALYTICS = `
  query GetDocumentsForAnalytics(
    $where: StudentDocumentWhereInput!
    $take: Int!
  ) {
    studentDocuments(where: $where, orderBy: [{ uploadedAt: "desc" }], take: $take) {
      id
      documentType
      verificationStatus
    }
  }
`;
