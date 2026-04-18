/**
 * Inserts a Keystone `User` row when a better-auth user is created.
 * Uses raw SQL so this runs in the same transaction context as the hook (post-commit).
 */
import { randomUUID } from "crypto";
import { getPool } from "@app/lib/db-pool";

export async function syncKeystoneUserFromAuthUser(user: {
  id: string;
  email: string;
  name?: string | null;
}): Promise<void> {
  const bootstrap =
    process.env.ABROADKART_BOOTSTRAP_SUPERADMIN_EMAIL?.toLowerCase();
  const role =
    bootstrap && user.email.toLowerCase() === bootstrap
      ? "superAdmin"
      : "pending";

  const pool = getPool();
  await pool.query(
    `INSERT INTO "User" (id, "authUserId", email, name, role, "isActive", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, true, now(), now())
     ON CONFLICT ("authUserId") DO UPDATE SET
       email = EXCLUDED.email,
       name = EXCLUDED.name,
       "updatedAt" = now()`,
    [randomUUID(), user.id, user.email, (user.name ?? "").trim() || "", role],
  );
}
