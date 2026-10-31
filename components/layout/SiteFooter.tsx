import { SocialIcon, SocialLink } from "@/components/ui";
import { contactHref, resolveSocialLinks } from "@/lib/social-links";
import { SITE_NAME } from "@/lib/site";
import { sanityFetch } from "@/sanity/fetch";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries";
import type { SITE_SETTINGS_QUERY_RESULT } from "@/sanity.types";

/**
 * Contact and close, on a field of ink: one prompt, one field, then the name
 * at full width so the page ends the way it began. The field is a plain GET
 * form to a mailto: URL, so it opens the visitor's mail app with the message
 * written, with or without script.
 */
export async function SiteFooter() {
  const settings = await sanityFetch<SITE_SETTINGS_QUERY_RESULT>(
    SITE_SETTINGS_QUERY,
    {},
    ["siteSettings"],
  );
  const socials = resolveSocialLinks(settings?.socialLinks ?? undefined);
  const email = settings?.email;
  const copyright = settings?.footerText || "© 2026";
  const name = settings?.siteName || SITE_NAME;

  return (
    <footer
      id="contact"
      className="page-margin bg-[color:var(--color-xiketic)] pb-6 pt-24 text-on-accent md:pb-8 md:pt-40"
    >
      <div className="grid gap-16 md:grid-cols-12 md:gap-x-8">
      <div className="max-w-[520px] md:col-span-5">
        <p className="reveal text-[length:var(--step-lead)] font-medium leading-tight">
          <span className="block text-[color:#b9bccb]">What are you building?</span>
          <span className="block">Tell me about it.</span>
        </p>
        {email ? (
          <form action={`mailto:${email}`} method="get" className="reveal mt-7">
            <input type="hidden" name="subject" value="Hello from your website" />
            <div className="flex h-16 items-center bg-[color:var(--color-ghost-white)] pr-2">
              <label htmlFor="contact-message" className="sr-only">
                Your message
              </label>
              <input
                id="contact-message"
                name="body"
                type="text"
                placeholder="A line about the problem"
                autoComplete="off"
                className="no-ring h-full min-w-0 flex-1 bg-transparent px-5 text-[1.0625rem] text-ink placeholder:text-muted"
              />
              <button
                type="submit"
                aria-label="Open an email with this message"
                className="press inline-flex h-11 w-11 flex-none items-center justify-center bg-[color:var(--color-xiketic)] text-on-accent hover:bg-[color:var(--accent-text)]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M2 8h11M9 3.5 13.5 8 9 12.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </form>
        ) : null}
      </div>

      <ul className="reveal flex flex-col gap-3 md:col-span-5 md:col-start-8">
        {email ? (
          <li>
            <SocialLink href={contactHref(email)} className="break-all">
              <SocialIcon name="email" />
              {email}
            </SocialLink>
          </li>
        ) : null}
        {socials.map((s) => (
          <li key={s.label}>
            <SocialLink href={s.href} target="_blank" rel="noopener noreferrer">
              <SocialIcon name={s.label} />
              {s.label}
            </SocialLink>
          </li>
        ))}
      </ul>

      </div>

      <div className="fit-name mt-24 md:mt-40">
        <div
          aria-hidden="true"
          className="reveal flex flex-col font-body font-bold uppercase leading-[0.84] tracking-[-0.045em] text-accent-bright md:flex-row md:gap-[0.2em] md:whitespace-nowrap"
          style={{ fontSize: "var(--step-name)" }}
        >
          {name.split(" ").map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
      </div>
      <p className="mt-6 flex flex-wrap items-center gap-x-2 font-mono text-sm text-[color:#b9bccb]">
        <span aria-hidden="true" className="text-accent-bright">
          ⑂
        </span>
        main
        <span aria-hidden="true">/</span>
        <span className="font-bold text-on-accent">4f9a2e</span> {copyright}
      </p>
    </footer>
  );
}
