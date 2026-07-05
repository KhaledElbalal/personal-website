import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    // Sanity serves optimized assets from its CDN; allow-list the host so
    // `next/image` can optimize `urlFor(...)` sources.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
