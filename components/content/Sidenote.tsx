"use client";

import { type ReactNode, useId, useState } from "react";

/**
 * Margin note. From xl up (inside `.post-body.has-sidenotes`) the note floats
 * into the right margin beside its line and is always visible; below that,
 * the number is a toggle that expands the note inline. Styles: app/globals.css.
 */
export function Sidenote({ n, note, children }: { n: number; note: string; children: ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <>
      {children}
      <button
        type="button"
        className="sn-toggle"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Margin note ${n}`}
        onClick={() => setOpen((v) => !v)}
      >
        {n}
      </button>
      <sup className="sn-num" aria-hidden="true">
        {n}
      </sup>
      <span id={id} className="sidenote" data-open={open || undefined} role="note">
        <span className="sn-label">{n}</span> {note}
      </span>
    </>
  );
}
