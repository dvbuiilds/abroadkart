/**
 * GraphQL queries for User (current user / role resolution)
 */

export const GET_CURRENT_USER = `
  query GetCurrentUser($clerkUserId: String!) {
    users(where: { clerkUserId: { equals: $clerkUserId } }, take: 1) {
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
