/**
 * Cache invalidation after mutations. Composed with logActivityHook in list hooks.
 */

import { invalidatePattern } from "../lib/redis";
import { logActivityHook } from "./logActivity";

function getTenantIdFromItem(item: unknown): string | null {
  if (item == null || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  const tenantId = o.tenantId;
  if (tenantId != null && typeof tenantId === "string") return tenantId;
  const tenant = o.tenant as { id?: string } | null | undefined;
  if (tenant?.id != null) return String(tenant.id);
  return null;
}

/**
 * Runs afterOperation that invalidates GraphQL cache for the given key (e.g. 'students').
 * Accepts unknown args for Keystone hook assignability.
 */
export function cacheInvalidationAfterOperation(graphqlKey: string) {
  return async (args: unknown) => {
    const a = args as { operation?: string; item?: unknown };
    if (!a?.operation || !["create", "update", "delete"].includes(a.operation)) return;
    const tenantId = getTenantIdFromItem(a.item);
    if (tenantId) {
      await invalidatePattern(`gql:${tenantId}:*:*${graphqlKey}*`);
    }
  };
}

/**
 * Combined afterOperation: log activity then invalidate cache. Use in tenant-scoped lists.
 */
export function afterOperationWithCache(graphqlKey: string) {
  return async (args: unknown) => {
    await logActivityHook.afterOperation(args);
    await cacheInvalidationAfterOperation(graphqlKey)(args);
  };
}
