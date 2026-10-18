import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { PostDetailView, type Fetcher } from "@/components/content/PostDetailView";
import { previewClient } from "@/sanity/preview";

// Draft Mode only (proxy.ts rewrites /blog/<slug> and /projects/<slug> here
// when the Draft Mode cookie is present). Always dynamic, reads drafts.
export const metadata: Metadata = { robots: { index: false, follow: false } };

const SECTIONS = { blog: { kind: "post", basePath: "/blog" }, projects: { kind: "project", basePath: "/projects" } } as const;

// A placeholder param so the layout's pathname-aware client components can
// prerender (Cache Components); real slugs render per request.
export function generateStaticParams() {
  return [{ section: "blog", slug: "__preview__" }];
}

const draftFetcher: Fetcher = (query, params = {}) => previewClient.fetch(query, params);

async function Preview({ params }: { params: Promise<{ section: string; slug: string }> }) {
  const { section, slug } = await params;
  const target = SECTIONS[section as keyof typeof SECTIONS];
  if (!target || !(await draftMode()).isEnabled) notFound();
  return <PostDetailView kind={target.kind} slug={slug} basePath={target.basePath} fetcher={draftFetcher} />;
}

export default function PreviewPage(props: { params: Promise<{ section: string; slug: string }> }) {
  return (
    <Suspense fallback={null}>
      <Preview params={props.params} />
    </Suspense>
  );
}
