"use client";

import Link from "next/link";
import { Button } from "@app/components/ui/button";

/**
 * Shown when a blog page cannot load its data, usually because Keystone is
 * unreachable. The raw error stays out of the page; it is logged by Next.
 */
export function BlogError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-gray-900">
        We couldn&apos;t load this page
      </h1>
      <p className="text-gray-600">
        The article library is taking longer than usual to respond. Please try again in a moment.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href="/blogs">All articles</Link>
        </Button>
      </div>
    </div>
  );
}
