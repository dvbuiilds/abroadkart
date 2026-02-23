/**
 * Clerk JWT validation and session handler for KeystoneJS
 * Uses @clerk/backend (replacement for deprecated @clerk/clerk-sdk-node)
 *
 * Instead of statelessSessions (cookie-based), we create a custom
 * SessionStrategy that extracts the Clerk JWT from the Authorization header,
 * verifies it, and resolves the corresponding Keystone User.
 */

import type { SessionStrategy } from "@keystone-6/core/types";
import { verifyToken } from "@clerk/backend";

/** Shape of the session data stored on context.session */
export type SessionData = {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId?: string;
  isActive: boolean;
};

const authorizedParties = Array.from(
  new Set(
    [process.env.FRONTEND_URL, "http://localhost:3000"]
      .filter((origin): origin is string => Boolean(origin))
      .map((origin) => origin.replace(/\/+$/, "")),
  ),
);

export const clerkSession: SessionStrategy<SessionData> = {
  async get({ context }) {
    // context.req is the Express request object
    const req = (context as any).req as
      | { headers: Record<string, string | undefined> }
      | undefined;
    if (!req) return;

    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return;

    try {
      // Verify Clerk JWT using @clerk/backend (returns payload directly on success)
      const clerkPayload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
        authorizedParties,
      });

      if (!clerkPayload?.sub) return;

      // Look up User in Keystone by clerkUserId
      const sudoContext = context.sudo();
      const user = await sudoContext.query.User.findOne({
        where: { clerkUserId: clerkPayload.sub },
        query: `
          id
          email
          name
          role
          tenant { id }
          isActive
        `,
      });

      if (!user || !user.isActive) return;

      return {
        id: user.id as string,
        email: user.email as string,
        name: user.name as string,
        role: user.role as string,
        tenantId: (user.tenant as { id: string } | null)?.id,
        isActive: user.isActive as boolean,
      };
    } catch (err) {
      console.error("Clerk token verification failed:", err);
      return;
    }
  },

  // start / end are no-ops — Clerk manages sessions externally
  async start() {
    return "";
  },
  async end() {},
};
