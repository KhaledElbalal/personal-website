import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type NavLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
  active?: boolean;
  /** Passed to the router so view transitions can animate by direction. */
  transitionTypes?: string[];
  /** Draw the active underline as a named element that view transitions can
   * slide between tabs. Use on one nav only: names must be unique per page. */
  morph?: boolean;
};

const base =
  "whitespace-nowrap font-body text-[1.0625rem] font-medium leading-none no-underline underline-offset-[10px] decoration-2 transition-colors duration-150 hover:text-accent-text focus-visible:text-accent-text";

export function NavLink({
  children = "Home",
  href = "#",
  active = false,
  transitionTypes,
  morph = false,
  className = "",
  ...rest
}: NavLinkProps) {
  // The current page is underlined; no shadows, no colour-only state.
  const state = active
    ? morph
      ? "text-black"
      : "text-black underline"
    : "text-ink";

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      transitionTypes={transitionTypes}
      className={`relative ${base} ${state} ${className}`}
      {...rest}
    >
      {children}
      {active && morph ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-[7px] h-[3px] bg-black"
          style={{ viewTransitionName: "nav-underline" }}
        />
      ) : null}
    </Link>
  );
}
