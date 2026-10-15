import { getPostSlugs } from "@/components/content/PostDetailView";
import { postToMarkdown, postUrl } from "@/lib/post-markdown";
import { sanityFetch } from "@/sanity/fetch";
import { POST_BY_SLUG_QUERY } from "@/sanity/queries";
import type { POST_BY_SLUG_QUERY_RESULT } from "@/sanity.types";

// Served at /blog/<slug>.md and /projects/<slug>.md (rewrites in next.config.ts).
const SECTIONS = { blog: "post", projects: "project" } as const;
type Section = keyof typeof SECTIONS;

export async function generateStaticParams() {
  const [posts, projects] = await Promise.all([getPostSlugs("post"), getPostSlugs("project")]);
  const params = [
    ...posts.map((p) => ({ section: "blog", slug: p.slug })),
    ...projects.map((p) => ({ section: "projects", slug: p.slug })),
  ];
  // Cache Components forbids an empty list (see app/blog/[slug]/page.tsx).
  return params.length ? params : [{ section: "blog", slug: "__none__" }];
}

export async function GET(_: Request, ctx: { params: Promise<{ section: string; slug: string }> }) {
  const { section, slug } = await ctx.params;
  if (!(section in SECTIONS)) return new Response("Not found", { status: 404 });
  const post = await sanityFetch<POST_BY_SLUG_QUERY_RESULT>(POST_BY_SLUG_QUERY, { slug }, ["post"]);
  if (!post || post.kind !== SECTIONS[section as Section]) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(postToMarkdown(post, postUrl(section as Section, slug)), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
    },
  });
}
