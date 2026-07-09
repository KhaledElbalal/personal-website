import { PortableText, type PortableTextComponents } from "next-sanity";

import { urlFor } from "@/sanity/image";
import type { PROJECT_BY_SLUG_QUERY_RESULT } from "@/sanity.types";

type ProjectBodyValue = NonNullable<PROJECT_BY_SLUG_QUERY_RESULT>["body"];

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
  },
  block: {
    h2: ({ children }) => (
      <h2 className="mb-3 mt-10 font-mono text-2xl font-bold text-heading">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-2 mt-8 font-mono text-xl font-bold text-heading">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="my-4 font-body text-base leading-[1.7] text-ink">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-2 border-accent pl-4 font-body italic text-muted">
        {children}
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

export function ProjectBody({ value }: { value: ProjectBodyValue }) {
  if (!value) return null;
  return <PortableText value={value} components={components} />;
}
