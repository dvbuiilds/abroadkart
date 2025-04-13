import { BlogsAPIResponse } from "@app/components/BlogTemplates/Template1/types";
import { apiEndPoint, apiPath } from "@app/config/api-config";
import { ResponseType } from "@app/types/api-types";
import { fetchWithTimeout } from "@app/utils/fetch-utils";
import fs from "fs";
import path from "path";

interface XMLURLBlock {
  id: string;
  lastMod: string;
  changeFreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}

const SITE_URL = "https://app.abroadkart.com";

const ChangeFreqValuesMap = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

const staticPages: XMLURLBlock[] = [
  { id: "", lastMod: "2025-03-30", changeFreq: "weekly", priority: 1.0 },
  {
    id: "about",
    lastMod: "2025-03-30",
    changeFreq: "monthly",
    priority: 0.9,
  },
  {
    id: "contact",
    lastMod: "2025-03-30",
    changeFreq: "monthly",
    priority: 0.7,
  },
  {
    id: "privacy-policy",
    lastMod: "2025-03-30",
    changeFreq: "yearly",
    priority: 0.3,
  },
  {
    id: "terms",
    lastMod: "2025-03-30",
    changeFreq: "yearly",
    priority: 0.3,
  },
];

// Function to fetch blog slugs from DB
const fetchBlogSlugs = async (): Promise<XMLURLBlock[]> => {
  const response: ResponseType<ResponseType<BlogsAPIResponse>> =
    await fetchWithTimeout(`${apiEndPoint}${apiPath.getAllBlogs}`);
  if (!response.success) {
    console.error("blogs API response not fetched. ", response.error);
    return [];
  }
  const jsonResponse = response.data;
  if (!jsonResponse.success) {
    console.error("blogs API response not fetched. ", jsonResponse.error);
    return [];
  }
  const blogs = jsonResponse.data.blogs;
  if (!blogs || !blogs.length) {
    console.error("blogs not found. ");
    return [];
  }
  const blogSlugs = blogs.map((blog) => ({
    id: blog.pageId,
    lastMod: blog.blogMetaData.lastModifiedDate,
    changeFreq: ChangeFreqValuesMap.YEARLY,
    priority: 1.0,
  }));
  return blogSlugs;
};

// Generate Sitemap
export const generateSitemap = async () => {
  try {
    const blogSlugs = await fetchBlogSlugs();

    const urls = [
      ...staticPages.map(
        (page) => `<url>
        <loc>${SITE_URL}/${page.id}</loc>
        <lastmod>${page.lastMod}</lastmod>
        <changefreq>${page.changeFreq}</changefreq>
        <priority>${page.priority}</priority>
      </url>`
      ),
      `<url>
        <loc>${SITE_URL}/blogs</loc>
        <lastmod>2025-03-30</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>`,
      ...blogSlugs.map(
        (blog) => `<url>
        <loc>${SITE_URL}/blogs/${blog.id}</loc>
        <lastmod>${blog.lastMod}</lastmod>
        <changefreq>${blog.changeFreq}</changefreq>
        <priority>1.0</priority>
        </url>`
      ),
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls.join("\n")}
  </urlset>`;

    fs.writeFileSync(
      path.join(process.cwd(), "public", "sitemap.xml"),
      sitemap
    );
    console.log("Sitemap generated Successfully!");
    return { success: true, data: null };
  } catch (error) {
    console.error("Error in sitemap generation. ", error);
    return {
      success: false,
      error: { message: "Error in sitemap generation.", status: 500 },
    };
  }
};
