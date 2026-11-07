import Link from "next/link";
import { ViewTransition } from "react";

import { DiagramThumb } from "@/components/content/DiagramThumb";

type BlogRowProps = {
  image?: string;
  /** Cover diagram SVG — shown instead of `image` when set. */
  diagramSvg?: string | null;
  category?: string;
  title?: string;
  body?: string;
  date?: string;
  path?: string; // kept for call-site compatibility
  href?: string;
  /** Names the title and cover for the list → detail morphs. */
  slug?: string;
  className?: string;
};

// "ML PROJECT" -> "ML project"; short acronyms ("AI/ML") stay as typed.
const sentenceCase = (s: string) =>
  s.length <= 5 || /[a-z]/.test(s) ? s : s.charAt(0) + s.slice(1).toLowerCase();

/**
 * One list entry on a 12-column grid: what and when at the left, the title
 * with its summary beneath, and the cover at the right when there is one (first on phones).
 * The row tints and the title slides in an arrow on hover; the tint reaches
 * past the text so the text stays on the page margin.
 */
export function BlogRow({
  image,
  diagramSvg,
  category = "Frontend",
  title = "",
  body,
  date = "",
  href = "#",
  slug,
  className = "",
}: BlogRowProps) {
  const hasCover = Boolean(diagramSvg || image);

  return (
    <Link
      href={href}
      className={`reveal group -mx-[calc(var(--margin)*0.7)] grid grid-cols-1 gap-x-10 gap-y-4 px-[calc(var(--margin)*0.7)] py-9 no-underline transition-colors duration-300 hover:bg-[rgba(0,147,233,0.08)] focus-visible:bg-[rgba(0,147,233,0.08)] md:grid-cols-12 md:py-12 ${className}`}
    >
      <div className="order-1 text-sm text-muted md:col-span-2">
        <span className="block font-medium text-ink">{sentenceCase(category)}</span>
        <span className="block">{date}</span>
      </div>

      <div className={`order-3 min-w-0 md:order-2 ${hasCover ? "md:col-span-6" : "md:col-span-10"}`}>
        <ViewTransition name={slug ? `title-${slug}` : undefined} share="morph" default="none">
          <h3 className="m-0 text-[length:var(--step-row)] font-semibold leading-tight text-black transition-colors duration-300 group-hover:text-[color:var(--accent-text)] group-focus-visible:text-[color:var(--accent-text)]">
            {title}
            <span
              aria-hidden="true"
              className="ml-2 inline-block -translate-x-2 opacity-0 transition-[opacity,translate] duration-300 ease-in-out group-hover:translate-x-0 group-hover:opacity-100 group-hover:ease-[cubic-bezier(0.16,1,0.3,1)] group-focus-visible:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:ease-[cubic-bezier(0.16,1,0.3,1)]"
            >
              →
            </span>
          </h3>
        </ViewTransition>
        {body ? (
          <p className="m-0 mt-4 max-w-[58ch] text-[1.0625rem] leading-relaxed text-ink">
            {body}
          </p>
        ) : null}
      </div>

      {hasCover ? (
        <div className="order-2 md:order-3 md:col-span-4 md:mt-1.5">
          <ViewTransition name={slug ? `cover-${slug}` : undefined} share="cover-morph" default="none">
            {diagramSvg ? (
              <div className="aspect-[16/10] w-full overflow-hidden">
                <DiagramThumb
                  svg={diagramSvg}
                  className="h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                />
              </div>
            ) : (
              <div className="aspect-[16/10] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element -- Sanity CDN, sized via urlFor */}
                <img
                  src={image}
                  alt=""
                  width={1200}
                  height={750}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                />
              </div>
            )}
          </ViewTransition>
        </div>
      ) : null}
    </Link>
  );
}
