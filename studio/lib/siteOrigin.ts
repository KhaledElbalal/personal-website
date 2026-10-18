/** The Next.js site the Studio previews and queries (citation lookup). */
export const SITE_ORIGIN = (process.env.SANITY_STUDIO_PREVIEW_ORIGIN || "http://localhost:3000").replace(/\/$/, "");

/** Public path of a post on the site, or null until it has a slug. */
export function postPath(doc?: { kind?: string | null; slug?: { current?: string | null } | string | null } | null) {
  const slug = typeof doc?.slug === "string" ? doc.slug : doc?.slug?.current;
  if (!slug) return null;
  return `${doc?.kind === "project" ? "/projects" : "/blog"}/${slug}`;
}
