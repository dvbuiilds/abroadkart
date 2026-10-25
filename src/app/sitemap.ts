import type { MetadataRoute } from "next";
import { getPublicAppUrl } from "@app/lib/public-urls";
import { getCategories, getSitemapEntries } from "@app/lib/blog/repository";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getPublicAppUrl();

  const entries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blogs`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  try {
    const categories = await getCategories();
    for (const category of categories) {
      entries.push({
        url: `${baseUrl}/blogs/category/${category.slug}`,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  } catch {
    // Keystone unavailable at build time is OK; we still return static pages
  }

  try {
    const sitemapEntries = await getSitemapEntries();
    for (const post of sitemapEntries) {
      entries.push({
        url: `${baseUrl}/blogs/${post.slug}`,
        lastModified: new Date(post.modifiedAt),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch {
    // Keystone unavailable at build time is OK; we still return static pages
  }

  return entries;
}
