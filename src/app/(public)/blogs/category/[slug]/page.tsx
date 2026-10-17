import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getCategoryBySlug, getPostSummaries } from "@app/lib/blog/repository";
import { pageWindow, parsePageParam, totalPages } from "@app/lib/blog/pagination";
import { buildListingMetadata } from "@app/lib/blog/seo";
import { BlogListingPage } from "@app/components/blog/BlogListingPage";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = parsePageParam((await searchParams).page) ?? 1;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  return buildListingMetadata({
    path: `/blogs/category/${category.slug}`,
    title: category.name,
    description: category.description || `Articles about ${category.name}.`,
    page,
  });
}

export default async function BlogCategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const page = parsePageParam((await searchParams).page);
  if (page === null) notFound();

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [{ items, totalCount }, categories] = await Promise.all([
    getPostSummaries({ ...pageWindow(page), categorySlug: slug }),
    getCategories(),
  ]);

  const pages = totalPages(totalCount);
  if (page > pages) notFound();

  return (
    <BlogListingPage
      eyebrow="Category"
      title={category.name}
      intro={category.description || `Articles about ${category.name}.`}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Blogs", href: "/blogs" },
        { label: category.name },
      ]}
      categories={categories}
      activeSlug={slug}
      items={items}
      page={page}
      totalPages={pages}
      basePath={`/blogs/category/${slug}`}
    />
  );
}
