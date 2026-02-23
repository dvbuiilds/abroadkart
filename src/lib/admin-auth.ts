import { auth } from "@clerk/nextjs/server";
import { GET_CURRENT_USER } from "@app/graphql/queries/users";
import { createGraphQLClient } from "@app/lib/graphql";

type CurrentUserResult = {
  users: Array<{
    id: string;
    role: string | null;
  }>;
};

export type AdminAuthResult =
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | { status: "authorized"; token: string };

export async function getAdminAuth(): Promise<AdminAuthResult> {
  const { userId, getToken } = await auth();

  if (!userId) {
    return { status: "unauthenticated" };
  }

  const token = await getToken();
  if (!token) {
    return { status: "unauthenticated" };
  }

  try {
    const client = createGraphQLClient(token);
    const result = await client.request<CurrentUserResult>(GET_CURRENT_USER, {
      clerkUserId: userId,
    });

    const user = result.users?.[0];
    if (!user || user.role !== "superAdmin") {
      return { status: "forbidden" };
    }

    return { status: "authorized", token };
  } catch {
    return { status: "forbidden" };
  }
}
