import { BlogRow } from "@/components/content/BlogRow";
import { GiantLabel, PageHeader } from "@/components/ui";
import { formatPostDate } from "@/sanity/post";
import { sanityFetch } from "@/sanity/fetch";
import { urlFor } from "@/sanity/image";
import { POSTS_QUERY } from "@/sanity/queries";
import type { POSTS_QUERY_RESULT } from "@/sanity.types";

export async function PostListView({
  kind,
  basePath,
  title,
  eyebrow,
  emptyMessage,
}: {
  kind: "project" | "post";
  basePath: string;
  title: string;
  eyebrow: string;
  emptyMessage: string;
}) {
  const posts = await sanityFetch<POSTS_QUERY_RESULT>(POSTS_QUERY, { kind }, [
    "post",
  ]);

  return (
    <>
      <PageHeader as="h1" title={title} />
      <section className="overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-10">
          <GiantLabel>{eyebrow}</GiantLabel>
          {posts.length ? (
            <div className="flex flex-col gap-14">
              {posts.map((p) => (
                <BlogRow
                  key={p._id}
                  image={
                    p.cover
                      ? urlFor(p.cover).width(520).height(420).url()
                      : undefined
                  }
                  category={p.category ?? undefined}
                  diagramSvg={p.coverSvg}
                  title={p.title ?? ""}
                  body={p.summary ?? undefined}
                  date={formatPostDate(p)}
                  path={p.path ?? undefined}
                  href={p.slug ? `${basePath}/${p.slug}` : basePath}
                />
              ))}
            </div>
          ) : (
            <p className="font-body text-base text-muted">{emptyMessage}</p>
          )}
        </div>
      </section>
    </>
  );
}
