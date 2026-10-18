import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";

import { openInPresentation } from "./actions/openInPresentation";
import { SITE_ORIGIN } from "./lib/siteOrigin";
import { resolve } from "./presentation/resolve";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

export default defineConfig({
  name: "default",
  title: "Khaled Ibrahim — Portfolio",

  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? "",
  dataset: process.env.SANITY_STUDIO_DATASET ?? "production",

  plugins: [
    structureTool({ structure }),
    // Live draft preview of the real site, with click-to-edit. Needs the site's
    // SANITY_API_READ_TOKEN (see studio/README.md → Live preview).
    presentationTool({
      resolve,
      previewUrl: {
        origin: SITE_ORIGIN,
        previewMode: { enable: "/api/draft-mode/enable" },
      },
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
    // One "New" entry per kind instead of a generic Project / Post.
    templates: (prev) => [
      ...prev.filter((t) => t.id !== "post"),
      { id: "post-blog", title: "Blog post", schemaType: "post", value: { kind: "post" } },
      { id: "post-project", title: "Project", schemaType: "post", value: { kind: "project" } },
    ],
  },

  document: {
    newDocumentOptions: (prev) => prev.filter((o) => o.templateId !== "post"),
    actions: (prev, { schemaType }) => (schemaType === "post" ? [...prev, openInPresentation] : prev),
  },
});
