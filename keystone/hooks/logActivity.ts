/**
 * Hook to log activity for audit trail. Writes to ActivityLog via context.sudo().
 * Do NOT attach this hook to the ActivityLog list (would cause infinite loop).
 *
 * context.session is now a flat SessionData object (no .data wrapper).
 */

function getItemId(item: Record<string, unknown> | null | undefined): string {
  const id = item?.id;
  if (id == null) return "";
  return typeof id === "string" ? id : String((id as { toString?: () => string }).toString?.() ?? id);
}

function getItemTenantId(item: Record<string, unknown> | null | undefined): string | null {
  const tenantId = item?.tenantId;
  if (tenantId != null && typeof tenantId === "string") return tenantId;
  const tenant = item?.tenant as { id?: string } | undefined;
  if (tenant?.id != null) return String(tenant.id);
  return null;
}

type SessionShape = {
  id?: string;
  email?: string;
};

function isAfterOperationArgs(
  a: unknown,
): a is {
  operation: string;
  item?: Record<string, unknown> | null;
  context?: { session?: SessionShape | null; listKey?: string; sudo: () => unknown };
  listKey?: string;
} {
  return typeof a === "object" && a !== null && "operation" in a && "context" in a;
}

export const logActivityHook = {
  /** Accepts Keystone afterOperation args (typed as unknown for list hook assignability). */
  afterOperation: async (args: unknown) => {
    if (!isAfterOperationArgs(args)) return;
    const { operation, item, context, listKey } = args;
    if (!["create", "update"].includes(operation)) return;
    const session = context?.session;
    if (!session?.id) return;

    try {
      const entityId = getItemId(item ?? null);
      const tenantId = getItemTenantId(item ?? null);
      const entityType = listKey ?? context?.listKey ?? "Unknown";
      const sudo = context?.sudo?.();
      if (!sudo || typeof (sudo as Record<string, unknown>).query !== "object") return;
      const query = (sudo as { query: { ActivityLog?: { createOne?: (arg: { data: object }) => Promise<unknown> } } }).query;
      if (!query?.ActivityLog?.createOne) return;

      await query.ActivityLog.createOne({
        data: {
          tenant: tenantId ? { connect: { id: tenantId } } : undefined,
          actor: { connect: { id: session.id } },
          entityType,
          entityId,
          action: operation === "create" ? "created" : "updated",
          metadata: {
            timestamp: new Date().toISOString(),
            actor: session.email ?? "",
          },
        },
      });
    } catch (err) {
      console.error("ActivityLog hook failed:", err);
    }
  },
};
