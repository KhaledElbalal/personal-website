"use client";

import Link from "next/link";
import { useState, ViewTransition, type CSSProperties } from "react";

import { DiagramThumb } from "@/components/content/DiagramThumb";

export type LedgerRow = {
  id: string;
  title: string;
  kind: string;
  year: string;
  summary?: string | null;
  href: string;
  slug: string;
  image?: string | null;
  svg?: string | null;
};

function Cover({ row, className = "" }: { row: LedgerRow; className?: string }) {
  if (row.svg) return <DiagramThumb svg={row.svg} className={className} />;
  if (row.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={row.image}
        alt=""
        width={840}
        height={630}
        loading="lazy"
        className={` object-cover ${className}`}
      />
    );
  }
  // No cover yet: say what the project is, in the page's own colours.
  return (
    <div
      aria-hidden="true"
      className={` flex items-end bg-[color:var(--color-maya-blue)] p-5 text-[1.0625rem] font-medium leading-snug text-[color:var(--color-xiketic)] ${className}`}
    >
      {row.summary || row.title}
    </div>
  );
}

/**
 * A quiet ledger: one plain row per project. Hovering or focusing a row keeps
 * it in full ink and moves its cover into the empty space on the right.
 * Phones get no hover; the first three projects show their cover above the row.
 */
export function WorkLedger({ rows }: { rows: LedgerRow[] }) {
  const [active, setActive] = useState(0);
  const [top, setTop] = useState(0);

  const pick = (i: number, el: HTMLElement) => {
    setActive(i);
    // Keep the 4:3 cover (≈330px at most) inside the ledger's own height.
    const room = (el.parentElement?.offsetHeight ?? 0) - 400;
    setTop(Math.max(0, Math.min(el.offsetTop, room)));
  };

  return (
    <div className="relative md:min-h-[360px]">
      <ul className="md:w-[62%]">
        {rows.map((r, i) => {
          const newYear = i > 0 && rows[i - 1].year !== r.year;
          return (
            <li
              key={r.id}
              className={newYear ? "md:mt-8" : ""}
              onMouseEnter={(e) => pick(i, e.currentTarget)}
              onFocus={(e) => pick(i, e.currentTarget)}
            >
              {i < 3 && (r.svg || r.image) ? (
                <Cover row={r} className="mb-3 aspect-[16/10] w-full md:hidden" />
              ) : null}
              <Link
                href={r.href}
                className={`grid min-h-[56px] grid-cols-[1fr_auto] items-center gap-x-6 py-2 no-underline md:min-h-16 md:grid-cols-[minmax(0,1fr)_8rem_3.5rem] ${
                  i === active ? "text-black" : "text-muted"
                }`}
              >
                <ViewTransition name={`title-${r.slug}`} share="morph" default="none">
                  <span
                    className={`text-[length:var(--step-row)] font-semibold leading-tight decoration-2 underline-offset-[6px] ${
                      i === active ? "md:underline" : ""
                    }`}
                  >
                    {r.title}
                  </span>
                </ViewTransition>
                <span className="col-start-1 row-start-2 text-sm md:col-start-2 md:row-start-1">
                  {r.kind}
                </span>
                <span className="col-start-2 row-start-1 text-sm tabular-nums md:col-start-3 md:text-right">
                  {r.year}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 hidden w-[33%] max-w-[520px] transition-transform duration-300 ease-out md:block"
        style={{ translate: `0 ${top}px` } as CSSProperties}
      >
        <Cover row={rows[active]} className="aspect-[4/3] w-full" />
      </div>
    </div>
  );
}
