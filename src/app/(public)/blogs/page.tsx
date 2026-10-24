import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getPostSummaries } from "@app/lib/blog/repository";
import { pageWindow, parsePageParam, totalPages } from "@app/lib/blog/pagination";
import { buildListingMetadata } from "@app/lib/blog/seo";
import { BlogListingPage } from "@app/components/blog/BlogListingPage";

const TITLE = "Blog";
const DESCRIPTION =
  "Practical guides on universities, applications, tests, visas and costs for students planning to study abroad.";

type Props = { searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = parsePageParam((await searchParams).page) ?? 1;
  return buildListingMetadata({ path: "/blogs", title: TITLE, description: DESCRIPTION, page });
}

export default async function BlogIndexPage({ searchParams }: Props) {
  const page = parsePageParam((await searchParams).page);
  if (page === null) notFound();

  const [{ items, totalCount }, categories] = await Promise.all([
    getPostSummaries(pageWindow(page)),
    getCategories(),
  ]);

  const pages = totalPages(totalCount);
  if (page > pages) notFound();

  return (
    <BlogListingPage
      eyebrow="The AbroadKart Blog"
      title="Guides for your study abroad journey"
      intro="Practical advice on universities, applications, tests, visas and costs."
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blogs" }]}
      categories={categories}
      items={items}
      page={page}
      totalPages={pages}
      basePath="/blogs"
    />
  );
}
