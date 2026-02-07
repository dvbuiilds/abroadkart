/**
 * Clerk JWT validation and session handler for KeystoneJS
 * Uses @clerk/backend (replacement for deprecated @clerk/clerk-sdk-node)
 */

import { statelessSessions } from "@keystone-6/core/session";
import { verifyToken } from "@clerk/backend";

export const clerkSession = statelessSessions({
  secret: process.env.SESSION_SECRET!,

  async get({ req, createContext }) {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return;

    try {
      // Verify Clerk JWT using @clerk/backend (returns payload directly on success)
      const clerkPayload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
        authorizedParties: [
          process.env.FRONTEND_URL || "http://localhost:3000",
        ],
      });

      if (!clerkPayload?.sub) return;

      // Look up User in Keystone by clerkUserId
      const context = await createContext();
      const user = await context.sudo().query.User.findOne({
        where: { clerkUserId: clerkPayload.sub },
        query: `
          id
          email
          name
          role
          tenant { id slug name }
          isActive
        `,
      });

      if (!user || !user.isActive) return;

      return {
        itemId: user.id,
        listKey: "User",
        data: {
          ...user,
          tenantId: user.tenant?.id || null,
        },
      };
    } catch (err) {
      console.error("Clerk token verification failed:", err);
      return;
    }
  },
});
