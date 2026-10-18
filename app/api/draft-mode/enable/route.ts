import { defineEnableDraftMode } from "next-sanity/draft-mode";

import { client } from "@/sanity/client";

// Called by the Studio's Presentation tool (studio/sanity.config.ts →
// previewUrl.previewMode.enable). Validates the Studio's preview secret with a
// read token, then turns on Draft Mode for the iframe.
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
});
