import fs from "fs";
import path from "path";

const SITE_URL = "https://abroadkart.com";

// Function to fetch blog slugs from DB
const fetchBlogSlugs = async (): Promise<string[]> => {
  return ["first-blog", "second-blog", "third-blog"]; // Replace with DB query
};

// Generate Sitemap
export const generateSitemap = async () => {
  try {
    const blogSlugs = await fetchBlogSlugs();
    const staticPages = ["", "about", "contact", "services"];

    const urls = [
      ...staticPages.map((page) => `<url><loc>${SITE_URL}/${page}</loc></url>`),
      ...blogSlugs.map(
        (slug) => `<url><loc>${SITE_URL}/blog/${slug}</loc></url>`
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
