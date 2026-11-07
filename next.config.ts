import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // React <ViewTransition> + route navigations as view transitions
  // (components/layout/RouteTransition.tsx, shared title morph on list → detail).
  experimental: { viewTransition: true },
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
      // Sanity Studio SPA (static build in public/studio). Array rewrites run
      // after public files, so real assets win and every other /studio/* route
      // falls back to the Studio's index.html for client-side routing.
      { source: "/studio", destination: "/studio/index.html" },
      { source: "/studio/:path*", destination: "/studio/index.html" },
    ];
  },
  async headers() {
    return [
      {
        // Studio JS/CSS bundles are content-hashed (favicons etc. are not).
        source: "/studio/static/:file([^/]+\\.(?:js|css))",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
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
