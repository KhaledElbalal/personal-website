import { PortableText, type PortableTextComponents } from "next-sanity";

import { Callout } from "@/components/content/Callout";
import { CitationChip } from "@/components/content/CitationChip";
import {
  CodeCard,
  CodeCell,
  CodeOutput,
  type CodeValue,
} from "@/components/content/CodeCell";
import { CodeTabs } from "@/components/content/CodeTabs";
import { DiagramFigure } from "@/components/content/DiagramFigure";
import { Sidenote } from "@/components/content/Sidenote";
import { WalkthroughBlock, type WalkthroughValue } from "@/components/content/WalkthroughBlock";
import type { PostNotes } from "@/lib/citations";
import { urlFor } from "@/sanity/image";
import type { POST_BY_SLUG_QUERY_RESULT } from "@/sanity.types";

type PostBodyValue = NonNullable<POST_BY_SLUG_QUERY_RESULT>["body"];

function buildComponents(
  notes?: Pick<PostNotes, "citationByMark" | "sidenoteByMark">,
): PortableTextComponents {
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
      diagram: ({ value }) => {
        if (!value?.svg) return null;
        return (
          <DiagramFigure
            svg={value.svg}
            alt={value.alt ?? ""}
            caption={value.caption}
            width={value.width}
            animation={value.animation}
            animateFlow={value.animateFlow}
            flows={value.flows}
            pages={value.pages}
          />
        );
      },
      code: ({ value }) => <CodeCell value={value} />,
      codeTabs: ({ value }) => {
        const tabs = (
          (value?.tabs ?? []) as (CodeValue & { _key: string })[]
        ).filter((t) => t.code);
        if (!tabs.length) return null;
        return (
          <CodeTabs
            labels={tabs.map((t, i) => t.label || t.language || `Tab ${i + 1}`)}
            caption={value.caption}
          >
            {tabs.map((t) => (
              <div key={t._key}>
                <CodeCard value={t} attached />
                {t.output ? (
                  <CodeOutput output={t.output} className="mt-2" />
                ) : null}
              </div>
            ))}
          </CodeTabs>
        );
      },
      walkthrough: ({ value }) => (
        <WalkthroughBlock
          value={value as WalkthroughValue}
          renderText={(text) => (
            <PortableText value={text as PostBodyValue & object} components={components} />
          )}
        />
      ),
      callout: ({ value }) => {
        if (!value?.body?.length) return null;
        return (
          <Callout
            tone={value.tone}
            title={value.title}
            collapsed={value.collapsed}
          >
            <PortableText value={value.body} components={components} />
          </Callout>
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
        <blockquote className="my-10 rounded-[8px] border-[1.5px] border-[color:var(--color-xiketic)] p-[26px_30px] shadow-[-6px_6px_0_rgba(0,147,233,0.30)]">
          <p className="m-0 font-mono text-lg font-bold leading-[1.5] text-heading">
            {children}
          </p>
        </blockquote>
      ),
    },
    marks: {
      citation: ({ children, markKey }) => {
        const citation = markKey ? notes?.citationByMark[markKey] : undefined;
        return citation ? (
          <CitationChip citation={citation} markKey={markKey!}>
            {children}
          </CitationChip>
        ) : (
          <>{children}</>
        );
      },
      sidenote: ({ children, value, markKey }) => {
        const n = markKey ? notes?.sidenoteByMark[markKey] : undefined;
        return n && value?.note ? (
          <Sidenote n={n} note={value.note}>
            {children}
          </Sidenote>
        ) : (
          <>{children}</>
        );
      },
      code: ({ children }) => (
        <code className="rounded-[4px] bg-[rgba(0,147,233,0.08)] px-[0.35em] py-[0.1em] font-mono text-[0.9em] text-ink">
          {children}
        </code>
      ),
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
        <ol className="my-4 list-decimal pl-6 font-body text-ink">
          {children}
        </ol>
      ),
    },
  };
  return components;
}

export function PostBody({
  value,
  notes,
}: {
  value: PostBodyValue;
  notes?: PostNotes;
}) {
  if (!value) return null;
  const hasSidenotes = Boolean(
    notes && Object.keys(notes.sidenoteByMark).length,
  );
  return (
    <div className={`post-body${hasSidenotes ? " has-sidenotes" : ""}`}>
      <PortableText value={value} components={buildComponents(notes)} />
    </div>
  );
}
