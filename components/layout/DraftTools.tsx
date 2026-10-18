import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";

/**
 * Click-to-edit overlays + Studio navigation sync while Draft Mode is on
 * (the Studio's Presentation tool). Reading the cookie is dynamic, so render
 * this inside <Suspense> — the rest of the layout stays static.
 */
export async function DraftTools() {
  return (await draftMode()).isEnabled ? <VisualEditing /> : null;
}
