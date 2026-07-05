import type { AnchorHTMLAttributes, ReactNode } from "react";

type SocialLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
};

export function SocialLink({
  children = "Github",
  href = "#",
  className = "",
  ...rest
}: SocialLinkProps) {
  return (
    <a
      href={href}
      className={`whitespace-nowrap font-mono text-lg font-bold leading-none text-black no-underline [text-shadow:var(--shadow-offset-social)] transition-[color,text-shadow] duration-200 hover:text-accent hover:[text-shadow:none] focus-visible:text-accent focus-visible:[text-shadow:none] active:-translate-x-px active:translate-y-px ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}
