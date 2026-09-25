import { sanitizeSvg } from "@/lib/svg";

/**
 * Static diagram used as a card cover: inline SVG (sharp, site fonts), scaled
 * to fit the cover box. Decorative — the card's title carries the meaning.
 */
export function DiagramThumb({ svg, className = "" }: { svg: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`sd-diagram sd-thumb flex items-center justify-center bg-white p-3 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeSvg(svg) }}
    />
  );
}
