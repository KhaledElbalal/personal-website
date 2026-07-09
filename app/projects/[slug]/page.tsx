import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectBody } from "@/components/content/ProjectBody";
import { PageHeader, Tag } from "@/components/ui";
import { formatRange } from "@/sanity/experience";
import { sanityFetch } from "@/sanity/fetch";
import { urlFor } from "@/sanity/image";
import { PROJECT_BY_SLUG_QUERY, PROJECTS_QUERY } from "@/sanity/queries";
import type {
  PROJECTS_QUERY_RESULT,
  PROJECT_BY_SLUG_QUERY_RESULT,
} from "@/sanity.types";

type Params = { slug: string };

// Prerender published projects. Cache Components forbids an empty
// generateStaticParams, so when nothing is published yet we return a throwaway
// placeholder (which 404s); real slugs published later render on demand via the
// default dynamicParams and prerender on the next build.
export async function generateStaticParams() {
  const projects = await sanityFetch<PROJECTS_QUERY_RESULT>(
    PROJECTS_QUERY,
    {},
    ["project"],
  );
  const slugs = projects
    .filter((p): p is typeof p & { slug: string } => Boolean(p.slug))
    .map((p) => ({ slug: p.slug }));
  return slugs.length ? slugs : [{ slug: "__none__" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await sanityFetch<PROJECT_BY_SLUG_QUERY_RESULT>(
    PROJECT_BY_SLUG_QUERY,
    { slug },
    ["project"],
  );
  if (!project) return {};
  return {
    title: project.title ?? "Project",
    description: project.summary ?? undefined,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = await sanityFetch<PROJECT_BY_SLUG_QUERY_RESULT>(
    PROJECT_BY_SLUG_QUERY,
    { slug },
    ["project"],
  );
  if (!project) notFound();

  const cover = project.cover
    ? urlFor(project.cover).width(1280).height(640).url()
    : null;

  return (
    <>
      <PageHeader
        as="h1"
        title={project.title ?? "Project"}
        intro={project.summary ?? undefined}
        aside={
          <div className="flex flex-col items-start gap-3">
            {project.category ? (
              <Tag size="outline">{project.category}</Tag>
            ) : null}
            <span className="font-mono text-sm text-muted">
              {formatRange(project)}
            </span>
          </div>
        }
      />
      <article className="mx-auto max-w-3xl px-6 py-16 sm:px-10">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element -- Sanity CDN, sized via urlFor
          <img
            src={cover}
            alt={project.cover?.alt ?? ""}
            className="mb-10 w-full rounded-[8px]"
          />
        ) : null}
        <ProjectBody value={project.body} />
        <div className="mt-14 border-t border-black/10 pt-6">
          <Link
            href="/projects"
            className="font-mono text-sm font-bold text-accent hover:underline"
          >
            ← Back to projects
          </Link>
        </div>
      </article>
    </>
  );
}
