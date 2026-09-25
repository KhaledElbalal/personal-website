import Link from "next/link";

import { contactHref, resolveSocialLinks } from "@/lib/social-links";
import { DEFAULT_HERO_INTRO, SITE_NAME } from "@/lib/site";
import { sanityFetch } from "@/sanity/fetch";
import { urlFor } from "@/sanity/image";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";
import type { SITE_SETTINGS_QUERY_RESULT } from "@/sanity.types";

export async function AuthorBio() {
  const settings = await sanityFetch<SITE_SETTINGS_QUERY_RESULT>(
    SITE_SETTINGS_QUERY,
    {},
    ["siteSettings"],
  );
  const name = settings?.siteName || SITE_NAME;
  const bio = settings?.authorBio || settings?.heroIntro || DEFAULT_HERO_INTRO;
  const role = settings?.authorRole;
  const email = settings?.email;
  const avatarUrl = settings?.avatar?.asset
    ? urlFor(settings.avatar).width(136).height(136).fit("crop").auto("format").url()
    : null;
  // Codeforces doesn't fit "the author who writes these posts" framing the
  // way it does in the site footer.
  const socials = resolveSocialLinks(settings?.socialLinks ?? undefined).filter(
    (s) => s.label !== "Codeforces",
  );

  return (
    <div className="mt-14 flex items-center gap-6 rounded-[8px] bg-[color:var(--color-xiketic)] p-7 shadow-[var(--shadow-card-flat)]">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Sanity CDN, sized via urlFor
        <img
          src={avatarUrl}
          alt={settings?.avatar?.alt || name}
          width={68}
          height={68}
          className="hidden h-[68px] w-[68px] shrink-0 rounded-full border-[1.5px] border-[color:var(--color-maya-blue)] object-cover sm:block"
        />
      ) : (
        <div
          aria-hidden="true"
          className="hidden h-[68px] w-[68px] shrink-0 rounded-full bg-[repeating-linear-gradient(135deg,rgba(247,247,255,0.12),rgba(247,247,255,0.12)_6px,rgba(247,247,255,0.05)_6px,rgba(247,247,255,0.05)_12px)] sm:block"
        />
      )}
      <div>
        <div className="font-mono text-xs text-accent-bright">$ whoami</div>
        <div className="mt-1.5 font-mono text-lg font-bold text-[color:var(--color-ghost-white)]">
          {name}
        </div>
        {role ? (
          <div className="mt-0.5 font-mono text-xs text-[color:rgba(247,247,255,0.65)]">{role}</div>
        ) : null}
        <p className="mt-2 max-w-prose font-body text-sm leading-[1.6] text-[color:rgba(247,247,255,0.65)]">
          {bio}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs font-bold text-accent-bright no-underline hover:underline"
            >
              {s.label}
            </a>
          ))}
          {email ? (
            <a
              href={contactHref(email)}
              className="font-mono text-xs font-bold text-accent-bright no-underline hover:underline"
            >
              contact →
            </a>
          ) : null}
          <Link
            href="/blog"
            className="font-mono text-xs font-bold text-accent-bright no-underline hover:underline"
          >
            all posts →
          </Link>
        </div>
      </div>
    </div>
  );
}
