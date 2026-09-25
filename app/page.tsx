import { ExperienceTimeline } from "@/components/content/ExperienceTimeline";
import { ProjectCard } from "@/components/content/ProjectCard";
import { SkillTile } from "@/components/content/SkillTile";
import {
  LinkArrow,
  PageHeader,
  SectionHeadingWithBlob,
} from "@/components/ui";
import { DEFAULT_HERO_HEADING, DEFAULT_HERO_INTRO } from "@/lib/site";
import { formatRange } from "@/sanity/experience";
import { sanityFetch } from "@/sanity/fetch";
import { urlFor } from "@/sanity/image";
import {
  FEATURED_PROJECTS_QUERY,
  SITE_SETTINGS_QUERY,
  SKILLS_QUERY,
} from "@/sanity/queries";
import type {
  FEATURED_PROJECTS_QUERY_RESULT,
  SITE_SETTINGS_QUERY_RESULT,
  SKILLS_QUERY_RESULT,
} from "@/sanity.types";

// Fallback if no `skill` documents are published yet.
const DEFAULT_SKILLS = [
  {
    _id: "competitive",
    role: "Competitive Programmer",
    path: "~/competitive",
    description:
      "Sharpening problem-solving through algorithmic contests and hundreds of solved problems across online judges.",
    items: ["cpp", "stl", "algorithms", "codeforces", "leetcode"],
  },
  {
    _id: "backend",
    role: "Backend Engineering",
    path: "~/backend",
    description:
      "Designing and implementing scalable backend services and APIs with a focus on performance and reliability.",
    items: ["fastapi", "postgresql", "ruby on rails", "couchbase", "redis", "rabbitmq", "aws"],
  },
  {
    _id: "ml",
    role: "AI & Machine Learning",
    path: "~/ml",
    description:
      "Bachelor's in Data Science with hands-on experience in building and deploying classical machine learning models. Experienced in Agentic AI and LLMs. Built SymplifAI, an automated machine learning pipeline for tabular data, and Roomba, an online agentic AI for coding tasks.",
    items: ["python", "pandas", "numpy", "scikit-learn", "tensorflow", "llms", "agentic-ai"],
  },
];

export default async function Home() {
  const [settings, skills, featured] = await Promise.all([
    sanityFetch<SITE_SETTINGS_QUERY_RESULT>(SITE_SETTINGS_QUERY, {}, [
      "siteSettings",
    ]),
    sanityFetch<SKILLS_QUERY_RESULT>(SKILLS_QUERY, {}, ["skill"]),
    sanityFetch<FEATURED_PROJECTS_QUERY_RESULT>(
      FEATURED_PROJECTS_QUERY,
      {},
      ["post"],
    ),
  ]);

  const skillTiles = skills.length ? skills : DEFAULT_SKILLS;

  return (
    <>
      <PageHeader
        as="h1"
        title={settings?.heroHeading || DEFAULT_HERO_HEADING}
        intro={settings?.heroIntro || DEFAULT_HERO_INTRO}
        actions={<LinkArrow href="#contact">Let&apos;s get in touch</LinkArrow>}
      />

      <section aria-labelledby="about-heading">
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-16 sm:px-10">
          <SectionHeadingWithBlob id="about-heading">About Me</SectionHeadingWithBlob>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {skillTiles.map((s) => (
              <SkillTile
                key={s._id}
                path={s.path ?? undefined}
                description={s.description ?? undefined}
                items={s.items ?? undefined}
              >
                {s.role}
              </SkillTile>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="experience-heading">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-6 sm:px-10">
          <SectionHeadingWithBlob id="experience-heading">Experience</SectionHeadingWithBlob>
          <ExperienceTimeline />
        </div>
      </section>

      <section aria-labelledby="work-heading" className="bg-section">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
          <SectionHeadingWithBlob id="work-heading">Recent Work</SectionHeadingWithBlob>
          {featured.length ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <ProjectCard
                  key={p._id}
                  image={
                    p.cover
                      ? urlFor(p.cover).width(720).height(480).url()
                      : undefined
                  }
                  diagramSvg={p.coverSvg}
                  title={p.title ?? ""}
                  path={p.path ?? undefined}
                  date={formatRange(p)}
                  description={p.summary ?? undefined}
                  href={p.slug ? `/projects/${p.slug}` : "/projects"}
                />
              ))}
            </div>
          ) : (
            <p className="font-body text-base text-muted">
              More work coming soon.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
