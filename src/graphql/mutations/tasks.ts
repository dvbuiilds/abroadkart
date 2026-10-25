/**
 * GraphQL mutations for Task entity
 */

export const CREATE_TASK = `
  mutation CreateTask($data: TaskCreateInput!) {
    createTask(data: $data) {
      id
      title
      status
      priority
      dueDate
      taskType
      student { id fullName }
    }
  }
`;

export const UPDATE_TASK = `
  mutation UpdateTask($id: ID!, $data: TaskUpdateInput!) {
    updateTask(where: { id: $id }, data: $data) {
      id
      title
      status
      priority
      dueDate
      updatedAt
    }
  }
`;
