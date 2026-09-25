import type { FlowDef } from "@/components/content/diagram/engine";
import { type DiagramAnimation, DiagramPages, DiagramViewer } from "@/components/content/DiagramViewer";

type DiagramFigureProps = {
  svg: string;
  alt: string;
  caption?: string | null;
  width?: number | null;
  animation?: string | null;
  /** Superseded by `animation`; older blocks may only have this. */
  animateFlow?: boolean | null;
  /** Recorded flows JSON written by the Studio diagram editor. */
  flows?: string | null;
  /** All pages as JSON [{name, svg, width, height}] when the canvas has > 1 page. */
  pages?: string | null;
};

// Diagrams are authored in Studio, but strip anything executable anyway
// before inlining the SVG.
function sanitizeSvg(svg: string) {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href\s*=\s*["'])\s*javascript:[^"']*/gi, "$1#");
}

function parseFlows(json?: string | null): FlowDef[] {
  if (!json) return [];
  try {
    const flows = JSON.parse(json);
    return Array.isArray(flows) ? flows : [];
  } catch {
    return [];
  }
}

function parsePages(json?: string | null) {
  if (!json) return [];
  try {
    const pages = JSON.parse(json) as { name?: string; svg?: string; width?: number }[];
    return Array.isArray(pages)
      ? pages
          .filter((p) => typeof p?.svg === "string")
          .map((p, i) => ({ name: p.name || `Page ${i + 1}`, html: sanitizeSvg(p.svg!), width: p.width }))
      : [];
  } catch {
    return [];
  }
}

function toAnimation(animation?: string | null, animateFlow?: boolean | null): DiagramAnimation {
  if (animation === "ambient" || animation === "walkthrough" || animation === "off") return animation;
  return animateFlow === false ? "off" : "ambient";
}

/** Inline system-design diagram exported from the Studio diagram editor. */
export function DiagramFigure({
  svg,
  alt,
  caption,
  width,
  animation,
  animateFlow,
  flows,
  pages,
}: DiagramFigureProps) {
  const pageViews = parsePages(pages);
  if (pageViews.length > 1) {
    return (
      <DiagramPages
        pages={pageViews}
        alt={alt}
        caption={caption}
        animation={toAnimation(animation, animateFlow)}
        flows={parseFlows(flows)}
      />
    );
  }
  return (
    <DiagramViewer
      html={sanitizeSvg(svg)}
      alt={alt}
      caption={caption}
      width={width}
      animation={toAnimation(animation, animateFlow)}
      flows={parseFlows(flows)}
    />
  );
}
