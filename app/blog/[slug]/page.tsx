import type { Metadata } from "next";

import {
  PostDetailView,
  getPostMetadata,
  getPostSlugs,
} from "@/components/content/PostDetailView";

type Params = { slug: string };

// Prerender published posts. Cache Components forbids an empty
// generateStaticParams, so when nothing is published yet we return a throwaway
// placeholder (which 404s); real slugs published later render on demand via the
// default dynamicParams and prerender on the next build.
export async function generateStaticParams() {
  const slugs = await getPostSlugs("post");
  return slugs.length ? slugs : [{ slug: "__none__" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  return getPostMetadata("post", slug, "/blog");
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  return <PostDetailView kind="post" slug={slug} basePath="/blog" />;
}
