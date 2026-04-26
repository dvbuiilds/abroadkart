/**
 * GraphQL mutations for Student entity
 */

export const CREATE_STUDENT = `
  mutation CreateStudent($data: StudentCreateInput!) {
    createStudent(data: $data) {
      id
      fullName
      email
      phone
      targetCountry
      currentStage
      qualification
      targetYear
      countryOfResidence
      createdAt
    }
  }
`;

export const UPDATE_STUDENT = `
  mutation UpdateStudent($id: ID!, $data: StudentUpdateInput!) {
    updateStudent(where: { id: $id }, data: $data) {
      id
      fullName
      email
      phone
      targetCountry
      currentStage
      qualification
      targetYear
      countryOfResidence
      updatedAt
    }
  }
`;
