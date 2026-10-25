/**
 * Runs once when the Next.js server boots. Not run during `next build`, and skipped
 * when DATABASE_URL is unset so local tooling without a database still works.
 */
export async function register() {
  // Positive guard, so the Node-only import below is dropped from the edge bundle.
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.DATABASE_URL) {
    const { ensureAuthSchema } = await import("@app/lib/auth-migrate");
    await ensureAuthSchema();
  }
}
