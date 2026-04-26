/**
 * GraphQL queries for Consultant Dashboard KPIs and activity
 * Tenant filtering is applied by Keystone access rules; pass isDeleted filter for active records.
 */

export const GET_DASHBOARD_KPIS = `
  query GetDashboardKPIs(
    $whereStudents: StudentWhereInput!
    $whereApplications: ApplicationWhereInput!
    $whereLoans: LoanApplicationWhereInput!
  ) {
    totalStudents: studentsCount(where: $whereStudents)
    activeApplications: applicationsCount(where: $whereApplications)
    loansInProcess: loanApplicationsCount(where: $whereLoans)
    enrolledStudents: studentsCount(where: { currentStage: { equals: "enrolled" }, isDeleted: { not: { equals: true } } })
  }
`;

export const GET_RECENT_ACTIVITY = `
  query GetRecentActivity(
    $whereStudents: StudentWhereInput!
    $whereApplications: ApplicationWhereInput!
    $whereLoans: LoanApplicationWhereInput!
    $take: Int!
  ) {
    recentStudents: students(where: $whereStudents, orderBy: [{ createdAt: desc }], take: $take) {
      id
      fullName
      email
      createdAt
    }
    recentApplications: applications(where: $whereApplications, orderBy: [{ applicationDate: desc }], take: $take) {
      id
      status
      applicationDate
      student { fullName }
      program { name university { name } }
    }
    recentLoans: loanApplications(where: $whereLoans, orderBy: [{ createdAt: desc }], take: $take) {
      id
      status
      loanAmountRequested
      createdAt
      student { fullName }
    }
  }
`;

export const GET_PIPELINE_COUNTS = `
  query GetPipelineCounts(
    $whereLead: StudentWhereInput!
    $whereProspect: StudentWhereInput!
    $whereApplied: StudentWhereInput!
    $whereInLoanProcess: StudentWhereInput!
    $whereEnrolled: StudentWhereInput!
    $whereGraduated: StudentWhereInput!
  ) {
    lead: studentsCount(where: $whereLead)
    prospect: studentsCount(where: $whereProspect)
    applied: studentsCount(where: $whereApplied)
    inLoanProcess: studentsCount(where: $whereInLoanProcess)
    enrolled: studentsCount(where: $whereEnrolled)
    graduated: studentsCount(where: $whereGraduated)
  }
`;
