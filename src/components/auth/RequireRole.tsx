"use client";

import { type ReactNode } from "react";
import { useCurrentUser } from "@app/hooks/useCurrentUser";
import { SignInButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";

const CONSULTANT_ROLES = ["superAdmin", "consultantAdmin", "consultantAgent"];

export function RequireRole({
  roles = CONSULTANT_ROLES,
  children,
}: {
  roles?: string[];
  children: ReactNode;
}) {
  const { isSignedIn, isLoaded: clerkLoaded } = useAuth();
  const { user, isLoading } = useCurrentUser();

  if (!clerkLoaded || !isSignedIn) {
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
            <SignInButton mode="modal">
              <Button>Sign in</Button>
            </SignInButton>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  if (!user || !roles.includes(user.role ?? "")) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access the Consultant Portal.
              Your role: {user?.role ?? "unknown"}.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
