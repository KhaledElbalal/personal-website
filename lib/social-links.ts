import type { SITE_SETTINGS_QUERY_RESULT } from "@/sanity.types";

/** Used only when siteSettings.socialLinks is empty/unpublished. */
export const SOCIAL_LINKS = [
  { label: "Github", href: "https://github.com/KhaledElbalal" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "Codeforces", href: "https://codeforces.com/" },
] as const;

const PLATFORM_LABEL: Record<string, string> = {
  github: "Github",
  linkedin: "LinkedIn",
  codeforces: "Codeforces",
};

type SanitySocialLinks = NonNullable<SITE_SETTINGS_QUERY_RESULT>["socialLinks"];

/** Maps Sanity's {platform,url}[] shape to the {label,href}[] shape the
 * SocialLink/AuthorBio components render, falling back to SOCIAL_LINKS when
 * siteSettings hasn't been populated yet. */
export function resolveSocialLinks(links: SanitySocialLinks | undefined) {
  const rows = (links ?? [])
    .filter((l): l is { platform: string; url: string } & typeof l =>
      Boolean(l.platform && l.url),
    )
    .map((l) => ({
      label: PLATFORM_LABEL[l.platform] ?? l.platform,
      href: l.url,
    }));
  return rows.length ? rows : [...SOCIAL_LINKS];
}
