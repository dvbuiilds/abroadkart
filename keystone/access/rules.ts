/**
 * Reusable access control functions for Keystone lists.
 *
 * context.session is now a flat SessionData object (returned directly by
 * the custom Clerk SessionStrategy), so there is no { data: … } wrapper.
 */

import { Role, isFulfilmentRole, isConsultantRole } from "./roles";

/**
 * Shape of context.session (set by our Clerk SessionStrategy).
 */
export type SessionData = {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId?: string;
  isActive: boolean;
};

/** Convenience alias — context.session can be SessionData or undefined/null. */
type Session = SessionData | null | undefined;

/**
 * Check if user is authenticated.
 */
export function isAuthenticated(session: Session): boolean {
  return !!session?.id;
}

/**
 * Check if user is super admin.
 * Accepts either a bare session or Keystone access-control args ({ session }).
 */
export function isSuperAdmin(
  sessionOrArgs: Session | { session: Session },
): boolean {
  const session =
    sessionOrArgs && typeof sessionOrArgs === "object" && "session" in sessionOrArgs
      ? (sessionOrArgs as { session: Session }).session
      : (sessionOrArgs as Session);
  return session?.role === Role.SUPER_ADMIN;
}

/**
 * Check if user has access to a tenant's data.
 */
export function hasTenantAccess(
  session: Session,
  tenantId: string | null | undefined,
): boolean {
  if (!session) return false;
  if (isSuperAdmin(session)) return true;
  if (isFulfilmentRole(session.role)) return true;
  return session.tenantId === tenantId;
}

/**
 * Get tenant ID from session (for multi-tenant filtering).
 */
export function getSessionTenantId(session: Session): string | null {
  if (!session) return null;
  if (isSuperAdmin(session)) return null; // Super admin sees all
  if (isFulfilmentRole(session.role)) return null; // Fulfilment sees all
  return session.tenantId || null;
}

/**
 * Check if user is consultant (consultantAdmin or consultantAgent).
 * Use in Keystone access: ({ session }) => isConsultant({ session })
 */
export function isConsultant(args: { session: Session }): boolean {
  return isConsultantRole(args.session?.role) ?? false;
}

/**
 * Check if user is fulfilment or superAdmin.
 * Use in Keystone access: ({ session }) => isFulfilment({ session })
 */
export function isFulfilment(args: { session: Session }): boolean {
  return isFulfilmentRole(args.session?.role) ?? false;
}

/**
 * Filter for multi-tenant queries. Fulfilment/superAdmin see all (true).
 * Consultants see only their tenant. No tenant = no access (false).
 * Use in Keystone filter: query: filterByTenant
 */
export type FilterByTenantResult =
  | boolean
  | { tenant: { id: { equals: string } } };

export function filterByTenant(args: {
  session?: Session;
}): FilterByTenantResult {
  const session = args.session;
  if (!session) return false;
  if (isFulfilmentRole(session.role)) return true;
  const tenantId = session.tenantId;
  if (!tenantId) return false;
  return { tenant: { id: { equals: tenantId } } };
}

/**
 * Only fulfilment can update loan status. Use for field-level access.
 */
export function canUpdateLoanStatus(args: { session: Session }): boolean {
  return isFulfilment(args);
}
