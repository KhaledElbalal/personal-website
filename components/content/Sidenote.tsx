"use client";

import { type ReactNode, useCallback, useId, useState } from "react";

import { HoverCard } from "@/components/content/HoverCard";

/**
 * Margin note as a hover card: a small number after the annotated words that
 * shows the note on hover or keyboard focus, and toggles it on tap. Nothing
 * is reserved in the layout, so notes cost no space until read.
 */
export function Sidenote({ n, note, children }: { n: number; note: string; children: ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const dismiss = useCallback(() => setOpen(false), []);
  return (
    <>
      {children}
      <HoverCard open={open} onDismiss={dismiss}>
        <button
          type="button"
          className="sn-toggle"
          aria-expanded={open}
          aria-describedby={id}
          aria-label={`Note ${n}`}
          onClick={() => setOpen((v) => !v)}
        >
          {n}
        </button>
        <span
          id={id}
          role="tooltip"
          data-card
          className={`absolute left-0 top-full z-30 mt-2 w-[min(18rem,calc(100vw-3rem))] rounded-[8px] border-[1.5px] border-[color:var(--color-xiketic)] bg-white p-[10px_14px] text-left font-body text-[13.5px] leading-[1.55] text-ink shadow-[-4px_4px_0_rgba(0,147,233,0.30)] group-focus-within/card:block group-hover/card:block ${
            open ? "block" : "hidden"
          }`}
        >
          <span className="mr-1.5 font-mono text-[11px] font-bold text-accent">{n}</span>
          {note}
        </span>
      </HoverCard>
    </>
  );
}
