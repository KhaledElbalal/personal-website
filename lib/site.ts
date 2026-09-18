// Fallbacks only — siteSettings (Sanity) is the source of truth for
// siteName/heroHeading/heroIntro. These exist so metadata and the hero still
// render something reasonable if that singleton is ever empty/unpublished.
export const SITE_NAME = "Khaled Ibrahim";
export const SITE_TAGLINE = "";
export const SITE_DESCRIPTION =
  "Portfolio of Khaled Ibrahim. Software Engineer focusing on building high performance intelligent systems. With a BSc in Data Science from Cairo University and 2 years of experience in Cegedim.";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Home hero fallbacks (siteSettings.heroHeading/heroIntro take priority).
export const DEFAULT_HERO_HEADING = "Hello 👋,\nI am Khaled Ibrahim";
export const DEFAULT_HERO_INTRO =
  "I am a Software Engineer focusing on building high performance intelligent systems. With a BSc in Data Science from Cairo University and 2 years of experience in Cegedim.";

/** siteName from Sanity, falling back to SITE_NAME. Used by generated
 * icon/OG-image routes, which need a plain string rather than JSX props. */
export async function getSiteName(): Promise<string> {
  const { sanityFetch } = await import("@/sanity/fetch");
  const { SITE_SETTINGS_QUERY } = await import("@/sanity/queries");
  const settings = await sanityFetch<{ siteName: string | null } | null>(
    SITE_SETTINGS_QUERY,
    {},
    ["siteSettings"],
  );
  return settings?.siteName || SITE_NAME;
}
