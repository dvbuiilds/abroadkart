import type { NextConfig } from "next";
import { existsSync, readFileSync } from "fs";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Next would redirect /x/ to /x before the legacy rules run, making every
  // legacy URL with a trailing slash two hops. The legacy rules handle slashes.
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.freepik.com",
      },
      {
        protocol: "https",
        hostname: "cdn.abroadkart.com",
      },
    ],
  },
  redirects: async () => {
    const redirectsPath = path.join(process.cwd(), "src", "lib", "blog", "legacy-redirects.json");
    if (!existsSync(redirectsPath)) {
      return [];
    }
    const content = readFileSync(redirectsPath, "utf-8");
    return [
      ...JSON.parse(content),
      // Any other trailing-slash URL goes to its slash-less form in one hop.
      { source: "/:path+/", destination: "/:path+", permanent: true },
    ];
  },
};

export default nextConfig;
