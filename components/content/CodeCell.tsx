import { CodeSource } from "@/components/content/CodeSource";
import { CopyCode } from "@/components/content/CopyCode";
import { stripNotation } from "@/lib/code-notation";

export type CodeValue = {
  label?: string | null;
  language?: string | null;
  filename?: string | null;
  highlightLines?: string | null;
  code?: string | null;
  output?: string | null;
};

/**
 * Dark code card: optional filename bar, highlighted source, copy control.
 * `attached` squares the top corners so it can sit under a tab bar.
 */
export function CodeCard({ value, attached = false }: { value: CodeValue; attached?: boolean }) {
  const code = value.code ?? "";
  const plain = stripNotation(code).code;
  return (
    <div
      className={`relative overflow-hidden bg-[color:var(--color-xiketic)] shadow-[var(--shadow-card-flat)] ${
        attached ? "rounded-b-[8px]" : "rounded-[8px]"
      }`}
    >
      {value.filename ? (
        <div className="flex items-center justify-between gap-3 border-b border-white/10 py-1.5 pl-[18px] pr-2 sm:pl-6">
          <span className="truncate font-mono text-[12px] text-[color:var(--color-ghost-white)]/75">
            {value.filename}
          </span>
          <CopyCode text={plain} />
        </div>
      ) : (
        <CopyCode text={plain} className="absolute right-2 top-2 z-10 bg-[color:var(--color-xiketic)]" />
      )}
      <CodeSource code={code} language={value.language} lines={value.highlightLines} />
    </div>
  );
}

export function CodeOutput({ output, className = "mt-2 sm:mt-0" }: { output: string; className?: string }) {
  return (
    <pre className={`${className} overflow-x-auto rounded-[4px] bg-[rgba(0,147,233,0.06)] p-[10px_16px] font-mono text-sm text-[color:var(--color-xiketic)]`}>
      {output}
    </pre>
  );
}

/** Notebook-style cell: "In [n]:" gutter label, code card, optional output. */
export function CodeCell({ value }: { value: CodeValue }) {
  if (!value.code) return null;
  const cellNumber = value.label?.match(/\d+/)?.[0];
  const outputLabel = cellNumber ? `Out[${cellNumber}]:` : "Out:";
  return (
    <div className="my-6 grid grid-cols-1 gap-2 sm:grid-cols-[64px_minmax(0,1fr)] sm:gap-y-3 sm:gap-x-3.5">
      {value.label ? (
        <span className="pt-4 font-mono text-[13px] font-bold text-accent">{value.label}</span>
      ) : (
        <span className="hidden sm:block" aria-hidden="true" />
      )}
      <CodeCard value={value} />
      {value.output ? (
        <>
          <span className="pt-3 font-mono text-[13px] font-bold text-muted">{outputLabel}</span>
          <CodeOutput output={value.output} />
        </>
      ) : null}
    </div>
  );
}
