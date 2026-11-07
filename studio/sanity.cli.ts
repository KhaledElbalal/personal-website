import { defineCliConfig } from "sanity/cli";

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET,
  },
  // Served by the Next.js site at /studio (public/studio, built by the root
  // `build:studio`), so tldraw's domain-bound license key matches. Don't also
  // set `basePath` in sanity.config.ts — the workspace path is appended to this.
  project: { basePath: "/studio" },
  deployment: { appId: "jmds4lb2tede7r7l9wdgsmna", autoUpdates: false },
});
