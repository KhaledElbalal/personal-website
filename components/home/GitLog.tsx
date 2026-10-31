"use client";

import { Fragment, useId, useState } from "react";

import type { TimelineEntry } from "@/components/content/Timeline";

// Figures are what a skimming reader wants: 100M+, 12h → 2h, 181 tables…
const FIGURE =
  /(\d[\d.,]*\s?(?:\+|M\+?|K\+?|%|h\b|hours?|minutes?|datasets?|tables?|-member)?)/g;

function Emphasis({ text }: { text: string }) {
  return (
    <>
      {text.split(FIGURE).map((part, i) =>
        i % 2 ? (
          <strong key={i} className="font-semibold text-black">
            {part}
          </strong>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

/** Detail becomes bullets when it holds several lines, else one sentence. */
function Detail({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    return (
      <ul className="m-0 flex list-disc flex-col gap-2 pl-5">
        {lines.map((l) => (
          <li key={l} className="pl-1">
            <Emphasis text={l} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="m-0">
      <Emphasis text={text} />
    </p>
  );
}

/**
 * The record as a git history: one line per commit on a branch of nodes, each
 * opening (like `git show`) to its detail. Pointing at a commit fills its
 * node, colours the branch below it and tints its message.
 */
export function GitLog({ entries }: { entries: TimelineEntry[] }) {
  // The newest commit starts open.
  const [open, setOpen] = useState<Set<string>>(
    () => new Set(entries[0] ? [entries[0].hash] : []),
  );
  const uid = useId();

  if (!entries.length) return null;

  const toggle = (hash: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(hash)) next.delete(hash);
      else next.add(hash);
      return next;
    });

  return (
    <section
      aria-labelledby="log-heading"
      className="page-margin bg-section pb-24 pt-16 md:pb-40 md:pt-24"
    >
      <div className="reveal mb-8">
        <h2
          id="log-heading"
          className="m-0 font-mono text-[1.0625rem] font-bold text-ink"
        >
          <span aria-hidden="true" className="text-[color:var(--accent-text)]">
            ${" "}
          </span>
          git log --oneline
        </h2>
      </div>

      <ol className="m-0 list-none p-0">
        {entries.map((e, i) => {
          const isOpen = open.has(e.hash);
          const panel = `${uid}-${e.hash}`;
          const head = e.ref === "HEAD";
          const last = i === entries.length - 1;
          return (
            <li
              key={e.hash}
              className="reveal group relative pl-10 md:pl-12"
            >
              {/* The branch runs from this node to the next; it takes the accent
                  while the commit is open or pointed at. */}
              {!last ? (
                <span
                  aria-hidden="true"
                  className={`absolute left-[8px] top-[25px] -bottom-[25px] w-1 transition-colors duration-500 ease-out md:left-[10px] ${
                    isOpen
                      ? "bg-[color:var(--color-maya-blue)]"
                      : "bg-[#cfeeff] group-hover:bg-[color:var(--color-maya-blue)]"
                  }`}
                />
              ) : null}
              {/* The node: solid dark, blue for HEAD, and it fills with the
                  accent and grows when the commit is open or pointed at. */}
              <span
                aria-hidden="true"
                className={`absolute left-0 top-[25px] z-10 block h-5 w-5 -translate-y-1/2 rounded-full transition-[transform,translate,scale,background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.2] md:left-[2px] ${
                  head || isOpen
                    ? "bg-[color:var(--color-tufts-blue)]"
                    : "bg-[color:var(--color-xiketic)] group-hover:bg-[color:var(--color-tufts-blue)]"
                }`}
              />

              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panel}
                onClick={() => toggle(e.hash)}
                className="grid min-h-[50px] w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-0 py-3 text-left md:grid-cols-[5.5rem_minmax(0,1fr)_7rem_1.5rem]"
              >
                <span className="col-span-2 font-mono text-sm text-muted md:col-span-1">
                  {e.hash}
                </span>
                <span className="min-w-0 font-mono text-[1.0625rem] font-bold text-black transition-colors duration-300 group-hover:text-[color:var(--accent-text)]">
                  {e.text}
                  {e.ref ? (
                    <span className="ml-3 text-[color:var(--accent-text)]">
                      ({e.ref})
                    </span>
                  ) : null}
                </span>
                <span className="text-sm tabular-nums text-muted md:text-right">
                  {e.date}
                </span>
                <span
                  aria-hidden="true"
                  className="relative hidden h-4 w-4 items-center justify-center md:flex"
                >
                  <span className="absolute h-[2px] w-4 bg-black" />
                  <span
                    className={`absolute h-4 w-[2px] bg-black transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isOpen ? "scale-y-0" : "scale-y-100"
                    }`}
                  />
                </span>
              </button>

              <div
                id={panel}
                role="region"
                inert={!isOpen}
                className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  {e.detail ? (
                    <div
                      className={`max-w-[80ch] pb-6 text-[1.0625rem] leading-relaxed text-ink transition-[opacity,translate] duration-500 ease-out md:ml-[calc(5.5rem+1.5rem)] ${
                        isOpen ? "translate-y-0 opacity-100 delay-100" : "-translate-y-1 opacity-0"
                      }`}
                    >
                      <Detail text={e.detail} />
                    </div>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
