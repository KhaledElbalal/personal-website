import { stripNotation } from "@/lib/code-notation";
import { highlight } from "@/lib/highlight";

const PRE = "m-0 overflow-x-auto p-[18px] font-mono text-[13.5px] leading-[1.8] sm:px-6";

type CodeSourceProps = { code: string; language?: string | null; lines?: string | null };

/** Code cell body: Shiki-highlighted on the server, plain for unknown languages. */
export async function CodeSource({ code, language, lines }: CodeSourceProps) {
  const html = await highlight(code, language, lines);
  if (!html) {
    return (
      <pre className={`${PRE} text-[color:var(--color-ghost-white)]`}>
        <code>{stripNotation(code).code}</code>
      </pre>
    );
  }
  // Shiki emits <pre class="shiki"> with inline token colours; spacing, font
  // and the highlight/diff/focus line styles come from `.code-hl` in
  // app/globals.css.
  return <div className="code-hl" dangerouslySetInnerHTML={{ __html: html }} />;
}
