"use client";

import { useState } from "react";
import type { SyntheticEvent } from "react";
import { authClient } from "@app/lib/auth-client";
import Link from "next/link";

export default function BetterAuthSignUpPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
      });
      if (err) {
        setError(err.message ?? "Sign up failed");
        setPending(false);
        return;
      }
      window.location.href = "/ba/sign-in";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Sign up (admin testing)</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Creates both an auth user and a Keystone profile row. For the main
          app, use{" "}
          <Link href="/sign-up" className="underline">
            /sign-up
          </Link>
          .
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Name
          <input
            name="name"
            required
            className="border-input rounded-md border px-3 py-2"
          />
        </label>
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
            autoComplete="new-password"
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
          {pending ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="text-muted-foreground text-sm">
        Already have an account?{" "}
        <Link href="/ba/sign-in" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
