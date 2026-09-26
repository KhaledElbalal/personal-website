import { postMarkdownUrl, postUrl } from "@/lib/post-markdown";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { sanityFetch } from "@/sanity/fetch";
import { POSTS_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/queries";
import type { POSTS_QUERY_RESULT, SITE_SETTINGS_QUERY_RESULT } from "@/sanity.types";

// https://llmstxt.org — an index of the site for language models.
export async function GET() {
  const [settings, posts, projects] = await Promise.all([
    sanityFetch<SITE_SETTINGS_QUERY_RESULT>(SITE_SETTINGS_QUERY, {}, ["siteSettings"]),
    sanityFetch<POSTS_QUERY_RESULT>(POSTS_QUERY, { kind: "post" }, ["post"]),
    sanityFetch<POSTS_QUERY_RESULT>(POSTS_QUERY, { kind: "project" }, ["post"]),
  ]);
  const name = settings?.siteName || SITE_NAME;
  const about = settings?.authorBio || SITE_DESCRIPTION;

  const list = (items: POSTS_QUERY_RESULT, section: "blog" | "projects") =>
    items
      .filter((p) => p.slug)
      .map((p) => `- [${p.title ?? p.slug}](${postMarkdownUrl(section, p.slug!)})${p.summary ? `: ${p.summary}` : ""}`)
      .join("\n");

  const body = [
    `# ${name}`,
    "",
    `> ${about}`,
    "",
    `Personal site of ${name}: engineering posts and projects. Every post and project is available as Markdown by appending \`.md\` to its URL (or requesting it with \`Accept: text/markdown\`). System diagrams are included as adjacency lists (components, groups, connections, walkthroughs) plus Mermaid.`,
    "",
    "## Blog",
    "",
    list(posts, "blog") || "- (no posts yet)",
    "",
    "## Projects",
    "",
    list(projects, "projects") || "- (no projects yet)",
    "",
    "## Optional",
    "",
    `- [Home](${SITE_URL}): overview, recent work`,
    `- [Qualifications](${SITE_URL}/qualifications): education, experience, certificates`,
    `- [Blog index](${postUrl("blog", "").replace(/\/$/, "")})`,
    "",
  ].join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
