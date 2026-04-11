/**
 * Clerk session for KeystoneJS: Bearer JWT (Next proxy) and browser session (native Keystone host).
 */

import type { SessionStrategy } from "@keystone-6/core/types";
import { verifyToken } from "@clerk/backend";
import type { Request as ExpressRequest } from "express";
import { getClerkAuthorizedParties } from "./clerkAuthorizedParties";
import { getClerkBackendClient } from "./clerkBackendClient";
import { expressRequestToWebRequest } from "./expressRequestToWebRequest";

/** Shape of the session data stored on context.session */
export type SessionData = {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId?: string;
  isActive: boolean;
};

async function loadSessionForClerkUser(
  context: { sudo: () => unknown },
  clerkUserId: string,
): Promise<SessionData | undefined> {
  const sudoContext = context.sudo() as {
    query: {
      User: {
        findOne: (args: {
          where: { clerkUserId: string };
          query: string;
        }) => Promise<Record<string, unknown> | null>;
      };
    };
  };

  const user = await sudoContext.query.User.findOne({
    where: { clerkUserId: clerkUserId },
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
}

export const clerkSession: SessionStrategy<SessionData> = {
  async get({ context }) {
    const req = (context as { req?: ExpressRequest }).req;
    if (!req) return;

    const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (bearer) {
      try {
        const clerkPayload = await verifyToken(bearer, {
          secretKey: process.env.CLERK_SECRET_KEY!,
          authorizedParties: getClerkAuthorizedParties(),
        });
        if (!clerkPayload?.sub) return;
        return await loadSessionForClerkUser(context, clerkPayload.sub);
      } catch (err) {
        console.error("Clerk Bearer verification failed:", err);
        return;
      }
    }

    const clerk = getClerkBackendClient();
    if (!clerk) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[clerkSession] Cookie-based auth disabled: set CLERK_PUBLISHABLE_KEY (or NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) in keystone/.env",
        );
      }
      return;
    }

    try {
      const request = expressRequestToWebRequest(req);
      const state = await clerk.authenticateRequest(request, {
        authorizedParties: getClerkAuthorizedParties(),
      });

      if (state.status === "signed-in") {
        const auth = state.toAuth();
        const userId =
          auth && "userId" in auth && typeof auth.userId === "string"
            ? auth.userId
            : null;
        if (!userId) return;
        return await loadSessionForClerkUser(context, userId);
      }
    } catch (err) {
      console.error("Clerk authenticateRequest failed:", err);
      return;
    }

    return;
  },

  async start() {
    return "";
  },
  async end() {},
};
