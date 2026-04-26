/**
 * GraphQL queries for User (current user / role resolution)
 */

export const GET_CURRENT_USER = `
  query GetCurrentUser($authUserId: String!) {
    users(where: { authUserId: { equals: $authUserId } }, take: 1) {
      id
      email
      name
      role
      tenant {
        id
        name
      }
    }
  }
`;
