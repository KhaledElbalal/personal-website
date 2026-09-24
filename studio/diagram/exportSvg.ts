import type { Editor } from "tldraw";

export type DiagramExport = { svg: string; width: number; height: number };

/**
 * Export the whole page as a standalone SVG for the blog.
 *
 * tldraw inlines every font as a base64 @font-face (~100KB+ per diagram).
 * The blog already loads the same families via next/font and maps the
 * `sd_*` names onto them (app/globals.css), so the embedded faces are
 * stripped to keep documents and page HTML small.
 */
export async function exportDiagram(editor: Editor): Promise<DiagramExport | null> {
  const ids = [...editor.getCurrentPageShapeIds()];
  if (ids.length === 0) return null;
  const result = await editor.getSvgString(ids, { background: false, padding: 24, darkMode: false });
  if (!result) return null;
  const svg = result.svg
    .replace(/@font-face\s*\{[^}]*\}/g, "")
    .replace(/<style>\s*<\/style>/g, "")
    .replace(/<defs>\s*<\/defs>/g, "");
  return { svg, width: Math.round(result.width), height: Math.round(result.height) };
}
