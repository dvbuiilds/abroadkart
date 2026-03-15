import { auth } from "@clerk/nextjs/server";
import { GET_CURRENT_USER } from "@app/graphql/queries/users";
import { createGraphQLClient } from "@app/lib/graphql";

type CurrentUserResult = {
  users: Array<{ role: string | null }>;
};

/**
 * Returns the dashboard path the user should be redirected to based on their role.
 * Used after Clerk sign-in to send users to the appropriate portal.
 */
export async function getDashboardRedirectPath(): Promise<string | null> {
  const { userId, getToken } = await auth();

  if (!userId) return null;

  const token = await getToken();
  if (!token) return null;

  try {
    const client = createGraphQLClient(token);
    const result = await client.request<CurrentUserResult>(GET_CURRENT_USER, {
      clerkUserId: userId,
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
