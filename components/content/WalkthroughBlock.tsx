import type { ReactNode } from "react";

import { parsePages } from "@/components/content/DiagramFigure";
import { Walkthrough, type WalkStepView } from "@/components/content/Walkthrough";
import { stripNotation } from "@/lib/code-notation";
import { highlight, resolveLanguage } from "@/lib/highlight";
import { sanitizeSvg } from "@/lib/svg";

type Step = { _key: string; title?: string | null; text?: unknown[] | null; lines?: string | null; page?: number | null };
export type WalkthroughValue = {
  title?: string | null;
  code?: { language?: string | null; filename?: string | null; code?: string | null } | null;
  diagram?: { alt?: string | null; svg?: string | null; width?: number | null; pages?: string | null } | null;
  steps?: Step[] | null;
};

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Server half: highlights the code once per step and resolves each step's page. */
export async function WalkthroughBlock({
  value,
  renderText,
}: {
  value: WalkthroughValue;
  renderText: (text: unknown[]) => ReactNode;
}) {
  const steps = (value.steps ?? []).filter((s) => s.title);
  if (steps.length === 0) return null;

  const code = value.code?.code ?? "";
  const plain = code ? stripNotation(code).code : null;
  const known = resolveLanguage(value.code?.language);

  const pages = parsePages(value.diagram?.pages);
  if (!pages.length && value.diagram?.svg) {
    pages.push({ name: "Diagram", html: sanitizeSvg(value.diagram.svg), width: value.diagram.width ?? undefined });
  }

  // A step without a page keeps the previous step's page.
  const last = Math.max(pages.length - 1, 0);
  const pageOf = steps.reduce<number[]>((acc, s, i) => {
    acc.push(s.page ? Math.min(Math.max(s.page - 1, 0), last) : i ? acc[i - 1] : 0);
    return acc;
  }, []);

  const views: WalkStepView[] = await Promise.all(
    steps.map(async (s, i) => {
      const codeHtml = !code
        ? null
        : known
          ? await highlight(code, known, s.lines)
          : `<pre><code>${escape(plain ?? "")}</code></pre>`;
      return { key: s._key, title: s.title!, body: s.text?.length ? renderText(s.text) : null, codeHtml, page: pageOf[i] };
    }),
  );

  return (
    <Walkthrough
      title={value.title}
      steps={views}
      filename={value.code?.filename}
      plainCode={plain}
      pages={pages}
      alt={value.diagram?.alt ?? value.title ?? "Diagram"}
    />
  );
}
