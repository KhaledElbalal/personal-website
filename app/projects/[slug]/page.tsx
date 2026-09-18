import type { Metadata } from "next";

import {
  PostDetailView,
  getPostMetadata,
  getPostSlugs,
} from "@/components/content/PostDetailView";

type Params = { slug: string };

// Prerender published projects. Cache Components forbids an empty
// generateStaticParams, so when nothing is published yet we return a throwaway
// placeholder (which 404s); real slugs published later render on demand via the
// default dynamicParams and prerender on the next build.
export async function generateStaticParams() {
  const slugs = await getPostSlugs("project");
  return slugs.length ? slugs : [{ slug: "__none__" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  return getPostMetadata("project", slug, "/projects");
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  return <PostDetailView kind="project" slug={slug} basePath="/projects" />;
}
