import type { ReactNode } from "react";

import { Blob } from "./Blob";

type PageHeaderProps = {
  as?: "h1" | "h2";
  title: ReactNode;
  intro?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  className?: string;
};

export function PageHeader({
  as: Heading = "h1",
  title,
  intro,
  actions,
  aside,
  className = "",
}: PageHeaderProps) {
  return (
    <header className={`relative overflow-hidden bg-section ${className}`}>
      {/* Soft blob in the open space beside the copy, centered on the content. */}
      <div className="pointer-events-none absolute inset-y-0 -right-16 flex items-center">
        <Blob size={480} interactive="follow" strength={32} />
      </div>
      {/* Fainter blob tucked behind the heading (desktop only). */}
      <div className="pointer-events-none absolute -left-24 -top-16 hidden sm:block">
        <Blob size={360} variant="cluster" interactive="follow" strength={28} />
      </div>
      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-6 px-6 py-10 sm:px-10 sm:py-12 md:flex-row md:items-center md:justify-between md:gap-12 md:py-16">
        <div className="max-w-[560px]">
          <Heading className="m-0 font-mono text-[clamp(2rem,6vw,2.75rem)] font-bold leading-[1.1] text-ink">
            {title}
          </Heading>
          {intro ? (
            <p className="mt-4 max-w-[440px] font-body text-base leading-[1.6] text-ink">
              {intro}
            </p>
          ) : null}
          {actions ? <div className="mt-6">{actions}</div> : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
    </header>
  );
}
