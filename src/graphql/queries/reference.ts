/**
 * GraphQL queries for reference data (universities, programs)
 */

export const GET_UNIVERSITIES = `
  query GetUniversities(
    $where: UniversityWhereInput!
    $orderBy: [UniversityOrderByInput!]!
    $take: Int
    $skip: Int!
  ) {
    universities(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {
      id
      name
      country
      city
      slug
    }
    universitiesCount(where: $where)
  }
`;

export const GET_PROGRAMS = `
  query GetPrograms(
    $where: ProgramWhereInput!
    $orderBy: [ProgramOrderByInput!]!
    $take: Int
    $skip: Int!
  ) {
    programs(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {
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
      }
    }
    programsCount(where: $where)
  }
`;
