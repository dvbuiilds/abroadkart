/**
 * Hook to auto-assign tenant to entities on create.
 * Factory pattern for use across Student, Application, LoanApplication, etc.
 *
 * context.session is now a flat SessionData object (no .data wrapper).
 */

type ResolveInputContext = {
  session?: { tenantId?: string } | null;
};

type ResolveInputArgs = {
  resolvedData: Record<string, unknown> & { tenant?: unknown };
  context: ResolveInputContext;
  operation: "create" | "update";
};

export function autoSetTenantHook(targetOp: "create" | "update") {
  return ({ resolvedData, context, operation }: ResolveInputArgs) => {
    const tenantId = context.session?.tenantId;
    if (
      operation === targetOp &&
      !resolvedData.tenant &&
      tenantId
    ) {
      resolvedData.tenant = { connect: { id: tenantId } };
    }
    return resolvedData;
  };
}

/** Legacy export for backward compatibility during migration */
export const autoSetTenant = {
  resolveInput: ({ resolvedData, context }: ResolveInputArgs) => {
    const tenantId = context.session?.tenantId;
    if (!resolvedData.tenant && tenantId) {
      resolvedData.tenant = { connect: { id: tenantId } };
    }
    return resolvedData;
  },
};
