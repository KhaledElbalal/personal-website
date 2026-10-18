import { defineLocations, type PresentationPluginOptions } from "sanity/presentation";

const section = (kind?: string) => (kind === "project" ? "/projects" : "/blog");

export const resolve: PresentationPluginOptions["resolve"] = {
  locations: {
    post: defineLocations({
      select: { title: "title", slug: "slug.current", kind: "kind" },
      resolve: (doc) => ({
        locations: [
          ...(doc?.slug ? [{ title: doc.title || "Untitled", href: `${section(doc.kind)}/${doc.slug}` }] : []),
          { title: doc?.kind === "project" ? "All projects" : "Blog index", href: section(doc?.kind) },
        ],
      }),
    }),
  },
};
