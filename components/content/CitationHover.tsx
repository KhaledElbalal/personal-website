"use client";

import { type ReactNode, useRef } from "react";

const GUTTER = 16;

/**
 * Wrapper for a citation and its card. The card's show/hide is pure CSS
 * (hover / focus-within); this only nudges it sideways so it stays inside
 * the viewport when the citation sits near either edge.
 */
export function CitationHover({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  const place = () => {
    const card = ref.current?.querySelector<HTMLElement>("[role=tooltip]");
    if (!card) return;
    card.style.translate = "";
    const r = card.getBoundingClientRect();
    if (!r.width) return;
    const max = document.documentElement.clientWidth - GUTTER;
    const shift = r.right > max ? max - r.right : r.left < GUTTER ? GUTTER - r.left : 0;
    if (shift) card.style.translate = `${Math.round(shift)}px 0`;
  };
  return (
    <span ref={ref} className="group/cite relative inline" onMouseEnter={place} onFocus={place}>
      {children}
    </span>
  );
}
