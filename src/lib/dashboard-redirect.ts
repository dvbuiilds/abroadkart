import { GET_CURRENT_USER } from "@app/graphql/queries/users";
import { createGraphQLClient } from "@app/lib/graphql";
import {
  getAuthSessionFromHeaders,
  getBetterAuthJwtFromHeaders,
} from "@app/lib/auth-server";

type CurrentUserResult = {
  users: Array<{ role: string | null }>;
};

/**
 * Returns the dashboard path the user should be redirected to based on their role.
 */
export async function getDashboardRedirectPath(): Promise<string | null> {
  const session = await getAuthSessionFromHeaders();
  const userId = session?.user?.id;

  if (!userId) return null;

  const token = await getBetterAuthJwtFromHeaders();
  if (!token) return null;

  try {
    const client = createGraphQLClient(token);
    const result = await client.request<CurrentUserResult>(GET_CURRENT_USER, {
      authUserId: userId,
    });

    const role = result.users?.[0]?.role ?? null;

    switch (role) {
      case "superAdmin":
        return "/admin";
      case "fulfilment":
        return "/fulfilment/dashboard";
      case "consultantAdmin":
      case "consultantAgent":
        return "/consultant/dashboard";
      default:
        return null;
    }
  } catch {
    return null;
  }
}
