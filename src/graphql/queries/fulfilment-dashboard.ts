/**
 * GraphQL queries for Fulfilment Dashboard
 * Cross-tenant visibility for fulfilment/superAdmin roles.
 */

export const GET_FULFILMENT_KPIS = `
  query GetFulfilmentKPIs(
    $whereUnderReview: LoanApplicationWhereInput!
    $whereApproved: LoanApplicationWhereInput!
    $whereDisbursed: LoanApplicationWhereInput!
    $wherePendingDocs: StudentDocumentWhereInput!
    $wherePendingReimb: ReimbursementWhereInput!
  ) {
    loansUnderReview: loanApplicationsCount(where: $whereUnderReview)
    loansApproved: loanApplicationsCount(where: $whereApproved)
    loansDisbursed: loanApplicationsCount(where: $whereDisbursed)
    pendingDocuments: studentDocumentsCount(where: $wherePendingDocs)
    pendingReimbursements: reimbursementsCount(where: $wherePendingReimb)
  }
`;

export const GET_FULFILMENT_RECENT_LOANS = `
  query GetFulfilmentRecentLoans(
    $where: LoanApplicationWhereInput!
    $take: Int!
  ) {
    loanApplications(where: $where, orderBy: [{ createdAt: "desc" }], take: $take) {
      id
      status
      loanAmountRequested
      loanAmountApproved
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
  }
`;

export const GET_FULFILMENT_OVERDUE_ITEMS = `
  query GetFulfilmentOverdueItems(
    $whereLoans: LoanApplicationWhereInput!
    $whereDocs: StudentDocumentWhereInput!
    $take: Int!
  ) {
    overdueLoans: loanApplications(where: $whereLoans, orderBy: [{ createdAt: "asc" }], take: $take) {
      id
      status
      createdAt
      student { fullName }
      tenant { name }
    }
    overdueDocuments: studentDocuments(where: $whereDocs, orderBy: [{ uploadedAt: "asc" }], take: $take) {
      id
      documentType
      uploadedAt
      student { fullName }
    }
  }
`;
