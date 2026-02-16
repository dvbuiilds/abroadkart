/**
 * Resolve tenant ID from an afterOperation item. Handles lists that have
 * direct tenant (tenantId/tenant) and those that derive it via student (e.g. StudentDocument).
 */

type ContextShape = {
  sudo?: () => {
    query?: {
      Student?: {
        findOne: (opts: { where: { id: string }; query: string }) => Promise<{ tenant?: { id?: string } | null } | null>;
      };
    };
  };
};

function getTenantIdFromItemSync(item: unknown): string | null {
  if (item == null || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  const tenantId = o.tenantId;
  if (tenantId != null && typeof tenantId === "string") return tenantId;
  const tenant = o.tenant as { id?: string } | null | undefined;
  if (tenant?.id != null) return String(tenant.id);
  return null;
}

/**
 * Resolves tenant ID from an afterOperation item, falling back to student.tenant
 * when the item has no direct tenant (e.g. StudentDocument).
 */
export async function resolveTenantId(
  item: unknown,
  context?: unknown
): Promise<string | null> {
  const direct = getTenantIdFromItemSync(item);
  if (direct) return direct;

  const ctx = context as ContextShape | null | undefined;
  if (item == null || typeof item !== "object" || !ctx?.sudo) return null;
  const o = item as Record<string, unknown>;
  const studentId = o.studentId;
  if (typeof studentId !== "string") return null;

  try {
    const sudo = ctx.sudo();
    const student = await sudo.query?.Student?.findOne?.({
      where: { id: studentId },
      query: "tenant { id }",
    });
    const tid = (student?.tenant as { id?: string } | null)?.id;
    return tid != null ? String(tid) : null;
  } catch {
    return null;
  }
}
