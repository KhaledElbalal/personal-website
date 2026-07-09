import type { ReactNode } from "react";

type GiantLabelProps = {
  children?: ReactNode;
  className?: string;
};

/**
 * Oversized mono eyebrow (e.g. "FEATURED", "LATEST POSTS") that anchors the
 * Projects / Blog list sections. Meant to bleed off the left gutter — place it
 * inside an `overflow-hidden` section so the bleed is clipped rather than
 * causing horizontal page scroll.
 */
export function GiantLabel({ children, className = "" }: GiantLabelProps) {
  return (
    <span
      className={`block whitespace-nowrap font-mono font-bold leading-none tracking-[0.28em] text-heading text-[clamp(2.25rem,9vw,4rem)] ${className}`}
    >
      {children}
    </span>
  );
}
