import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Docker image build only: standalone output copies just the files the server
  // traces, which keeps the runner image small. Local `yarn start` is unchanged.
  ...(process.env.NEXT_OUTPUT === "standalone" ? { output: "standalone" } : {}),
  // Legacy WordPress post URLs end in "/" and must 404 directly. Next's default
  // 308 would send them to the no-slash form first. middleware.ts keeps the
  // slash redirect for the static pages.
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
};

export default nextConfig;
