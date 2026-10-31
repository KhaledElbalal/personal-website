import type { ReactNode } from "react";

type PageHeaderProps = {
  as?: "h1" | "h2";
  title: ReactNode;
  intro?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  className?: string;
};

/**
 * Inner-page opener: the title set as the page's one big thing, rising from
 * behind its baseline; the sentence, action and facts sit under it on the
 * same 12-column grid as the rest of the page.
 */
export function PageHeader({
  as: Heading = "h1",
  title,
  intro,
  actions,
  aside,
  className = "",
}: PageHeaderProps) {
  return (
    <header className={`page-margin pb-16 pt-10 md:pb-24 md:pt-16 ${className}`}>
      <Heading
        className="m-0 whitespace-pre-line font-body font-bold uppercase leading-[0.84] tracking-[-0.045em] text-heading"
        style={{ fontSize: "var(--step-title)" }}
      >
        <span className="mask-line">
          <span>{title}</span>
        </span>
      </Heading>
      {intro || aside ? (
        <div className="mt-10 grid gap-8 md:mt-16 md:grid-cols-12 md:items-end">
          {intro ? (
            <p className="reveal m-0 max-w-[40ch] text-[1.125rem] leading-snug text-ink md:col-span-5">
              {intro}
            </p>
          ) : null}
          {aside ? <div className="md:col-span-6 md:col-start-7">{aside}</div> : null}
        </div>
      ) : null}
      {actions ? <div className="reveal mt-8">{actions}</div> : null}
    </header>
  );
}
