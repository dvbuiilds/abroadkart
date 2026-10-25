/**
 * Role definitions for the multi-tenant CRM system
 */

export enum Role {
  PENDING = "pending",
  SUPER_ADMIN = "superAdmin",
  FULFILMENT = "fulfilment",
  CONSULTANT_ADMIN = "consultantAdmin",
  CONSULTANT_AGENT = "consultantAgent",
}

export const ROLES = {
  PENDING: Role.PENDING,
  SUPER_ADMIN: Role.SUPER_ADMIN,
  FULFILMENT: Role.FULFILMENT,
  CONSULTANT_ADMIN: Role.CONSULTANT_ADMIN,
  CONSULTANT_AGENT: Role.CONSULTANT_AGENT,
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

/**
 * New sign-ups awaiting role assignment by a super admin.
 */
export function isPendingRole(role: string | undefined): boolean {
  return role === Role.PENDING;
}

/**
 * Check if a role has admin privileges
 */
export function isAdminRole(role: string | undefined): boolean {
  return role === Role.SUPER_ADMIN || role === Role.CONSULTANT_ADMIN;
}

/**
 * Check if a role can access fulfilment features
 */
export function isFulfilmentRole(role: string | undefined): boolean {
  return role === Role.SUPER_ADMIN || role === Role.FULFILMENT;
}

/**
 * Check if a role is consultant-level (admin or agent)
 */
export function isConsultantRole(role: string | undefined): boolean {
  return role === Role.CONSULTANT_ADMIN || role === Role.CONSULTANT_AGENT;
}
