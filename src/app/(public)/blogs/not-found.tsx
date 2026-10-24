import Link from "next/link";

/** Shown for unknown listing pages and categories under /blogs. */
export default function BlogsNotFound() {
  return (
    <section className="mx-auto max-w-2xl px-4 pt-32 pb-24 text-center sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-4 text-gray-600">Browse our latest guides instead.</p>
      <Link
        href="/blogs"
        className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        Browse all articles
      </Link>
    </section>
  );
}
