import { SocialLink, Wordmark } from "@/components/ui";
import { resolveSocialLinks } from "@/lib/social-links";
import { sanityFetch } from "@/sanity/fetch";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";
import type { SITE_SETTINGS_QUERY_RESULT } from "@/sanity.types";

export async function SiteFooter() {
  const settings = await sanityFetch<SITE_SETTINGS_QUERY_RESULT>(
    SITE_SETTINGS_QUERY,
    {},
    ["siteSettings"],
  );
  const socials = resolveSocialLinks(settings?.socialLinks ?? undefined);
  const copyright = settings?.footerText || "© 2026";

  return (
    <footer id="contact" className="bg-page">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-[18px] px-6 py-14 sm:px-10">
        <span className="text-[30px]">
          <Wordmark />
        </span>
        <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
          {socials.map((s) => (
            <li key={s.label}>
              <SocialLink href={s.href} target="_blank" rel="noopener noreferrer">
                {s.label}
              </SocialLink>
            </li>
          ))}
        </ul>
        <span className="flex items-center gap-2 font-mono text-[13px] text-muted">
          <span aria-hidden="true" className="text-accent">
            ⑂
          </span>{" "}
          main
          <span aria-hidden="true" className="text-black/25">
            /
          </span>
          <span className="font-bold text-black">4f9a2e</span> {copyright}
        </span>
      </div>
    </footer>
  );
}
