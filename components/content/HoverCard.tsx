"use client";

import { type ReactNode, useEffect, useRef } from "react";

const GUTTER = 16;

/**
 * Anchor for an inline hover card (citations, margin notes). The card is the
 * descendant marked `data-card`; showing it is CSS (`group-hover/card`,
 * `group-focus-within/card`) or the caller's `open`. This only nudges the card
 * sideways so it stays inside the viewport near either edge, and reports
 * Escape / outside clicks so a tapped-open card can close.
 */
export function HoverCard({
  children,
  open = false,
  onDismiss,
}: {
  children: ReactNode;
  open?: boolean;
  onDismiss?: () => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const place = () => {
    const card = ref.current?.querySelector<HTMLElement>("[data-card]");
    if (!card) return;
    card.style.translate = "";
    const r = card.getBoundingClientRect();
    if (!r.width) return;
    const max = document.documentElement.clientWidth - GUTTER;
    const shift = r.right > max ? max - r.right : r.left < GUTTER ? GUTTER - r.left : 0;
    if (shift) card.style.translate = `${Math.round(shift)}px 0`;
  };

  useEffect(() => {
    if (!open) return;
    place();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onDismiss?.();
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && onDismiss?.();
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open, onDismiss]);

  return (
    <span ref={ref} className="group/card relative inline" onMouseEnter={place} onFocus={place}>
      {children}
    </span>
  );
}
