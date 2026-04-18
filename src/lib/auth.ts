/**
 * better-auth server instance — Postgres `auth` schema, JWT + JWKS for Keystone.
 * Use `getAuth()` so DB pools are not opened during Next.js build when DATABASE_URL is unset.
 */
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { Kysely, PostgresDialect } from "kysely";
import { syncKeystoneUserFromAuthUser } from "@app/lib/sync-keystone-user";
import { touchLastLoginForAuthUser } from "@app/lib/touch-last-login";
import { getPool } from "@app/lib/db-pool";

const baseURL =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
  "http://localhost:3000";

const googleConfigured =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

function createAuthInstance() {
  const db = new Kysely({
    dialect: new PostgresDialect({ pool: getPool() }),
  }).withSchema("auth");

  return betterAuth({
    appName: "AbroadKart",
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL,
    basePath: "/api/auth",
    database: {
      db,
      type: "postgres",
      transaction: true,
    },
    emailAndPassword: {
      enabled: true,
    },
    ...(googleConfigured
      ? {
          socialProviders: {
            google: {
              clientId: process.env.GOOGLE_CLIENT_ID!,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            },
          },
        }
      : {}),
    plugins: [
      nextCookies(),
      jwt({
        jwks: {
          keyPairConfig: { alg: "EdDSA", crv: "Ed25519" },
        },
        jwt: {
          issuer: baseURL,
          audience: baseURL,
          expirationTime: "15m",
        },
      }),
    ],
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await syncKeystoneUserFromAuthUser(user);
          },
        },
      },
      session: {
        create: {
          after: async (session) => {
            await touchLastLoginForAuthUser(session.userId);
          },
        },
      },
    },
    trustedOrigins: [
      baseURL,
      process.env.NEXT_PUBLIC_KEYSTONE_URL,
      process.env.KEYSTONE_PUBLIC_URL,
    ].filter((x): x is string => Boolean(x)),
  });
}

export type AuthInstance = ReturnType<typeof createAuthInstance>;

let authSingleton: AuthInstance | undefined;

export function getAuth(): AuthInstance {
  if (!authSingleton) {
    authSingleton = createAuthInstance();
  }
  return authSingleton;
}

/** For `@better-auth/cli migrate --config` (expects a Better Auth instance). */
export const auth = new Proxy({} as AuthInstance, {
  get(_target, prop, receiver) {
    const instance = getAuth();
    const value = Reflect.get(instance, prop, receiver);
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(instance);
    }
    return value;
  },
});
