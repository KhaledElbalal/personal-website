// Posts as Markdown for assistants (/blog/<slug>.md, llms.txt, "Read with").
import { diagramToMarkdown, type DiagramBlockLike } from "@/lib/diagram-markdown";
import { SITE_URL } from "@/lib/site";
import { urlFor } from "@/sanity/image";

type Span = { _type: "span"; text?: string; marks?: string[] };
type MarkDef = { _key: string; _type: string; href?: string };
type Block = {
  _type: string;
  _key?: string;
  style?: string;
  listItem?: "bullet" | "number";
  level?: number;
  children?: (Span | { _type: string })[];
  markDefs?: MarkDef[];
  // image
  asset?: unknown;
  alt?: string;
  // code
  label?: string;
  language?: string;
  code?: string;
  output?: string;
} & DiagramBlockLike;

export type PostForMarkdown = {
  title?: string | null;
  summary?: string | null;
  category?: string | null;
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  tags?: string[] | null;
  body?: unknown[] | null;
  coverDiagram?: DiagramBlockLike | null;
};

const DECORATOR: Record<string, [string, string]> = {
  strong: ["**", "**"],
  em: ["_", "_"],
  code: ["`", "`"],
  "strike-through": ["~~", "~~"],
};

function spansToMarkdown(block: Block) {
  const defs = new Map((block.markDefs ?? []).map((d) => [d._key, d]));
  return (block.children ?? [])
    .map((child) => {
      if (child._type !== "span") return "";
      const span = child as Span;
      let text = span.text ?? "";
      if (!text) return "";
      for (const mark of span.marks ?? []) {
        const deco = DECORATOR[mark];
        if (deco) text = `${deco[0]}${text}${deco[1]}`;
        const def = defs.get(mark);
        if (def?._type === "link" && def.href) text = `[${text}](${def.href})`;
      }
      return text;
    })
    .join("");
}

function blocksToMarkdown(blocks: Block[]): string {
  const out: string[] = [];
  let numbered = 0;
  blocks.forEach((b, i) => {
    const prev = blocks[i - 1];
    // Blank line between blocks, except consecutive list items.
    if (out.length && !(b.listItem && prev?.listItem)) out.push("");
    if (!b.listItem) numbered = 0;

    switch (b._type) {
      case "block": {
        const text = spansToMarkdown(b);
        if (b.listItem) {
          const indent = "  ".repeat(Math.max(0, (b.level ?? 1) - 1));
          numbered = b.listItem === "number" ? numbered + 1 : 0;
          out.push(`${indent}${b.listItem === "number" ? `${numbered}.` : "-"} ${text}`);
        } else if (b.style === "h2") out.push(`## ${text}`);
        else if (b.style === "h3") out.push(`### ${text}`);
        else if (b.style === "h4") out.push(`#### ${text}`);
        else if (b.style === "blockquote") out.push(`> ${text}`);
        else out.push(text);
        break;
      }
      case "image": {
        if (!b.asset) break;
        const url = urlFor(b as never).width(1200).url();
        out.push(`![${b.alt ?? ""}](${url})`);
        break;
      }
      case "code": {
        if (b.label) out.push(`_${b.label}_`);
        out.push(`\`\`\`${b.language ?? ""}`, b.code ?? "", "```");
        if (b.output) out.push("", "Output:", "```", b.output, "```");
        break;
      }
      case "diagram":
        out.push(diagramToMarkdown(b));
        break;
    }
  });
  return out.join("\n");
}

/** Full Markdown document for a post, with front matter-ish header. */
export function postToMarkdown(post: PostForMarkdown, url: string): string {
  const meta = [
    post.category ? `Category: ${post.category}` : null,
    post.date ?? post.startDate ? `Date: ${post.date ?? post.startDate}${post.endDate ? ` → ${post.endDate}` : ""}` : null,
    post.tags?.length ? `Tags: ${post.tags.join(", ")}` : null,
    `Canonical: ${url}`,
  ].filter(Boolean);

  const parts = [`# ${post.title ?? "Untitled"}`, ""];
  if (post.summary) parts.push(`> ${post.summary}`, "");
  parts.push(...meta.map((m) => `- ${m}`), "");
  if (post.coverDiagram?.svg) parts.push(diagramToMarkdown(post.coverDiagram, "##"), "");
  parts.push(blocksToMarkdown((post.body ?? []) as Block[]));
  return `${parts.join("\n").trim()}\n`;
}

export const postUrl = (section: "blog" | "projects", slug: string) => `${SITE_URL}/${section}/${slug}`;
export const postMarkdownUrl = (section: "blog" | "projects", slug: string) => `${postUrl(section, slug)}.md`;
