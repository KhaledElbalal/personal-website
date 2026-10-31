import { BlogRow } from "@/components/content/BlogRow";
import { PageHeader } from "@/components/ui";
import { formatPostDate } from "@/sanity/post";
import { sanityFetch } from "@/sanity/fetch";
import { urlFor } from "@/sanity/image";
import { POSTS_QUERY } from "@/sanity/queries";
import type { POSTS_QUERY_RESULT } from "@/sanity.types";

export async function PostListView({
  kind,
  basePath,
  title,
  intro,
  emptyMessage,
}: {
  kind: "project" | "post";
  basePath: string;
  title: string;
  intro?: string;
  emptyMessage: string;
}) {
  const posts = await sanityFetch<POSTS_QUERY_RESULT>(POSTS_QUERY, { kind }, [
    "post",
  ]);

  return (
    <>
      <PageHeader as="h1" title={title} intro={intro} />
      <section
        aria-label={title}
        className="page-margin bg-section py-12 md:py-20"
      >
        {posts.length ? (
          <div className="flex flex-col">
            {posts.map((p) => (
              <BlogRow
                key={p._id}
                image={
                  p.cover
                    ? urlFor(p.cover).width(1200).height(750).url()
                    : undefined
                }
                category={p.category ?? undefined}
                diagramSvg={p.coverSvg}
                title={p.title ?? ""}
                body={p.summary ?? undefined}
                date={formatPostDate(p)}
                path={p.path ?? undefined}
                href={p.slug ? `${basePath}/${p.slug}` : basePath}
                slug={p.slug ?? undefined}
              />
            ))}
          </div>
        ) : (
          <p className="text-[1.0625rem] text-ink">{emptyMessage}</p>
        )}
      </section>
    </>
  );
}
