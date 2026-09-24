type DiagramFigureProps = {
  svg: string;
  alt: string;
  caption?: string | null;
  width?: number | null;
};

// Diagrams are authored in Studio, but strip anything executable anyway
// before inlining the SVG.
function sanitizeSvg(svg: string) {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href\s*=\s*["'])\s*javascript:[^"']*/gi, "$1#");
}

// Below this width, labels get too small to read — scroll instead of shrinking.
const MIN_READABLE_WIDTH = 560;

/** Inline system-design diagram exported from the Studio diagram editor. */
export function DiagramFigure({ svg, alt, caption, width }: DiagramFigureProps) {
  const minWidth = width ? Math.min(width, MIN_READABLE_WIDTH) : undefined;
  return (
    <figure className="my-10 w-full [contain:inline-size]">
      <div
        className="overflow-x-auto rounded-[8px] border-[1.5px] border-[color:var(--color-xiketic)] bg-white p-4 sm:p-6"
        // Focusable so keyboard users can scroll wide diagrams (axe: scrollable-region-focusable).
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        role="region"
        aria-label={caption ? `Diagram: ${caption}` : "Diagram"}
      >
        <div
          role="img"
          aria-label={alt}
          className="sd-diagram mx-auto"
          style={{ minWidth, maxWidth: width ?? undefined }}
          dangerouslySetInnerHTML={{ __html: sanitizeSvg(svg) }}
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 text-center font-mono text-[13px] text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
