"use client";

import { useCurrentUser } from "@app/hooks/useCurrentUser";
import { PendingRoleScreen } from "@app/components/auth/PendingRoleScreen";
import { Button } from "@app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import Link from "next/link";

/**
 * `/dashboard` body when server redirect did not apply (no portal role yet).
 */
export function DashboardPendingGate() {
  const { user, isLoading, isError, refetch } = useCurrentUser();

  if (isLoading) {
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
              We couldn&apos;t load your account. Try again or contact your
              administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button variant="outline" onClick={() => void refetch()}>
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

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Access pending</h1>
      <p className="max-w-md text-center text-gray-600">
        You don&apos;t have access to a dashboard yet. Please wait until you are
        assigned a role, or contact your administrator if you believe this is an
        error.
      </p>
    </div>
  );
}
