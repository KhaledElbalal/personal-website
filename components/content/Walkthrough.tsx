"use client";

import { type ReactNode, useState } from "react";

import { CopyCode } from "@/components/content/CopyCode";
import { type DiagramPageView, DiagramViewer } from "@/components/content/DiagramViewer";

export type WalkStepView = {
  key: string;
  title: string;
  body: ReactNode;
  /** Code highlighted for this step's lines (server-rendered HTML), if any code. */
  codeHtml?: string | null;
  /** Index into `pages`, already carried forward from earlier steps. */
  page: number;
};

type WalkthroughProps = {
  title?: string | null;
  steps: WalkStepView[];
  filename?: string | null;
  plainCode?: string | null;
  pages: DiagramPageView[];
  alt: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Stepper: each step shows its text, highlights its lines in the shared code
 * and switches the diagram to its page. Everything for every step is in the
 * server HTML; this only picks which step is visible.
 */
export function Walkthrough({ title, steps, filename, plainCode, pages, alt }: WalkthroughProps) {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const page = pages[step.page];
  const hasCode = steps.some((s) => s.codeHtml);
  const go = (i: number) => setIndex(Math.max(0, Math.min(steps.length - 1, i)));

  const btn =
    "inline-flex h-8 items-center gap-1 rounded-[4px] border-[1.5px] border-[color:var(--color-xiketic)] bg-white px-3 font-mono text-xs font-bold text-ink shadow-[-3px_3px_0_rgba(0,147,233,0.30)] hover:text-accent disabled:pointer-events-none disabled:opacity-35 disabled:shadow-none";

  return (
    <section
      aria-roledescription="walkthrough"
      aria-label={title ?? "Walkthrough"}
      className="my-10 rounded-[8px] border-[1.5px] border-[color:var(--color-xiketic)] p-4 shadow-[-6px_6px_0_rgba(0,147,233,0.30)] sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-accent">Walkthrough</span>
          {title ? <p className="m-0 font-mono text-lg font-bold leading-snug text-heading">{title}</p> : null}
        </div>
        <ol className="m-0 flex list-none flex-wrap gap-1.5 p-0" aria-label="Steps">
          {steps.map((s, i) => (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => go(i)}
                aria-current={i === index ? "step" : undefined}
                aria-label={`Step ${i + 1}: ${s.title}`}
                className={`grid h-7 w-7 place-items-center rounded-full border-[1.5px] font-mono text-[11px] font-bold transition-colors ${
                  i === index
                    ? "border-accent bg-accent text-white"
                    : i < index
                      ? "border-accent text-accent"
                      : "border-black/25 text-muted hover:border-accent hover:text-accent"
                }`}
              >
                {i + 1}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-4 border-l-[3px] border-accent pl-4" aria-live="polite">
        <p className="m-0 font-mono text-[13px] font-bold text-heading">
          <span className="text-accent">
            {pad(index + 1)}
            <span className="text-muted">/{pad(steps.length)}</span>
          </span>{" "}
          {step.title}
        </p>
        <div className="walk-text mt-1 [&_p]:my-2 [&>*:last-child]:mb-0">{step.body}</div>
      </div>

      {/* Stacked, not side by side: diagrams need the full width to stay legible. */}
      <div className="mt-5 grid gap-4">
        {hasCode ? (
          <div className="relative overflow-hidden rounded-[8px] bg-[color:var(--color-xiketic)] shadow-[var(--shadow-card-flat)]">
            {filename ? (
              <div className="flex items-center justify-between gap-3 border-b border-white/10 py-1.5 pl-[18px] pr-2">
                <span className="truncate font-mono text-[12px] text-[color:var(--color-ghost-white)]/75">{filename}</span>
                {plainCode ? <CopyCode text={plainCode} /> : null}
              </div>
            ) : null}
            {step.codeHtml ? (
              <div className="code-hl walk-code" dangerouslySetInnerHTML={{ __html: step.codeHtml }} />
            ) : null}
          </div>
        ) : null}
        {page ? (
          <div className="[&>figure]:my-0">
            <DiagramViewer key={step.page} html={page.html} width={page.width} alt={`${alt} — ${page.name}`} animation="off" flows={[]} />
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button type="button" className={btn} onClick={() => go(index - 1)} disabled={index === 0}>
          ← Prev
        </button>
        <span className="font-mono text-[11px] text-muted">
          {page && pages.length > 1 ? page.name : ""}
        </span>
        <button type="button" className={btn} onClick={() => go(index + 1)} disabled={index === steps.length - 1}>
          Next →
        </button>
      </div>
    </section>
  );
}
