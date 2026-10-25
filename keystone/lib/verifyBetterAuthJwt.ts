/**
 * Verify better-auth JWTs using JWKS from the Next.js issuer (OIDC-style).
 */
import { createRemoteJWKSet, jwtVerify } from "jose";
import { getPublicAppUrl } from "./publicUrls";

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

/** Clears cached JWKS (for tests or config reload). */
export function resetBetterAuthJwksCache(): void {
  jwks = null;
}

function getJwks() {
  const url =
    process.env.BETTER_AUTH_JWKS_URL?.trim() ||
    `${getPublicAppUrl()}/api/auth/jwks`;
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(url));
  }
  return jwks;
}

export async function verifyBetterAuthJwt(token: string): Promise<{
  sub: string;
}> {
  const base = getPublicAppUrl();
  const issuer = process.env.BETTER_AUTH_ISSUER?.trim() || base;
  const audience =
    process.env.BETTER_AUTH_AUDIENCE?.trim() ||
    process.env.BETTER_AUTH_ISSUER?.trim() ||
    base;
  const { payload } = await jwtVerify(token, getJwks(), {
    issuer,
    audience,
  });
  if (!payload.sub) {
    throw new Error("JWT missing sub");
  }
  return { sub: String(payload.sub) };
}
