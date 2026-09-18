import Link from "next/link";
import { notFound } from "next/navigation";

import { AuthorBio } from "@/components/content/AuthorBio";
import { PostBody } from "@/components/content/PostBody";
import { PostToc } from "@/components/content/PostToc";
import { Blob, Tag } from "@/components/ui";
import { estimateReadingTime, extractHeadings, formatPostDate } from "@/sanity/post";
import { sanityFetch } from "@/sanity/fetch";
import { urlFor } from "@/sanity/image";
import { POSTS_QUERY, POST_BY_SLUG_QUERY, SERIES_POSTS_QUERY } from "@/sanity/queries";
import type {
  POSTS_QUERY_RESULT,
  POST_BY_SLUG_QUERY_RESULT,
  SERIES_POSTS_QUERY_RESULT,
} from "@/sanity.types";

type Kind = "project" | "post";

export async function getPostBySlug(slug: string) {
  return sanityFetch<POST_BY_SLUG_QUERY_RESULT>(POST_BY_SLUG_QUERY, { slug }, [
    "post",
  ]);
}

export async function getPostSlugs(kind: Kind) {
  const posts = await sanityFetch<POSTS_QUERY_RESULT>(POSTS_QUERY, { kind }, [
    "post",
  ]);
  return posts
    .filter((p): p is typeof p & { slug: string } => Boolean(p.slug))
    .map((p) => ({ slug: p.slug }));
}

export async function PostDetailView({
  kind,
  slug,
  basePath,
}: {
  kind: Kind;
  slug: string;
  basePath: string;
}) {
  const [post, siblings] = await Promise.all([
    getPostBySlug(slug),
    sanityFetch<POSTS_QUERY_RESULT>(POSTS_QUERY, { kind }, ["post"]),
  ]);
  if (!post || post.kind !== kind) notFound();

  const seriesName = post.series?.name;
  const seriesPosts = seriesName
    ? await sanityFetch<SERIES_POSTS_QUERY_RESULT>(
        SERIES_POSTS_QUERY,
        { name: seriesName },
        ["post"],
      )
    : [];

  // Chronological prev/next among same-kind siblings (siblings is newest-first).
  const currentIndex = siblings.findIndex((p) => p._id === post._id);
  const newerPost = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const olderPost =
    currentIndex >= 0 && currentIndex < siblings.length - 1
      ? siblings[currentIndex + 1]
      : null;

  // Series chapter order.
  const seriesIndex = seriesPosts.findIndex((p) => p._id === post._id);
  const prevChapter = seriesIndex > 0 ? seriesPosts[seriesIndex - 1] : null;
  const nextChapter =
    seriesIndex >= 0 && seriesIndex < seriesPosts.length - 1
      ? seriesPosts[seriesIndex + 1]
      : null;

  const headings = extractHeadings(post.body);
  const readingTime = estimateReadingTime(post.body);
  const cover = post.cover
    ? urlFor(post.cover).width(1280).height(640).url()
    : null;

  return (
    <>
      <section className="relative overflow-hidden bg-section">
        <Blob
          size={300}
          interactive="parallax"
          className="pointer-events-none absolute -left-16 -top-24"
        />
        <Blob
          size={420}
          variant="cluster"
          interactive="parallax"
          className="pointer-events-none absolute -right-16 -top-10 hidden sm:block"
        />
        <div className="relative mx-auto w-full max-w-7xl px-6 py-14 sm:px-10 sm:py-16">
          <Link
            href={basePath}
            className="inline-flex items-center gap-2 font-mono text-[13px] font-bold text-accent no-underline hover:underline"
          >
            <span className="text-muted">$</span> cd ~{basePath}
          </Link>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {post.category ? <Tag size="chip">{post.category}</Tag> : null}
            <span className="font-mono text-sm text-muted">
              {formatPostDate(post)}
              {kind === "post" ? ` · ${readingTime} min read` : null}
            </span>
          </div>
          <h1 className="m-0 mt-5 max-w-[720px] font-mono text-[clamp(2rem,6vw,2.75rem)] font-bold leading-[1.1] text-ink">
            {post.title ?? "Post"}
          </h1>
          {post.summary ? (
            <p className="mt-4 max-w-[560px] font-body text-base leading-[1.6] text-ink">
              {post.summary}
            </p>
          ) : null}
        </div>
      </section>

      {seriesPosts.length > 1 && seriesIndex >= 0 ? (
        <div className="border-b border-black/10 bg-page">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3.5 font-mono text-[13px] sm:px-10">
            <span className="text-muted">
              <span className="font-bold text-accent">⑂</span> series:{" "}
              <span className="font-bold text-accent">{seriesName}</span>{" "}
              · part {seriesIndex + 1} of {seriesPosts.length}
            </span>
            <span className="flex flex-wrap gap-5">
              {prevChapter ? (
                <Link
                  href={`${basePath}/${prevChapter.slug}`}
                  className="text-muted no-underline hover:text-accent"
                >
                  ← {String(prevChapter.part ?? "").padStart(2, "0")}{" "}
                  {prevChapter.title}
                </Link>
              ) : null}
              {nextChapter ? (
                <Link
                  href={`${basePath}/${nextChapter.slug}`}
                  className="font-bold text-accent no-underline hover:underline"
                >
                  {String(nextChapter.part ?? "").padStart(2, "0")}{" "}
                  {nextChapter.title} →
                </Link>
              ) : null}
            </span>
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-10">
        <div
          className={
            headings.length
              ? "md:grid md:grid-cols-[150px_minmax(0,1fr)] md:items-start md:gap-10"
              : ""
          }
        >
          {headings.length ? <PostToc headings={headings} /> : null}
          <article className="mx-auto max-w-3xl md:mx-0 md:max-w-none">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element -- Sanity CDN, sized via urlFor
              <img
                src={cover}
                alt={post.cover?.alt ?? ""}
                className="mb-10 w-full rounded-[8px]"
              />
            ) : null}
            <PostBody value={post.body} />

            {post.tags?.length ? (
              <div className="mt-10 flex flex-wrap gap-2.5">
                {post.tags.map((t) => (
                  <Tag key={t} size="chip">
                    {t}
                  </Tag>
                ))}
              </div>
            ) : null}

            {newerPost || olderPost ? (
              <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-black/10 pt-6">
                {olderPost ? (
                  <Link
                    href={`${basePath}/${olderPost.slug}`}
                    className="font-mono text-[13px] font-bold text-accent no-underline hover:underline"
                  >
                    ← {olderPost.title}
                  </Link>
                ) : (
                  <span />
                )}
                {newerPost ? (
                  <Link
                    href={`${basePath}/${newerPost.slug}`}
                    className="text-right font-mono text-[13px] font-bold text-accent no-underline hover:underline"
                  >
                    {newerPost.title} →
                  </Link>
                ) : null}
              </div>
            ) : null}

            {seriesPosts.length > 1 ? (
              <div className="mt-12">
                <div className="font-mono text-[11px] tracking-[0.18em] text-muted">
                  ALSO IN THIS SERIES ·{" "}
                  <span className="text-accent">{seriesName?.toUpperCase()}</span>
                </div>
                <div className="mt-3.5 flex flex-col">
                  {seriesPosts.map((chapter) => {
                    const isCurrent = chapter._id === post._id;
                    const row = (
                      <span
                        className={`grid grid-cols-[36px_1fr_auto] items-baseline gap-3.5 border-t border-black/10 px-1 py-3.5 no-underline ${
                          isCurrent ? "-ml-0.5 border-l-2 border-l-accent bg-[rgba(0,103,168,0.06)] pl-3" : ""
                        }`}
                      >
                        <span className="font-mono text-[13px] font-bold text-accent">
                          {String(chapter.part ?? "").padStart(2, "0")}
                        </span>
                        <span className="font-mono text-[15px] font-bold text-heading">
                          {chapter.title}
                          {isCurrent ? (
                            <span className="ml-2 font-normal text-xs text-accent">
                              ← you are here
                            </span>
                          ) : null}
                        </span>
                        <span className="font-mono text-xs text-muted">
                          {formatPostDate(chapter)}
                        </span>
                      </span>
                    );
                    return isCurrent ? (
                      <div key={chapter._id}>{row}</div>
                    ) : (
                      <Link key={chapter._id} href={`${basePath}/${chapter.slug}`}>
                        {row}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <AuthorBio />
          </article>
        </div>
      </div>
    </>
  );
}
