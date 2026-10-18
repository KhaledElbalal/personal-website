import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "./env";

export const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || "http://localhost:3333";

// Fields the page reads as data (comparisons, params, URLs, code), not as
// display text — stega-encoding them would break the logic that uses them.
const DATA_KEYS = new Set([
  "kind", "style", "listItem", "tone", "language", "label", "filename", "highlightLines",
  "code", "output", "lines", "svg", "animation", "date", "startDate", "endDate", "name",
  "id", "url", "href", "alt", "category", "slug", "width", "height",
]);

/**
 * Drafts-aware client for Draft Mode (Presentation tool). Needs a read token
 * with Viewer access; stega-encodes display strings so the Studio can map a
 * click in the preview back to its field.
 */
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
  perspective: "drafts",
  stega: {
    enabled: true,
    studioUrl,
    filter: (props) => {
      const key = props.sourcePath.at(-1);
      if (typeof key === "string" && DATA_KEYS.has(key)) return false;
      return props.filterDefault(props);
    },
  },
});
