import { SiteHeader } from "@/components/layout/SiteHeader";
import { contactHref } from "@/lib/social-links";
import { sanityFetch } from "@/sanity/fetch";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";
import type { SITE_SETTINGS_QUERY_RESULT } from "@/sanity.types";

/** Server wrapper: feeds the client header its Site Settings–driven bits. */
export async function SiteHeaderContainer() {
  const settings = await sanityFetch<SITE_SETTINGS_QUERY_RESULT>(
    SITE_SETTINGS_QUERY,
    {},
    ["siteSettings"],
  );
  return <SiteHeader contactHref={contactHref(settings?.email)} />;
}
