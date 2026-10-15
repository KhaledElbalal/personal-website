import type { ReactNode } from "react";

type GiantLabelProps = {
  children?: ReactNode;
  className?: string;
};

/**
 * Oversized mono eyebrow (e.g. "FEATURED", "LATEST POSTS") that anchors the
 * Projects / Blog list sections. From md up it is giant, letter-spaced and
 * bleeds off the left gutter — place it inside an `overflow-hidden` section so
 * the bleed is clipped. Below md it is a plain section heading that wraps.
 */
export function GiantLabel({ children, className = "" }: GiantLabelProps) {
  return (
    <span
      className={`mb-4 block font-mono text-[1.75rem] font-bold leading-tight text-heading md:-ml-14 md:whitespace-nowrap md:text-[clamp(2.25rem,9vw,4rem)] md:leading-none md:tracking-[0.28em] ${className}`}
    >
      {children}
    </span>
  );
}
