/**
 * Hook to auto-assign tenant to entities on create
 * (To be used in Phase 2 for Student, Application, etc.)
 */

export const autoSetTenant = {
  resolveInput: ({ resolvedData, context }: any) => {
    // Auto-assign tenant from session if not provided
    if (!resolvedData.tenant && context.session?.data?.tenantId) {
      resolvedData.tenant = { connect: { id: context.session.data.tenantId } };
    }
    return resolvedData;
  },
};