import type { ReactNode } from "react";

import { HoverCard } from "@/components/content/HoverCard";
import type { Citation } from "@/lib/citations";

const KIND_LABEL: Record<Citation["kind"], string> = {
  pep: "Python Enhancement Proposal",
  wg21: "C++ standards paper",
  man: "Man page",
  rfc: "IETF RFC",
  link: "Source",
};

/**
 * Cited text: a link to the primary source with a hover/focus card (title,
 * status, date) pulled from the source itself. Shown by CSS; HoverCard
 * only keeps it on screen. On touch, a tap simply follows the link.
 */
export function CitationChip({ citation, markKey, children }: { citation: Citation; markKey: string; children: ReactNode }) {
  const cardId = `cite-${markKey}`;
  return (
    <HoverCard>
      <a
        href={citation.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-describedby={cardId}
        className="text-ink underline decoration-accent decoration-dotted decoration-2 underline-offset-[3px] hover:text-[color:var(--accent-text)]"
      >
        {children}
      </a>
      <span
        id={cardId}
        role="tooltip"
        data-card
        // display:none while hidden — an invisible card would still widen the
        // page's scroll area when the citation sits near the right edge.
        className="pointer-events-none absolute left-0 top-full z-30 mt-2 hidden w-[min(20rem,calc(100vw-3rem))] bg-white shadow-[0_8px_24px_rgba(18,20,32,0.16)] p-[12px_14px] text-left group-focus-within/card:block group-hover/card:block"
      >
        <span className="block font-body text-[13px] font-bold text-[color:var(--accent-text)]">
          {citation.label} <span className="font-normal normal-case tracking-normal text-muted">· {KIND_LABEL[citation.kind]}</span>
        </span>
        {citation.title ? (
          <span className="mt-1 block font-body text-[13.5px] font-bold leading-snug text-heading">{citation.title}</span>
        ) : null}
        {citation.detail ? <span className="mt-1 block font-body text-[12.5px] leading-snug text-muted">{citation.detail}</span> : null}
      </span>
    </HoverCard>
  );
}
