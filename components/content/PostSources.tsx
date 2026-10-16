import type { Citation } from "@/lib/citations";

/** End-of-post list of every cited primary source, in order of first mention. */
export function PostSources({ citations }: { citations: Citation[] }) {
  if (!citations.length) return null;
  return (
    <section aria-labelledby="post-sources" className="mt-14 border-t border-black/10 pt-8">
      <h2 id="post-sources" className="m-0 font-mono text-xl font-bold text-heading">
        <span className="text-accent">##</span> Sources
      </h2>
      <ol className="mt-5 flex list-none flex-col gap-3.5 p-0">
        {citations.map((c) => (
          <li key={c.key} id={`source-${c.n}`} className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline gap-2">
            <span className="font-mono text-[13px] font-bold text-muted">[{c.n}]</span>
            <span className="min-w-0">
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[14px] font-bold text-accent no-underline hover:underline"
              >
                {c.label}
              </a>
              {c.title ? <span className="font-body text-[14.5px] text-ink"> — {c.title}</span> : null}
              {c.detail ? <span className="block font-body text-[13px] text-muted">{c.detail}</span> : null}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
