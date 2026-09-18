import Link from "next/link";

import { SOCIAL_LINKS } from "@/lib/social-links";

// Author bio keeps it to Github/LinkedIn — Codeforces doesn't fit "the author
// who writes these posts" framing the way it does in the site footer.
const AUTHOR_SOCIALS = SOCIAL_LINKS.filter((s) => s.label !== "Codeforces");

export function AuthorBio() {
  return (
    <div className="mt-14 flex items-center gap-6 rounded-[8px] bg-[color:var(--color-xiketic)] p-7 shadow-[var(--shadow-card-flat)]">
      <div
        aria-hidden="true"
        className="hidden h-[68px] w-[68px] shrink-0 rounded-full bg-[repeating-linear-gradient(135deg,rgba(247,247,255,0.12),rgba(247,247,255,0.12)_6px,rgba(247,247,255,0.05)_6px,rgba(247,247,255,0.05)_12px)] sm:block"
      />
      <div>
        <div className="font-mono text-xs text-accent-bright">$ whoami</div>
        <div className="mt-1.5 font-mono text-lg font-bold text-[color:var(--color-ghost-white)]">
          Khaled Elbalal
        </div>
        <p className="mt-2 max-w-prose font-body text-sm leading-[1.6] text-[color:rgba(247,247,255,0.65)]">
          Software Engineer at Cegedim, BSc Data Science from Cairo
          University. Writes up projects as notebooks so the numbers can
          defend themselves.
        </p>
        <div className="mt-3 flex gap-4">
          {AUTHOR_SOCIALS.map((s) => (
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
