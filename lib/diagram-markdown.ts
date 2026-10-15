// Studio diagrams as text: an adjacency list (plus a Mermaid sketch) that
// assistants can reason about. Source is the `graph` saved by the Studio
// (studio/diagram/behavior.ts → buildGraph); diagrams saved before that
// existed fall back to the data-sd-* tags in their SVG.

type Kind = "request" | "async" | "response" | "plain";
type GraphNode = { id: string; label: string; sub?: string; icon?: string; role?: string; group?: string };
type GraphGroup = { id: string; label: string; parent?: string };
type GraphEdge = { id: string; arrowId?: string; from?: string; to?: string; kind: Kind | string; label?: string; fails?: number };
type Graph = { nodes: GraphNode[]; groups: GraphGroup[]; edges: GraphEdge[]; notes?: string[] };
type Flow = { name: string; steps: { arrowId: string; note?: string; fails?: number }[] };

export type DiagramBlockLike = {
  alt?: string | null;
  caption?: string | null;
  svg?: string | null;
  graph?: string | null;
  flows?: string | null;
  pages?: string | null;
};

const ARROW: Record<string, string> = { request: "→", async: "⇢", response: "↩", plain: "→" };

function parse<T>(json: string | null | undefined): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

const attr = (tag: string, name: string) =>
  tag
    .match(new RegExp(`${name}="([^"]*)"`))?.[1]
    ?.replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

/** Best-effort graph from the export's data-sd-* tags (no groups/sub-labels). */
function graphFromSvg(svg: string): Graph {
  const nodes: GraphNode[] = [];
  const ids = new Map<string, string>();
  const used = new Map<string, number>();
  for (const [tag] of svg.matchAll(/<g[^>]*data-sd-node="[^"]*"[^>]*>/g)) {
    const shapeId = attr(tag, "data-sd-node")!;
    const label = attr(tag, "data-sd-label") ?? "Node";
    const base = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "node";
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    const id = n === 1 ? base : `${base}-${n}`;
    ids.set(shapeId, id);
    nodes.push({ id, label, role: attr(tag, "data-sd-role") });
  }
  const edges: GraphEdge[] = [];
  let i = 0;
  for (const [tag] of svg.matchAll(/<g[^>]*data-sd-arrow="[^"]*"[^>]*>/g)) {
    const from = attr(tag, "data-sd-from");
    const to = attr(tag, "data-sd-to");
    edges.push({
      id: `e${++i}`,
      arrowId: attr(tag, "data-sd-arrow"),
      from: from ? ids.get(from) : undefined,
      to: to ? ids.get(to) : undefined,
      kind: attr(tag, "data-sd-flow") ?? "plain",
      label: attr(tag, "data-sd-label"),
      fails: Number(attr(tag, "data-sd-fails")) || undefined,
    });
  }
  return { nodes, groups: [], edges };
}

/** AWS icons name the exact service/resource; other icons just repeat the label. */
const iconName = (icon?: string) => {
  if (!icon?.startsWith("aws:")) return "";
  return `AWS ${icon.split("/").pop()}`;
};

function graphMarkdown(g: Graph, flows: Flow[]): string {
  const out: string[] = [];
  const nodeLabel = new Map(g.nodes.map((n) => [n.id, n.label]));
  const ref = (id?: string) => (id ? `\`${id}\`` : "(unconnected)");

  if (g.groups.length) {
    out.push("**Groups** (nesting shows containment)");
    const children = (parent?: string) => g.groups.filter((gr) => gr.parent === parent);
    const walk = (parent: string | undefined, depth: number) => {
      for (const gr of children(parent)) {
        const members = g.nodes.filter((n) => n.group === gr.id).map((n) => `\`${n.id}\``);
        out.push(`${"  ".repeat(depth)}- \`${gr.id}\`: ${gr.label}${members.length ? ` — contains ${members.join(", ")}` : ""}`);
        walk(gr.id, depth + 1);
      }
    };
    walk(undefined, 0);
    out.push("");
  }

  if (g.nodes.length) {
    out.push("**Components**");
    for (const n of g.nodes) {
      const bits = [n.sub, iconName(n.icon)].filter(Boolean).join(", ");
      const role = n.role && n.role !== "plain" ? ` [${n.role === "fanout" ? "fan-out" : n.role}]` : "";
      out.push(`- \`${n.id}\`: ${n.label}${bits ? ` (${bits})` : ""}${role}`);
    }
    out.push("");
  }

  if (g.edges.length) {
    out.push("**Connections** (→ synchronous request, ⇢ asynchronous message, ↩ response / failure path)");
    for (const e of g.edges) {
      const fails = e.fails ? ` (after ${e.fails} failed retries)` : "";
      out.push(`- ${ref(e.from)} ${ARROW[e.kind] ?? "→"} ${ref(e.to)}${e.label ? `: ${e.label}` : ""}${fails}`);
    }
    out.push("");
  }

  const byArrow = new Map(g.edges.filter((e) => e.arrowId).map((e) => [e.arrowId!, e]));
  for (const flow of flows) {
    const steps = flow.steps.filter((s) => byArrow.has(s.arrowId));
    if (!steps.length) continue;
    out.push(`**Walkthrough: ${flow.name}**`);
    steps.forEach((s, i) => {
      const e = byArrow.get(s.arrowId)!;
      const hop = `${nodeLabel.get(e.from ?? "") ?? "?"} ${ARROW[e.kind] ?? "→"} ${nodeLabel.get(e.to ?? "") ?? "?"}`;
      const fails = s.fails ? ` — fails ${s.fails}× before succeeding` : "";
      out.push(`${i + 1}. ${hop}${s.note ? `: ${s.note}` : e.label ? `: ${e.label}` : ""}${fails}`);
    });
    out.push("");
  }

  if (g.notes?.length) {
    out.push("**Notes on the canvas**");
    for (const note of g.notes) out.push(`- ${note.replace(/\s*\n\s*/g, " ")}`);
    out.push("");
  }

  // Mermaid sketch — many tools render it, and models know the syntax well.
  if (g.nodes.length) {
    const mm: string[] = ["```mermaid", "flowchart LR"];
    const q = (s: string) => s.replace(/"/g, "'");
    const nodeLine = (n: GraphNode, indent: string) => `${indent}${n.id.replace(/-/g, "_")}["${q(n.label)}${n.sub ? `<br/>${q(n.sub)}` : ""}"]`;
    const emitGroup = (parent: string | undefined, indent: string) => {
      for (const gr of g.groups.filter((x) => x.parent === parent)) {
        mm.push(`${indent}subgraph ${gr.id.replace(/-/g, "_")}["${q(gr.label)}"]`);
        for (const n of g.nodes.filter((n) => n.group === gr.id)) mm.push(nodeLine(n, `${indent}  `));
        emitGroup(gr.id, `${indent}  `);
        mm.push(`${indent}end`);
      }
    };
    for (const n of g.nodes.filter((n) => !n.group)) mm.push(nodeLine(n, "  "));
    emitGroup(undefined, "  ");
    for (const e of g.edges) {
      if (!e.from || !e.to) continue;
      const link = e.kind === "async" ? "-.->" : e.kind === "response" ? "-.->" : "-->";
      mm.push(`  ${e.from.replace(/-/g, "_")} ${link}${e.label ? `|"${q(e.label)}"|` : ""} ${e.to.replace(/-/g, "_")}`);
    }
    mm.push("```");
    out.push(...mm, "");
  }
  return out.join("\n");
}

/** Markdown for one diagram block (all pages), headed by `level`. */
export function diagramToMarkdown(block: DiagramBlockLike, level = "###"): string {
  const title = block.caption || block.alt || "System diagram";
  const flows = parse<Flow[]>(block.flows) ?? [];
  const pages = parse<{ name: string; svg: string; graph?: Graph }[]>(block.pages);
  const out = [`${level} Diagram: ${title}`, ""];
  if (block.alt && block.alt !== title) out.push(`_${block.alt}_`, "");

  const pageGraph = (graph: Graph | null | undefined, svg?: string | null) =>
    graph ?? (svg ? graphFromSvg(svg) : null);

  if (pages && pages.length > 1) {
    pages.forEach((page, i) => {
      const g = pageGraph(page.graph, page.svg);
      out.push(`**Page ${i + 1}: ${page.name}**`, "");
      if (g) out.push(graphMarkdown(g, flows));
    });
  } else {
    const g = pageGraph(parse<Graph>(block.graph), block.svg);
    if (g) out.push(graphMarkdown(g, flows));
  }
  return out.join("\n").trimEnd();
}
