/**
 * Stamp Keystone User.lastLoginAt when a better-auth session is created (sign-in).
 */
import { getPool } from "@app/lib/db-pool";

/**
 * Stamp User.lastLoginAt = now() for the Keystone row linked to this auth user.
 * Non-blocking: logs and swallows errors so auth flow never fails on a touch.
 */
export async function touchLastLoginForAuthUser(
  authUserId: string,
): Promise<void> {
  try {
    await getPool().query(
      `UPDATE "User" SET "lastLoginAt" = now() WHERE "authUserId" = $1`,
      [authUserId],
    );
  } catch (err) {
    console.error("[auth] touchLastLoginForAuthUser failed:", err);
  }
}
