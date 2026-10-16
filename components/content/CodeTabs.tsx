"use client";

import { type KeyboardEvent, type ReactNode, useId, useRef, useState, useSyncExternalStore } from "react";

// Tab groups sync by label across the page: choosing "C++20" in one block
// switches every block that has a "C++20" tab (groups without it keep their
// own choice). Page-lifetime only.
let picked: string | null = null;
const listeners = new Set<() => void>();
const pickedStore = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  get: () => picked,
  set(label: string) {
    picked = label;
    listeners.forEach((fn) => fn());
  },
};

type CodeTabsProps = { labels: string[]; caption?: string | null; children: ReactNode[] };

export function CodeTabs({ labels, caption, children }: CodeTabsProps) {
  const id = useId();
  const [own, setOwn] = useState(0);
  const synced = useSyncExternalStore(pickedStore.subscribe, pickedStore.get, () => null);
  const syncedIndex = synced ? labels.indexOf(synced) : -1;
  const active = syncedIndex >= 0 ? syncedIndex : own;
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (i: number, focus = false) => {
    setOwn(i);
    pickedStore.set(labels[i]);
    if (focus) tabs.current[i]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const last = labels.length - 1;
    const next =
      e.key === "ArrowRight" ? (active === last ? 0 : active + 1)
      : e.key === "ArrowLeft" ? (active === 0 ? last : active - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    select(next, true);
  };

  return (
    <figure className="my-6">
      <div
        role="tablist"
        aria-label={caption ?? "Code variants"}
        className="flex gap-1 overflow-x-auto rounded-t-[8px] border-b border-white/10 bg-[color:var(--color-xiketic)] px-2 pt-2"
      >
        {labels.map((label, i) => {
          const selected = i === active;
          return (
            <button
              key={`${label}-${i}`}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${id}-panel-${i}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(i)}
              onKeyDown={onKeyDown}
              className={`-mb-px whitespace-nowrap border-b-2 px-3 pb-2 pt-1.5 font-mono text-[12.5px] font-bold transition-colors ${
                selected
                  ? "border-[color:var(--color-maya-blue)] text-[color:var(--color-ghost-white)]"
                  : "border-transparent text-[color:var(--color-ghost-white)]/55 hover:text-[color:var(--color-ghost-white)]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      {children.map((panel, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== active}
        >
          {panel}
        </div>
      ))}
      {caption ? (
        <figcaption className="mt-2 font-mono text-[12px] text-muted">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
