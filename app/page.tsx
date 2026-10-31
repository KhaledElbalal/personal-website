import { About } from "@/components/home/About";
import { Capabilities } from "@/components/home/Capabilities";
import { CareerBar } from "@/components/home/CareerBar";
import { GitLog } from "@/components/home/GitLog";
import { Hero } from "@/components/home/Hero";
import type { LedgerRow } from "@/components/home/WorkLedger";
import { WorkSection } from "@/components/home/WorkSection";
import { Button } from "@/components/ui";
import { getCareerStages } from "@/lib/career";
import { HERO_KIND, HERO_SENTENCE, SITE_NAME } from "@/lib/site";
import { contactHref, resolveSocialLinks } from "@/lib/social-links";
import { toTimelineEntries } from "@/sanity/experience";
import { sanityFetch } from "@/sanity/fetch";
import { urlFor } from "@/sanity/image";
import {
  EXPERIENCE_QUERY,
  POSTS_QUERY,
  SITE_SETTINGS_QUERY,
  SKILLS_QUERY,
} from "@/sanity/queries";
import type {
  EXPERIENCE_QUERY_RESULT,
  POSTS_QUERY_RESULT,
  SITE_SETTINGS_QUERY_RESULT,
  SKILLS_QUERY_RESULT,
} from "@/sanity.types";

// Fallback if no `skill` documents are published yet.
const DEFAULT_SKILLS = [
  {
    _id: "backend",
    role: "Backend Engineering",
    description:
      "Designing and implementing scalable backend services and APIs with a focus on performance and reliability.",
    items: ["fastapi", "postgresql", "ruby on rails", "couchbase", "redis", "rabbitmq", "aws"],
  },
  {
    _id: "ml",
    role: "AI & Machine Learning",
    description:
      "Bachelor's in Data Science with hands-on experience in building and deploying classical machine learning models. Experienced in Agentic AI and LLMs.",
    items: ["python", "pandas", "numpy", "scikit-learn", "tensorflow", "llms", "agentic-ai"],
  },
  {
    _id: "competitive",
    role: "Competitive Programming",
    description:
      "Sharpening problem-solving through algorithmic contests and hundreds of solved problems across online judges.",
    items: ["cpp", "stl", "algorithms", "codeforces", "leetcode"],
  },
];

// "ML PROJECT" -> "ML project"; short acronyms like "AI/ML" stay as typed.
const sentenceCase = (s?: string | null) =>
  !s
    ? "Project"
    : s.length <= 5 || /[a-z]/.test(s)
      ? s
      : s.charAt(0) + s.slice(1).toLowerCase();

function toLedger(posts: POSTS_QUERY_RESULT): LedgerRow[] {
  return posts.slice(0, 12).map((p) => ({
    id: p._id,
    title: p.title ?? "",
    kind: sentenceCase(p.category),
    year: (p.startDate ?? p.endDate ?? p.date ?? "").slice(0, 4),
    summary: p.summary,
    slug: p.slug ?? p._id,
    href: p.slug ? `/projects/${p.slug}` : "/projects",
    image: p.cover ? urlFor(p.cover).width(840).height(630).url() : null,
    svg: p.coverSvg,
  }));
}

export default async function Home() {
  const [settings, skills, projects, experience] = await Promise.all([
    sanityFetch<SITE_SETTINGS_QUERY_RESULT>(SITE_SETTINGS_QUERY, {}, ["siteSettings"]),
    sanityFetch<SKILLS_QUERY_RESULT>(SKILLS_QUERY, {}, ["skill"]),
    sanityFetch<POSTS_QUERY_RESULT>(POSTS_QUERY, { kind: "project" }, ["post"]),
    sanityFetch<EXPERIENCE_QUERY_RESULT>(EXPERIENCE_QUERY, {}, ["experience"]),
  ]);

  const contact = contactHref(settings?.email);
  const stages = await getCareerStages(experience);

  return (
    <>
      <Hero
        name={settings?.siteName || SITE_NAME}
        sentence={HERO_SENTENCE}
        action={<Button href={contact}>Get in touch</Button>}
        kind={HERO_KIND}
        links={resolveSocialLinks(settings?.socialLinks ?? undefined)}
      />
      <About contactHref={contact} />
      <Capabilities skills={skills.length ? skills : DEFAULT_SKILLS} />
      <CareerBar stages={stages} />
      <GitLog entries={toTimelineEntries(experience)} />
      <WorkSection rows={toLedger(projects)} />
    </>
  );
}
