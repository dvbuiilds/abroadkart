/**
 * Utility functions for Keystone backend
 */

/**
 * Generate a random session secret
 */
export function generateSessionSecret(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Validate environment variables
 */
export function validateEnv(): void {
  const required = ["DATABASE_URL", "SESSION_SECRET"];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}
