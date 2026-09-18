import { PortableText, type PortableTextComponents } from "next-sanity";

import { urlFor } from "@/sanity/image";
import type { POST_BY_SLUG_QUERY_RESULT } from "@/sanity.types";

type PostBodyValue = NonNullable<POST_BY_SLUG_QUERY_RESULT>["body"];

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const url = value?.asset ? urlFor(value).width(1200).url() : null;
      if (!url) return null;
      return (
        // eslint-disable-next-line @next/next/no-img-element -- Sanity CDN, sized via urlFor
        <img
          src={url}
          alt={value.alt ?? ""}
          className="my-8 w-full rounded-[8px]"
        />
      );
    },
    code: ({ value }) => {
      if (!value?.code) return null;
      const cellNumber = value.label?.match(/\d+/)?.[0];
      const outputLabel = cellNumber ? `Out[${cellNumber}]:` : "Out:";
      return (
        <div className="my-6 grid grid-cols-1 gap-2 sm:grid-cols-[64px_minmax(0,1fr)] sm:gap-y-3 sm:gap-x-3.5">
          {value.label ? (
            <span className="pt-4 font-mono text-[13px] font-bold text-accent">
              {value.label}
            </span>
          ) : (
            <span className="hidden sm:block" aria-hidden="true" />
          )}
          <div className="overflow-hidden rounded-[8px] bg-[color:var(--color-xiketic)] shadow-[var(--shadow-card-flat)]">
            <pre className="overflow-x-auto p-[18px] font-mono text-[13.5px] leading-[1.8] text-[color:var(--color-ghost-white)] sm:px-6">
              <code>{value.code}</code>
            </pre>
          </div>
          {value.output ? (
            <>
              <span className="pt-3 font-mono text-[13px] font-bold text-muted">
                {outputLabel}
              </span>
              <pre className="mt-2 overflow-x-auto rounded-[4px] bg-[rgba(0,103,168,0.06)] p-[10px_16px] font-mono text-sm text-[color:var(--color-xiketic)] sm:mt-0">
                {value.output}
              </pre>
            </>
          ) : null}
        </div>
      );
    },
  },
  block: {
    h2: ({ children, value }) => (
      <h2
        id={`h-${value._key}`}
        className="mb-3 mt-10 scroll-mt-32 font-mono text-2xl font-bold text-heading"
      >
        <span className="text-accent">##</span> {children}
      </h2>
    ),
    h3: ({ children, value }) => (
      <h3
        id={`h-${value._key}`}
        className="mb-2 mt-8 scroll-mt-32 font-mono text-xl font-bold text-heading"
      >
        <span className="text-accent">###</span> {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="my-4 font-body text-base leading-[1.7] text-ink">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-10 rounded-[8px] border-[1.5px] border-[color:var(--color-xiketic)] p-[26px_30px] shadow-[-6px_6px_0_rgba(0,103,168,0.30)]">
        <p className="m-0 font-mono text-lg font-bold leading-[1.5] text-heading">
          {children}
        </p>
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }) => (
      <a
        href={value?.href}
        className="text-accent underline underline-offset-2"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="my-4 list-disc pl-6 font-body text-ink">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="my-4 list-decimal pl-6 font-body text-ink">{children}</ol>
    ),
  },
};

export function PostBody({ value }: { value: PostBodyValue }) {
  if (!value) return null;
  return <PortableText value={value} components={components} />;
}
