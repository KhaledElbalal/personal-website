import type { Metadata } from "next";

import { PostListView } from "@/components/content/PostListView";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects by Khaled Ibrahim.",
};

export default async function ProjectsPage() {
  return (
    <PostListView
      kind="project"
      basePath="/projects"
      title="Projects"
      eyebrow="FEATURED"
      emptyMessage="Projects are coming soon."
    />
  );
}
