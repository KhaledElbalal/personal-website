import type { Metadata } from "next";

import { PostListView } from "@/components/content/PostListView";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing on software engineering, computer systems, and everything in between.",
  alternates: { canonical: "/blog" },
  openGraph: { url: "/blog" },
};

export default async function BlogPage() {
  return (
    <PostListView
      kind="post"
      basePath="/blog"
      title="Personal Blog"
      eyebrow="LATEST POSTS"
      emptyMessage="Posts are coming soon."
    />
  );
}
