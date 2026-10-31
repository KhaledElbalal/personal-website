import type { CSSProperties } from "react";

import type { Stage } from "@/lib/career";

// Flat palette fields. Text on each is the ink except on the dark one.
const FIELDS = [
  { bg: "var(--color-xiketic)", fg: "var(--color-ghost-white)" },
  { bg: "var(--color-tufts-blue)", fg: "var(--color-xiketic)" },
  { bg: "var(--color-maya-blue)", fg: "var(--color-xiketic)" },
  { bg: "var(--color-blue-jeans)", fg: "var(--color-xiketic)" },
];
const ORDER = ["First", "Then", "Then", "Next", "Now"];

/**
 * The career as one bar. Each stage's width follows how long it really took,
 * so a two-month internship is a sliver and the long jobs are the page.
 */
export function CareerBar({ stages }: { stages: Stage[] }) {
  if (!stages.length) return null;
  const last = stages.length - 1;

  return (
    <section aria-labelledby="career-heading" className="page-margin py-24 md:py-40">
      <h2
        id="career-heading"
        className="reveal mb-12 text-[length:var(--step-head)] font-bold leading-[0.95] tracking-[-0.03em] text-black md:mb-16"
      >
        Where the time went
      </h2>
      <ol className="flex flex-col gap-[6px] md:flex-row">
        {stages.map((s, i) => {
          const f = FIELDS[i % FIELDS.length];
          const order = i === last ? "Now" : (ORDER[i] ?? "Then");
          return (
            <li
              key={s.id}
              className="reveal flex min-w-0 flex-col gap-4 md:min-w-[12%] md:[flex-grow:var(--m)] md:basis-0"
              style={{ "--m": s.months, "--i": i } as CSSProperties}
            >
              <div
                className="h-[clamp(72px,calc(var(--m)*3px),220px)] p-5 text-[length:var(--step-lead)] font-semibold leading-tight md:h-[max(160px,22vh)]"
                style={{ background: f.bg, color: f.fg }}
              >
                {s.span}
              </div>
              <p className="max-w-[22ch] text-[1.0625rem] leading-snug text-ink">
                <strong className="font-semibold text-black">{order}.</strong>{" "}
                {s.title}
                {s.organization ? ` at ${s.organization}` : ""}.{" "}
                <span className="text-muted">{s.range}</span>
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
