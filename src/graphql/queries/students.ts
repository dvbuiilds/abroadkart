/**
 * GraphQL queries for Student entity
 */

export const GET_STUDENTS = `
  query GetStudents(
    $where: StudentWhereInput!
    $orderBy: [StudentOrderByInput!]!
    $take: Int
    $skip: Int!
  ) {
    students(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {
      id
      fullName
      email
      phone
      dateOfBirth
      countryOfResidence
      targetCountry
      currentStage
      qualification
      workExperience
      targetYear
      budgetPerYear
      openForScholarshipsLoans
      programDisciplines
      ieltsScore
      toeflScore
      pteScore
      gmatScore
      greScore
      satScore
      actScore
      finalScore
      parentMonthlyIncome
      notes
      createdAt
      updatedAt
      tenant {
        id
        name
      }
    }
    studentsCount(where: $where)
  }
`;

export const GET_STUDENT = `
  query GetStudent($id: ID!) {
    student(where: { id: $id }) {
      id
      fullName
      email
      phone
      dateOfBirth
      countryOfResidence
      targetCountry
      currentStage
      qualification
      workExperience
      targetYear
      budgetPerYear
      openForScholarshipsLoans
      programDisciplines
      ieltsScore
      toeflScore
      pteScore
      gmatScore
      greScore
      satScore
      actScore
      finalScore
      parentMonthlyIncome
      notes
      createdAt
      updatedAt
      applications {
        id
        status
        applicationDate
        responseDate
        program {
          id
          name
          level
          field
          university {
            id
            name
            country
          }
        }
      }
      loanApplications {
        id
        status
        loanAmountRequested
        loanAmountApproved
        currency
        interestRate
        emi
        approvedAt
        disburseDate
        consultantRemarks
        fulfilmentRemarks
        createdAt
      }
      documents {
        id
        documentType
        verificationStatus
        uploadedAt
        file {
          filename
          filesize
          url
        }
      }
      tasks {
        id
        title
        status
        priority
        dueDate
        taskType
      }
    }
  }
`;

const CSV_EXPORT_LIMIT = 1000;

export const GET_ALL_STUDENTS = `
  query GetAllStudents(
    $where: StudentWhereInput!
    $orderBy: [StudentOrderByInput!]!
    $take: Int
  ) {
    students(where: $where, orderBy: $orderBy, take: $take) {
      id
      fullName
      email
      phone
      countryOfResidence
      targetCountry
      currentStage
      qualification
      workExperience
      targetYear
      budgetPerYear
      openForScholarshipsLoans
      programDisciplines
      ieltsScore
      toeflScore
      pteScore
      gmatScore
      greScore
      satScore
      actScore
      finalScore
      parentMonthlyIncome
      notes
      createdAt
      updatedAt
    }
  }
`;

export { CSV_EXPORT_LIMIT };
