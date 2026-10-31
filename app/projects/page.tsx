import type { Metadata } from "next";

import { PostListView } from "@/components/content/PostListView";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects by Khaled Ibrahim.",
  alternates: { canonical: "/projects" },
  openGraph: { url: "/projects" },
};

export default async function ProjectsPage() {
  return (
    <PostListView
      kind="project"
      basePath="/projects"
      title="Projects"
      intro="Selected projects, from agentic AI to data pipelines."
      emptyMessage="Projects are coming soon."
    />
  );
}
