import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Markdown for assistants: /blog/<slug>.md (and Accept: text/markdown on the
  // normal URL) → app/md/[section]/[slug]/route.ts.
  async rewrites() {
    return [
      {
        source: "/:section(blog|projects)/:slug([^/.]+)\\.md",
        destination: "/md/:section/:slug",
      },
      {
        source: "/:section(blog|projects)/:slug([^/.]+)",
        destination: "/md/:section/:slug",
        has: [{ type: "header", key: "accept", value: "(.*)text/markdown(.*)" }],
      },
    ];
  },
  images: {
    // Sanity serves optimized assets from its CDN; allow-list the host so
    // `next/image` can optimize `urlFor(...)` sources.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
