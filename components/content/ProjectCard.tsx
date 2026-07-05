import type { CSSProperties } from "react";

type ProjectCardProps = {
  image?: string;
  title?: string;
  path?: string;
  date?: string;
  description?: string;
  href?: string;
  className?: string;
};

export function ProjectCard({
  image,
  title = "Predicting Diabetes Using Logistic Regression",
  path = "~/ml/diabetes.ipynb",
  date = "Oct 2022",
  description = "",
  href = "#",
  className = "",
}: ProjectCardProps) {
  const cover: CSSProperties | undefined = image
    ? { backgroundImage: `url(${image})` }
    : undefined;

  return (
    <a
      href={href}
      aria-label={`Open project: ${title}`}
      className={`group relative block h-[344px] w-full overflow-hidden rounded-[8px] bg-page no-underline shadow-[var(--shadow-card),var(--shadow-card-glow)] ${className}`}
    >
      <div
        className="absolute inset-0 bg-[color:var(--surface-placeholder)] bg-cover bg-center"
        style={cover}
      />
      <div className="absolute inset-x-0 bottom-0 bg-page px-4 pb-3.5 pt-3">
        <div className="font-mono text-[15px] font-bold leading-tight text-black">
          {title}
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="overflow-hidden whitespace-nowrap font-mono text-[13px] font-bold text-accent">
            <span className="text-muted">$</span> open {path}↗
            <span
              aria-hidden="true"
              className="ml-[0.18em] inline-block h-[0.88em] w-[0.22em] animate-caret-blink bg-accent-bright align-[-0.1em]"
            />
          </span>
          <span className="whitespace-nowrap font-mono text-xs text-muted">
            {date}
          </span>
        </div>
        {description ? (
          <div className="max-h-0 overflow-hidden font-body text-[12.5px] leading-normal text-muted opacity-0 transition-all duration-200 group-hover:mt-2 group-hover:max-h-[72px] group-hover:opacity-100 group-focus-visible:mt-2 group-focus-visible:max-h-[72px] group-focus-visible:opacity-100">
            → {description}
          </div>
        ) : null}
      </div>
    </a>
  );
}
