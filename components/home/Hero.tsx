import type { ReactNode } from "react";

type HeroProps = {
  name: string;
  sentence: string;
  action: ReactNode;
  kind: string;
  links: { label: string; href: string }[];
};

/**
 * First screen: the name is the whole picture. It runs across the vertical
 * centre (stacked on a phone), each word rising from behind its own baseline;
 * the corners carry the sentence, the action, the kind of work and the links.
 */
export function Hero({ name, sentence, action, kind, links }: HeroProps) {
  const words = name.split(" ");

  return (
    <section
      aria-labelledby="hero-name"
      className="page-margin grid min-h-[calc(100svh-4.5rem)] grid-rows-[auto_1fr_auto] pb-6 pt-4 md:min-h-[calc(100svh-5rem)] md:pb-8 md:pt-6"
    >
      <div className="max-w-[36ch]">
        <p
          className="mask-line text-[1.125rem] leading-snug text-ink"
          style={{ "--d": 3 } as React.CSSProperties}
        >
          <span>{sentence}</span>
        </p>
        <div className="mt-4">{action}</div>
      </div>

      <div className="fit-name flex items-center">
        <h1
          id="hero-name"
          aria-label={name}
          className="name-monument flex flex-col font-body font-bold uppercase leading-[0.84] tracking-[-0.045em] text-heading md:flex-row md:gap-[0.2em] md:whitespace-nowrap"
          style={{ fontSize: "var(--step-name)" }}
        >
          {words.map((w, i) => (
            <span
              key={w}
              aria-hidden="true"
              className="mask-line"
              style={{ "--d": i } as React.CSSProperties}
            >
              <span>{w}</span>
            </span>
          ))}
        </h1>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 text-[1.0625rem] text-ink">
        <p>{kind}</p>
        <ul className="flex gap-6">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline decoration-2 underline-offset-4 hover:text-accent-text"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
