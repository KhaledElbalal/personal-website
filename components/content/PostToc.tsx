"use client";

import { useEffect, useState } from "react";

import type { Heading } from "@/sanity/post";

export function PostToc({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string | undefined>(headings[0]?.id);

  useEffect(() => {
    if (!headings.length) return;
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -70% 0px" },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="sticky top-[140px] hidden max-w-[15rem] flex-col gap-2.5 pt-1.5 md:flex wide:mr-12 wide:w-[15rem] wide:justify-self-end"
    >
      <span className="font-body text-sm font-semibold text-black">
        Contents
      </span>
      {headings.map((h) => {
        const active = h.id === activeId;
        return (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`pl-2.5 font-body text-[0.9375rem] leading-snug no-underline transition-colors duration-150 ${
              active
                ? "font-semibold text-black underline decoration-2 underline-offset-4"
                : "text-ink hover:text-[color:var(--accent-text)]"
            } ${h.level === "h3" ? "ml-2.5" : ""}`}
          >
            {h.text}
          </a>
        );
      })}
    </nav>
  );
}
