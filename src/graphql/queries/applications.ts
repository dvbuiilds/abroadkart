/**
 * GraphQL queries for Application entity
 */

export const GET_APPLICATIONS = `
  query GetApplications(
    $where: ApplicationWhereInput!
    $orderBy: [ApplicationOrderByInput!]!
    $take: Int
    $skip: Int!
  ) {
    applications(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {
      id
      status
      applicationDate
      responseDate
      gpa
      gre
      gmat
      student {
        id
        fullName
        email
      }
      program {
        id
        name
        level
        field
        tuitionFeePerYear
        university {
          id
          name
          country
        }
      }
    }
    applicationsCount(where: $where)
  }
`;

export const GET_APPLICATION = `
  query GetApplication($id: ID!) {
    application(where: { id: $id }) {
      id
      status
      applicationDate
      responseDate
      gre
      gmat
      gpa
      remarks
      createdAt
      updatedAt
      student {
        id
        fullName
        email
        phone
        currentStage
      }
      program {
        id
        name
        level
        field
        tuitionFeePerYear
        currency
        university {
          id
          name
          country
          city
        }
      }
      documents {
        id
        documentType
        verificationStatus
        uploadedAt
      }
    }
  }
`;
