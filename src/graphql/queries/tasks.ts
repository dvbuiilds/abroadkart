/**
 * GraphQL queries for Task entity
 */

export const GET_TASKS = `
  query GetTasks(
    $where: TaskWhereInput!
    $orderBy: [TaskOrderByInput!]!
    $take: Int
    $skip: Int!
  ) {
    tasks(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {
      id
      title
      description
      taskType
      status
      priority
      dueDate
      createdAt
      student {
        id
        fullName
      }
      assignedTo {
        id
        name
        email
      }
    }
    tasksCount(where: $where)
  }
`;

export const GET_TASK = `
  query GetTask($id: ID!) {
    task(where: { id: $id }) {
      id
      title
      description
      taskType
      status
      priority
      dueDate
      student {
        id
        fullName
        email
      }
      assignedTo {
        id
        name
        email
      }
      createdAt
      updatedAt
    }
  }
`;
