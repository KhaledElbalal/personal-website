"use client";

import { useState } from "react";

/** Small "copy" control for a code card; copies the annotation-free text. */
export function CopyCode({ text, className = "" }: { text: string; className?: string }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("done");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2000);
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className={`rounded-[4px] px-2 py-1 font-mono text-[11px] font-bold text-[color:var(--color-ghost-white)]/70 transition-colors hover:bg-white/10 hover:text-[color:var(--color-ghost-white)] ${className}`}
    >
      {state === "done" ? "copied" : state === "failed" ? "copy failed" : "copy"}
    </button>
  );
}
