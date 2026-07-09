import { SocialLink, Wordmark } from "@/components/ui";

const SOCIALS = [
  { label: "Github", href: "https://github.com/KhaledElbalal" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "Codeforces", href: "https://codeforces.com/" },
];

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-page">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-[18px] px-6 py-14 sm:px-10">
        <span className="text-[30px]">
          <Wordmark />
        </span>
        <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
          {SOCIALS.map((s) => (
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
          <span className="font-bold text-black">4f9a2e</span> © 2026
        </span>
      </div>
    </footer>
  );
}
