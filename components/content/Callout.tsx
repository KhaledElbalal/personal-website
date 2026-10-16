import type { ReactNode } from "react";

export type CalloutTone = "note" | "tip" | "warning" | "deep";

const TONES: Record<CalloutTone, { label: string; glyph: string; box: string; accent: string }> = {
  note: { label: "Note", glyph: "i", box: "border-[#0093e9] bg-[rgba(0,147,233,0.05)]", accent: "text-[#0076bb]" },
  tip: { label: "Tip", glyph: "✓", box: "border-[#0f8a64] bg-[rgba(15,138,100,0.06)]", accent: "text-[#0b7354]" },
  warning: { label: "Gotcha", glyph: "!", box: "border-[#b45309] bg-[rgba(180,83,9,0.06)]", accent: "text-[#9a4507]" },
  deep: { label: "Under the hood", glyph: "↓", box: "border-[color:var(--color-xiketic)] bg-section", accent: "text-ink" },
};

type CalloutProps = {
  tone?: string | null;
  title?: string | null;
  collapsed?: boolean | null;
  children: ReactNode;
};

/**
 * Aside box. Collapsed callouts render as a native <details> (no JS; browser
 * find-in-page still reaches the hidden text), the deep-dive pattern.
 */
export function Callout({ tone, title, collapsed, children }: CalloutProps) {
  const t = TONES[(tone as CalloutTone) in TONES ? (tone as CalloutTone) : "note"];
  const heading = (
    <span className="flex items-baseline gap-2.5">
      <span
        aria-hidden="true"
        className={`inline-flex h-5 w-5 shrink-0 translate-y-[3px] items-center justify-center rounded-full border-[1.5px] border-current font-mono text-[11px] font-bold ${t.accent}`}
      >
        {t.glyph}
      </span>
      <span className="min-w-0">
        <span className={`font-mono text-[12px] font-bold uppercase tracking-[0.14em] ${t.accent}`}>{t.label}</span>
        {title ? <span className="mt-0.5 block font-mono text-[15px] font-bold leading-snug text-heading">{title}</span> : null}
      </span>
    </span>
  );
  const body = <div className="callout-body mt-3 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{children}</div>;
  const box = `my-8 rounded-[8px] border-l-4 p-[18px_20px] sm:p-[20px_24px] ${t.box}`;

  if (collapsed && title) {
    return (
      <details className={`group ${box}`}>
        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 [&::-webkit-details-marker]:hidden">
          {heading}
          <span className="shrink-0 translate-y-1 font-mono text-[12px] font-bold text-muted">
            <span className="group-open:hidden">open +</span>
            <span className="hidden group-open:inline">close −</span>
          </span>
        </summary>
        {body}
      </details>
    );
  }
  return (
    <aside className={box} aria-label={title ? `${t.label}: ${title}` : t.label}>
      {heading}
      {body}
    </aside>
  );
}
