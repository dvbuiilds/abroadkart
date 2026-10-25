"use client";

import { useState, Suspense, type SyntheticEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@app/lib/auth-client";
import { Button } from "@app/components/ui/button";
import { Input } from "@app/components/ui/input";
import { Label } from "@app/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";

function SignUpFormInner({
  googleAuthEnabled,
}: {
  googleAuthEnabled: boolean;
}) {
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") ?? "/dashboard";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [googlePending, setGooglePending] = useState(false);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "");
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    try {
      const { error: err } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: callbackUrl,
      });
      if (err) {
        setError(err.message ?? "Sign up failed");
        setPending(false);
        return;
      }
      window.location.href = callbackUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setPending(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setGooglePending(true);
    try {
      const social = (
        authClient as unknown as {
          signIn: {
            social: (opts: {
              provider: string;
              callbackURL: string;
            }) => Promise<{ error?: { message?: string } }>;
          };
        }
      ).signIn.social;
      const { error: err } = await social({
        provider: "google",
        callbackURL: callbackUrl,
      });
      if (err) {
        setError(err.message ?? "Google sign-up failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google sign-up failed");
    } finally {
      setGooglePending(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Create an account
        </CardTitle>
        <CardDescription>
          Get started with AbroadKart. You&apos;ll be redirected to your
          dashboard after sign-up.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {googleAuthEnabled ? (
          <>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={googlePending || pending}
              onClick={() => void onGoogle()}
            >
              {googlePending ? "Redirecting…" : "Continue with Google"}
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>
          </>
        ) : null}
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sign-up-name">Full name</Label>
            <Input
              id="sign-up-name"
              name="name"
              required
              autoComplete="name"
              placeholder="Jane Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sign-up-email">Email</Label>
            <Input
              id="sign-up-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sign-up-password">Password</Label>
            <Input
              id="sign-up-password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
            />
            <p className="text-xs text-muted-foreground">
              Use at least 8 characters.
            </p>
          </div>
          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            className="w-full"
            disabled={pending || googlePending}
          >
            {pending ? "Creating account…" : "Sign up"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 border-t pt-6">
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export function SignUpPageClient({
  googleAuthEnabled,
}: {
  googleAuthEnabled: boolean;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Suspense
        fallback={<div className="text-muted-foreground text-sm">Loading…</div>}
      >
        <SignUpFormInner googleAuthEnabled={googleAuthEnabled} />
      </Suspense>
    </div>
  );
}
