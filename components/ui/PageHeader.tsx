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
      <Blob
        size={360}
        interactive="follow"
        strength={36}
        className="absolute -left-20 -top-24"
      />
      <Blob
        size={340}
        variant="cluster"
        interactive="follow"
        strength={36}
        className="absolute -right-16 top-0"
      />
      <div className="relative mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-16 sm:px-10 md:flex-row md:items-center md:justify-between md:py-20">
        <div className="max-w-[600px]">
          <Heading className="m-0 font-mono text-[clamp(2rem,7vw,3rem)] font-bold leading-[1.1] text-ink">
            {title}
          </Heading>
          {intro ? (
            <p className="mt-5 max-w-[440px] font-body text-base leading-[1.6] text-ink md:text-[18px]">
              {intro}
            </p>
          ) : null}
          {actions ? <div className="mt-7">{actions}</div> : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
    </header>
  );
}
