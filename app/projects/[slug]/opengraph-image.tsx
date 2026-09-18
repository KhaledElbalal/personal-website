import { ImageResponse } from "next/og";

import { getPostBySlug } from "@/components/content/PostDetailView";
import { OG_SIZE, PostOgCard, loadGoogleFont } from "@/lib/og";
import { getSiteName } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, name, fontData] = await Promise.all([
    getPostBySlug(slug),
    getSiteName(),
    loadGoogleFont("Space+Mono", 700),
  ]);

  return new ImageResponse(
    (
      <PostOgCard
        kind="project"
        category={project?.category ?? undefined}
        title={project?.title ?? "Project"}
        name={name}
      />
    ),
    {
      ...size,
      fonts: [{ name: "Space Mono", data: fontData, weight: 700, style: "normal" }],
    },
  );
}
