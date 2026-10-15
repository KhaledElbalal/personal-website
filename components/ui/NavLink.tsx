import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type NavLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
  active?: boolean;
};

// Same treatment as the footer's SocialLink (bold Space Mono, blue offset
// shadow that drops away on hover); text-base until lg so the header row
// still fits beside the wordmark and Contact button at md.
const base =
  "whitespace-nowrap font-mono text-base font-bold leading-none no-underline transition-[color,text-shadow] duration-200 active:-translate-x-px active:translate-y-px lg:text-lg";

export function NavLink({
  children = "Home",
  href = "#",
  active = false,
  className = "",
  ...rest
}: NavLinkProps) {
  // Current page reads as the hover state: accent colour, shadow gone.
  const state = active
    ? "text-accent"
    : "text-black [text-shadow:var(--shadow-offset-social)] hover:text-accent hover:[text-shadow:none] focus-visible:text-accent focus-visible:[text-shadow:none]";

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${base} ${state} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}
