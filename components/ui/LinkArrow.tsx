import type { AnchorHTMLAttributes, ReactNode } from "react";

type LinkArrowProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
};

export function LinkArrow({
  children = "Let's get in touch",
  href = "#",
  className = "",
  ...rest
}: LinkArrowProps) {
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 border-b-2 border-ink pb-1.5 font-body text-lg font-bold leading-none text-ink no-underline transition-[gap] duration-100 hover:gap-3.5 focus-visible:gap-3.5 ${className}`}
      {...rest}
    >
      <span>{children}</span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M2 10L10 2M10 2H3.5M10 2V8.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
