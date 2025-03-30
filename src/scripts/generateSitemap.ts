import fs from "fs";
import path from "path";

interface XMLURLBlock {
  id: string;
  lastMod: string;
  changeFreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
}

const SITE_URL = "https://abroadkart.com";

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
  return [
    {
      id: "first-blog",
      lastMod: "2025-03-30",
      changeFreq: "yearly",
      priority: 1.0,
    },
    {
      id: "second-blog",
      lastMod: "2025-03-30",
      changeFreq: "yearly",
      priority: 1.0,
    },
    {
      id: "third-blog",
      lastMod: "2025-03-30",
      changeFreq: "yearly",
      priority: 1.0,
    },
  ]; // Replace with DB query
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
