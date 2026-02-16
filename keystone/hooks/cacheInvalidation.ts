/**
 * Cache invalidation after mutations. Composed with logActivityHook in list hooks.
 */

import { invalidatePattern } from "../lib/redis";
import { logActivityHook } from "./logActivity";
import { resolveTenantId } from "./tenantResolution";

/**
 * Runs afterOperation that invalidates GraphQL cache for the given key (e.g. 'students').
 * Uses resolveTenantId to support items without direct tenant (e.g. StudentDocument → student.tenant).
 */
export function cacheInvalidationAfterOperation(graphqlKey: string) {
  return async (args: unknown) => {
    const a = args as { operation?: string; item?: unknown; context?: unknown };
    if (!a?.operation || !["create", "update", "delete"].includes(a.operation)) return;
    const tenantId = await resolveTenantId(a.item, a.context);
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
