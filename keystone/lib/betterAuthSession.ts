/**
 * Keystone session: better-auth JWT (Bearer or ab_admin_session cookie).
 */
import type { SessionStrategy } from "@keystone-6/core/types";
import type { Request as ExpressRequest } from "express";
import { verifyBetterAuthJwt } from "./verifyBetterAuthJwt";
import { isKeystoneAdminDebug } from "./adminDebug";

/** Shape of the session data stored on context.session */
export type SessionData = {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId?: string;
  isActive: boolean;
};

const ADMIN_SESSION_COOKIE = "ab_admin_session";

function getCookie(req: ExpressRequest, name: string): string | undefined {
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  for (const part of raw.split(";")) {
    const trimmed = part.trim();
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    const k = trimmed.slice(0, i).trim();
    if (k === name) {
      return decodeURIComponent(trimmed.slice(i + 1));
    }
  }
  return undefined;
}

export async function loadSessionForAuthUser(
  context: { sudo: () => unknown },
  authUserId: string,
): Promise<SessionData | undefined> {
  const sudoContext = context.sudo() as {
    query: {
      User: {
        findOne: (args: {
          where: { authUserId: string };
          query: string;
        }) => Promise<Record<string, unknown> | null>;
      };
    };
  };

  const user = await sudoContext.query.User.findOne({
    where: { authUserId },
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

export type BetterAuthSessionDeps = {
  verifyJwt?: (token: string) => Promise<{ sub: string }>;
};

export function createBetterAuthSession(
  deps: BetterAuthSessionDeps = {},
): SessionStrategy<SessionData> {
  const verifyJwt = deps.verifyJwt ?? verifyBetterAuthJwt;

  return {
    async get({ context }) {
      const req = (context as { req?: ExpressRequest }).req;
      const pathOnly = (req?.originalUrl || req?.url || "").split("?")[0] || "";
      const forGraphQL =
        pathOnly === "/api/graphql" || pathOnly.startsWith("/api/graphql");

      if (!req) {
        if (isKeystoneAdminDebug() && forGraphQL) {
          console.warn(
            "[keystone][session] GraphQL context has no req — session will be empty",
          );
        }
        return;
      }

      let token =
        req.headers.authorization?.replace(/^Bearer\s+/i, "")?.trim() || "";
      const tokenFrom = token ? "Authorization" : "";
      if (!token) {
        token = getCookie(req, ADMIN_SESSION_COOKIE) ?? "";
      }
      const tokenSource = tokenFrom || (token ? "ab_admin_session" : "none");

      if (!token) {
        if (isKeystoneAdminDebug() && forGraphQL) {
          console.warn(
            "[keystone][session] no JWT on GraphQL request — Admin UI needs SSO cookie or Bearer",
            { path: pathOnly },
          );
        }
        return;
      }

      try {
        const { sub } = await verifyJwt(token);
        const session = await loadSessionForAuthUser(context, sub);
        if (isKeystoneAdminDebug() && forGraphQL) {
          if (!session) {
            console.warn(
              "[keystone][session] JWT ok but no active Keystone User for authUserId (sub)",
              { subPrefix: sub.slice(0, 12), tokenSource },
            );
          } else {
            console.info("[keystone][session] GraphQL session", {
              role: session.role,
              keystoneUserId: session.id,
              tokenSource,
            });
          }
        }
        return session;
      } catch (err) {
        console.error("[keystone][session] JWT verification failed:", err);
        if (forGraphQL) {
          console.error("[keystone][session] failed GraphQL path:", pathOnly);
        }
        return;
      }
    },

    async start() {
      return "";
    },
    async end() {},
  };
}

/** Default session strategy — better-auth JWT via Bearer or `ab_admin_session`. */
export const betterAuthSession = createBetterAuthSession();
