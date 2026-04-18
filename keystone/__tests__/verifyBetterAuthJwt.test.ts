/**
 * JWKS verification for better-auth JWTs (Ed25519).
 */
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { generateKeyPair, exportJWK, SignJWT } from "jose";
import { resetBetterAuthJwksCache } from "../lib/verifyBetterAuthJwt";

describe("verifyBetterAuthJwt", () => {
  let server: http.Server;
  let jwksUrl: string;
  /** Inferred from `jose` `generateKeyPair` — avoids relying on DOM `CryptoKey` in Node tsconfig. */
  let privateKey: Awaited<ReturnType<typeof generateKeyPair>>["privateKey"];
  const issuer = "http://issuer.test";
  const audience = "http://audience.test";

  before(async () => {
    const { publicKey, privateKey: priv } = await generateKeyPair("EdDSA", {
      crv: "Ed25519",
    });
    privateKey = priv;
    const jwk = {
      ...(await exportJWK(publicKey)),
      kid: "test-key",
    };

    await new Promise<void>((resolve, reject) => {
      server = http.createServer((req, res) => {
        if (req.url?.includes("/jwks")) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ keys: [jwk] }));
        } else {
          res.writeHead(404);
          res.end();
        }
      });
      server.listen(0, "127.0.0.1", () => resolve());
      server.on("error", reject);
    });

    const addr = server.address();
    if (!addr || typeof addr === "string") throw new Error("expected port");
    jwksUrl = `http://127.0.0.1:${addr.port}/api/auth/jwks`;

    process.env.BETTER_AUTH_JWKS_URL = jwksUrl;
    process.env.BETTER_AUTH_ISSUER = issuer;
    process.env.BETTER_AUTH_AUDIENCE = audience;
    resetBetterAuthJwksCache();
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
    delete process.env.BETTER_AUTH_JWKS_URL;
    delete process.env.BETTER_AUTH_ISSUER;
    delete process.env.BETTER_AUTH_AUDIENCE;
    resetBetterAuthJwksCache();
  });

  async function mintToken(overrides?: {
    aud?: string;
    iss?: string;
    expired?: boolean;
    sub?: string;
  }): Promise<string> {
    const jwt = new SignJWT({})
      .setProtectedHeader({ alg: "EdDSA", kid: "test-key" })
      .setSubject(overrides?.sub ?? "user-123")
      .setIssuer(overrides?.iss ?? issuer)
      .setAudience(overrides?.aud ?? audience);
    if (overrides?.expired) {
      jwt.setExpirationTime(Math.floor(Date.now() / 1000) - 120);
    } else {
      jwt.setExpirationTime("15m");
    }
    return jwt.sign(privateKey);
  }

  it("resolves sub for a valid token", async () => {
    const { verifyBetterAuthJwt } = await import("../lib/verifyBetterAuthJwt");
    const token = await mintToken();
    const out = await verifyBetterAuthJwt(token);
    assert.equal(out.sub, "user-123");
  });

  it("throws when audience does not match", async () => {
    const { verifyBetterAuthJwt } = await import("../lib/verifyBetterAuthJwt");
    const token = await mintToken({ aud: "wrong" });
    await assert.rejects(() => verifyBetterAuthJwt(token));
  });

  it("throws when issuer does not match", async () => {
    const { verifyBetterAuthJwt } = await import("../lib/verifyBetterAuthJwt");
    const token = await mintToken({ iss: "http://wrong" });
    await assert.rejects(() => verifyBetterAuthJwt(token));
  });

  it("throws when token is expired", async () => {
    const { verifyBetterAuthJwt } = await import("../lib/verifyBetterAuthJwt");
    const token = await mintToken({ expired: true });
    await assert.rejects(() => verifyBetterAuthJwt(token));
  });

  it("throws on malformed token", async () => {
    const { verifyBetterAuthJwt } = await import("../lib/verifyBetterAuthJwt");
    await assert.rejects(() => verifyBetterAuthJwt("not-a-jwt"));
  });
});
