"use client";

import { BlogError } from "@app/components/blog/BlogError";

export default function BlogRouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <BlogError error={error} reset={reset} />;
}
