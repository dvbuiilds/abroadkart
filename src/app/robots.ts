import type { MetadataRoute } from "next";
import { getPublicAppUrl } from "@app/lib/public-urls";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getPublicAppUrl();
  return {
    rules: [
      {
        userAgent: "*",
        disallow: [
          "/api/",
          "/admin",
          "/consultant",
          "/fulfilment",
          "/dashboard",
          "/ba",
          "/sign-in",
          "/sign-up",
          "/forgot-password",
        ],
        allow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
