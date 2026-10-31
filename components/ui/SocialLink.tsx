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
      className={`inline-flex items-center gap-2.5 whitespace-nowrap font-body text-[1.0625rem] font-medium leading-none underline decoration-2 underline-offset-4 transition-colors duration-150 hover:text-accent-bright focus-visible:text-accent-bright ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}
