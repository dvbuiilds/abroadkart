"use client";

import { type ReactNode } from "react";
import { useCurrentUser } from "@app/hooks/useCurrentUser";
import Link from "next/link";
import { Button } from "@app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import { authClient } from "@app/lib/auth-client";
import { PendingRoleScreen } from "@app/components/auth/PendingRoleScreen";

const CONSULTANT_ROLES = ["superAdmin", "consultantAdmin", "consultantAgent"];

export function RequireRole({
  roles = CONSULTANT_ROLES,
  children,
}: {
  roles?: string[];
  children: ReactNode;
}) {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { user, isLoading, isError, refetch } = useCurrentUser();

  const isSignedIn = !!session?.user;

  if (!sessionPending && !isSignedIn) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>
              You need to sign in to access this area.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sessionPending || (isSignedIn && isLoading)) {
    return (
      <div
        className="flex min-h-[50vh] items-center justify-center"
        aria-busy="true"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Could not load your profile</CardTitle>
            <CardDescription>
              We couldn&apos;t verify your account. This may happen if your
              profile hasn&apos;t been set up in the system yet. Try again or
              contact your administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              Try again
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role === "pending") {
    return <PendingRoleScreen />;
  }

  if (!user || !roles.includes(user.role ?? "")) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access this area.
              {user ? (
                <> Your role: {user.role ?? "unknown"}.</>
              ) : (
                <>
                  {" "}
                  Your account may not be set up in the system yet. Contact your
                  administrator to get access.
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
