import type { Metadata } from "next";

import { BlogRow } from "@/components/content/BlogRow";
import { GiantLabel, PageHeader } from "@/components/ui";
import { formatRange } from "@/sanity/experience";
import { sanityFetch } from "@/sanity/fetch";
import { urlFor } from "@/sanity/image";
import { PROJECTS_QUERY } from "@/sanity/queries";
import type { PROJECTS_QUERY_RESULT } from "@/sanity.types";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects by Khaled Elbalal.",
};

export default async function ProjectsPage() {
  const projects = await sanityFetch<PROJECTS_QUERY_RESULT>(
    PROJECTS_QUERY,
    {},
    ["project"],
  );

  return (
    <>
      <PageHeader as="h1" title="Projects" />
      <section className="overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
          <GiantLabel className="mb-12">FEATURED</GiantLabel>
          {projects.length ? (
            <div className="flex flex-col gap-14">
              {projects.map((p) => (
                <BlogRow
                  key={p._id}
                  image={
                    p.cover
                      ? urlFor(p.cover).width(520).height(420).url()
                      : undefined
                  }
                  category={p.category ?? undefined}
                  title={p.title ?? ""}
                  body={p.summary ?? undefined}
                  date={formatRange(p)}
                  path={p.path ?? undefined}
                  href={p.slug ? `/projects/${p.slug}` : "#"}
                />
              ))}
            </div>
          ) : (
            <p className="font-body text-base text-muted">
              Projects are coming soon.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
