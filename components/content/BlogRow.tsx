import type { CSSProperties } from "react";

import { Tag } from "@/components/ui";

type BlogRowProps = {
  image?: string;
  category?: string;
  title?: string;
  body?: string;
  date?: string;
  path?: string;
  href?: string;
  className?: string;
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function BlogRow({
  image,
  category = "FRONTEND",
  title = "Designing & Developing Anne's Website",
  body = "A short teaser describing the project or post in a sentence or two.",
  date = "July 08, 2021 · 3 months",
  path,
  href = "#",
  className = "",
}: BlogRowProps) {
  const cmdPath = path ?? `~/${slugify(category)}/${slugify(title)}`;
  const cover: CSSProperties | undefined = image
    ? { backgroundImage: `url(${image})` }
    : undefined;

  return (
    <a
      href={href}
      className={`group grid grid-cols-1 items-start gap-6 border-t border-black/10 pt-6 no-underline md:grid-cols-[minmax(0,1fr)_260px] ${className}`}
    >
      <div className="flex min-w-0 flex-col items-start gap-3.5">
        <div className="flex items-center gap-4">
          <Tag size="outline">{category}</Tag>
          <span className="font-mono text-[12.5px] text-muted">{date}</span>
        </div>
        <h3 className="m-0 max-w-[620px] break-words font-mono text-[clamp(1.5rem,5vw,2rem)] font-bold leading-tight text-black transition-colors duration-150 group-hover:text-accent group-focus-visible:text-accent">
          {title}
        </h3>
        <p className="m-0 max-w-[560px] font-body text-base leading-[1.55] text-ink">
          {body}
        </p>
        <div className="max-h-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:mt-2 group-hover:max-h-6 group-hover:opacity-100 group-focus-visible:mt-2 group-focus-visible:max-h-6 group-focus-visible:opacity-100">
          <span className="whitespace-nowrap font-mono text-[13px] font-bold text-accent">
            <span className="text-muted">$</span> open {cmdPath}
            <span
              aria-hidden="true"
              className="ml-[0.18em] inline-block h-[0.88em] w-[0.22em] animate-caret-blink bg-accent-bright align-[-0.1em]"
            />
          </span>
        </div>
      </div>
      <div
        className="h-[210px] w-full rounded-[8px] bg-[color:var(--surface-placeholder)] bg-cover bg-center shadow-[var(--shadow-card-flat)] md:w-[260px]"
        style={cover}
      />
    </a>
  );
}
