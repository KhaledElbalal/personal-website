import type { AnchorHTMLAttributes, ReactNode } from "react";

type NavLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
  active?: boolean;
};

const base =
  "font-mono text-base leading-none whitespace-nowrap no-underline transition-[color,text-shadow] duration-200 active:-translate-x-px active:translate-y-px";

export function NavLink({
  children = "Home",
  href = "#",
  active = false,
  className = "",
  ...rest
}: NavLinkProps) {
  const state = active
    ? "font-bold text-accent"
    : "font-normal text-ink [text-shadow:var(--shadow-offset-social)] hover:text-accent hover:[text-shadow:none] focus-visible:text-accent focus-visible:[text-shadow:none]";

  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${base} ${state} ${className}`}
      {...rest}
    >
      <span aria-hidden="true" className="text-accent">
        ~/
      </span>
      <span className="lowercase">{children}</span>
    </a>
  );
}
