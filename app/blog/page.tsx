import type { Metadata } from "next";

import { PostListView } from "@/components/content/PostListView";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing on data science, frontend engineering, and everything between.",
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
