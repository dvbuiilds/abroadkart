"use client";

import { useState, Suspense } from "react";
import type { SyntheticEvent } from "react";
import { authClient } from "@app/lib/auth-client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function BetterAuthSignInForm() {
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") ?? "/";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    try {
      const { error: err } = await authClient.signIn.email({
        email,
        password,
        callbackURL: callbackUrl,
      });
      if (err) {
        setError(err.message ?? "Sign in failed");
        setPending(false);
        return;
      }
      window.location.href = callbackUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin SSO (better-auth)</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Use this flow for Keystone admin SSO. The main app sign-in is at{" "}
          <Link href="/sign-in" className="underline">
            /sign-in
          </Link>
          .
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="border-input rounded-md border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="border-input rounded-md border px-3 py-2"
          />
        </label>
        {error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-muted-foreground text-sm">
        No account?{" "}
        <Link href="/ba/sign-up" className="underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function BetterAuthSignInPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <BetterAuthSignInForm />
    </Suspense>
  );
}
