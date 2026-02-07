/**
 * Reusable access control functions for Keystone lists
 */

import { Role, isAdminRole, isFulfilmentRole, isConsultantRole } from './roles';

export type SessionData = {
  role?: string;
  tenantId?: string;
  itemId?: string;
  listKey?: string;
};

/**
 * Check if user is authenticated
 */
export function isAuthenticated(session: SessionData | undefined): boolean {
  return !!session?.itemId;
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(session: SessionData | undefined): boolean {
  return session?.role === Role.SUPER_ADMIN;
}

/**
 * Check if user has access to a tenant's data
 */
export function hasTenantAccess(
  session: SessionData | undefined,
  tenantId: string | null | undefined
): boolean {
  if (!session) return false;
  if (isSuperAdmin(session)) return true;
  if (isFulfilmentRole(session.role)) return true;
  return session.tenantId === tenantId;
}

/**
 * Get tenant ID from session (for multi-tenant filtering)
 */
export function getSessionTenantId(session: SessionData | undefined): string | null {
  if (!session) return null;
  if (isSuperAdmin(session)) return null; // Super admin sees all
  if (isFulfilmentRole(session.role)) return null; // Fulfilment sees all
  return session.tenantId || null;
}