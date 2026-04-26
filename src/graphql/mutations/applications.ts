/**
 * GraphQL mutations for Application entity
 */

export const CREATE_APPLICATION = `
  mutation CreateApplication($data: ApplicationCreateInput!) {
    createApplication(data: $data) {
      id
      status
      applicationDate
      student { id fullName }
      program { id name university { name } }
      createdAt
    }
  }
`;

export const UPDATE_APPLICATION = `
  mutation UpdateApplication($id: ID!, $data: ApplicationUpdateInput!) {
    updateApplication(where: { id: $id }, data: $data) {
      id
      status
      responseDate
      updatedAt
    }
  }
`;
