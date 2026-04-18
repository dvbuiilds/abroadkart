/**
 * Verify better-auth JWTs using JWKS from the Next.js issuer (OIDC-style).
 */
import { createRemoteJWKSet, jwtVerify } from "jose";

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

/** Clears cached JWKS (for tests or config reload). */
export function resetBetterAuthJwksCache(): void {
  jwks = null;
}

function getJwks() {
  const url = process.env.BETTER_AUTH_JWKS_URL;
  if (!url) {
    throw new Error("BETTER_AUTH_JWKS_URL is not set");
  }
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(url));
  }
  return jwks;
}

export async function verifyBetterAuthJwt(token: string): Promise<{
  sub: string;
}> {
  const issuer = process.env.BETTER_AUTH_ISSUER;
  const audience =
    process.env.BETTER_AUTH_AUDIENCE ?? process.env.BETTER_AUTH_ISSUER;
  if (!issuer || !audience) {
    throw new Error(
      "BETTER_AUTH_ISSUER and BETTER_AUTH_AUDIENCE (or ISSUER) must be set",
    );
  }
  const { payload } = await jwtVerify(token, getJwks(), {
    issuer,
    audience,
  });
  if (!payload.sub) {
    throw new Error("JWT missing sub");
  }
  return { sub: String(payload.sub) };
}
