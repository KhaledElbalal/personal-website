import type { Editor } from "tldraw";

import { buildGraph, type DiagramGraph, exportFlows, type Flow } from "./behavior";

export type DiagramPage = { name: string; svg: string; width: number; height: number; graph: DiagramGraph };

export type DiagramExport = {
  /** First non-empty page — kept for the Studio preview and older blog code. */
  svg: string;
  width: number;
  height: number;
  /** Adjacency-list graph of the first page (Markdown / llms.txt / explainers). */
  graph: DiagramGraph;
  /** Every non-empty page, in tldraw page order; the blog shows tabs when > 1. */
  pages: DiagramPage[];
  flows: Flow[];
};

/**
 * Export each page as a standalone SVG for the blog.
 *
 * tldraw inlines every font as a base64 @font-face (~100KB+ per diagram).
 * The blog already loads the same families via next/font and maps the
 * `sd_*` names onto them (app/globals.css), so the embedded faces are
 * stripped to keep documents and page HTML small.
 */
export async function exportDiagram(editor: Editor): Promise<DiagramExport | null> {
  const original = editor.getCurrentPageId();
  const pages: DiagramPage[] = [];
  try {
    for (const page of editor.getPages()) {
      const ids = [...editor.getPageShapeIds(page.id)];
      if (!ids.length) continue;
      // Exports resolve shapes against the current page, so visit each one.
      editor.setCurrentPage(page.id);
      const result = await editor.getSvgString(ids, { background: false, padding: 24, darkMode: false });
      if (!result) continue;
      pages.push({
        name: page.name,
        svg: result.svg
          .replace(/@font-face\s*\{[^}]*\}/g, "")
          .replace(/<style>\s*<\/style>/g, "")
          .replace(/<defs>\s*<\/defs>/g, ""),
        width: Math.round(result.width),
        height: Math.round(result.height),
        graph: buildGraph(editor, page.id),
      });
    }
  } finally {
    editor.setCurrentPage(original);
  }
  if (!pages.length) return null;
  const [first] = pages;
  return {
    svg: first.svg,
    width: first.width,
    height: first.height,
    graph: first.graph,
    pages,
    flows: exportFlows(editor),
  };
}
