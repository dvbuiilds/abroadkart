import { createClerkClient, type ClerkClient } from "@clerk/backend";

let client: ClerkClient | null = null;

export function getClerkBackendClient(): ClerkClient | null {
  const secretKey = process.env.CLERK_SECRET_KEY;
  const publishableKey =
    process.env.CLERK_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
  if (!secretKey || !publishableKey) {
    return null;
  }
  if (!client) {
    client = createClerkClient({ secretKey, publishableKey });
  }
  return client;
}
