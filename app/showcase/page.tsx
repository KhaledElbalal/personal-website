import type { Metadata } from "next";

import { BlogRow } from "@/components/content/BlogRow";
import { ExperienceTimeline } from "@/components/content/ExperienceTimeline";
import { ProjectCard } from "@/components/content/ProjectCard";
import { SkillTile } from "@/components/content/SkillTile";
import { AwardRow } from "@/components/qualifications/AwardRow";
import { CertificateRow } from "@/components/qualifications/CertificateRow";
import { EducationCard } from "@/components/qualifications/EducationCard";
import { ExperienceRow } from "@/components/qualifications/ExperienceRow";
import { StatBlock } from "@/components/qualifications/StatBlock";
import {
  Blob,
  Button,
  LinkArrow,
  NavLink,
  PageHeader,
  SectionHeading,
  SocialLink,
  Tag,
  Wordmark,
} from "@/components/ui";
import { formatMonth, formatRange } from "@/sanity/experience";
import { sanityFetch } from "@/sanity/fetch";
import { EXPERIENCE_QUERY } from "@/sanity/queries";
import type { EXPERIENCE_QUERY_RESULT } from "@/sanity.types";

export const metadata: Metadata = {
  title: "Design System",
  description: "Component showcase for the Khaled Elbalal portfolio.",
};

function Section({
  label,
  inline = false,
  children,
}: {
  label: string;
  inline?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-black/10 py-8">
      <h2 className="mb-5 font-mono text-sm font-bold uppercase tracking-[0.2em] text-ink">
        {label}
      </h2>
      {inline ? (
        <div className="flex flex-wrap items-center gap-x-8 gap-y-5">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}

export default async function ShowcasePage() {
  // Live content, so the gallery previews the real published data.
  const experience = await sanityFetch<EXPERIENCE_QUERY_RESULT>(
    EXPERIENCE_QUERY,
    {},
    ["experience"],
  );
  const degree = experience.find((e) => e.type === "degree");
  const roles = experience.filter(
    (e) => e.type === "job" || e.type === "internship",
  );
  const certificates = experience.filter((e) => e.type === "certificate");
  const honors = experience.filter(
    (e) => e.type === "award" || e.type === "achievement",
  );

  return (
    <div className="pb-14">
      <div className="mx-auto max-w-7xl px-6 pt-14 sm:px-10">
        <h1 className="font-mono text-[clamp(1.75rem,7vw,2.5rem)] font-bold leading-none text-heading">
          Design System
        </h1>
        <p className="mt-3 max-w-prose font-body text-base text-ink">
          Primitives and content components, responsive from large desktop down
          to iPhone SE.
        </p>
      </div>

      {/* Page header — full-bleed, breaks out of the content container. */}
      <section className="mt-8 border-t border-black/10 pt-8">
        <div className="mx-auto mb-5 max-w-7xl px-6 sm:px-10">
          <h2 className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-ink">
            Page Header (hero — full-width #F7F7F7 band)
          </h2>
        </div>
        <PageHeader
          as="h2"
          title="Qualifications"
          intro="The paper trail: a data science degree with honors, production systems at Cegedim, and a contest record that keeps compiling."
          actions={<Button href="#">Download CV ↓</Button>}
          aside={
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <StatBlock value="3.76" label="GPA, with honors" />
              <StatBlock value="100M+" label="records in prod" />
              <StatBlock value="6×" label="awards & certs" />
            </div>
          }
        />
      </section>

      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <Section label="Wordmark" inline>
          <span className="text-[40px]">
            <Wordmark />
          </span>
        </Section>

        <Section label="Button" inline>
          <Button href="#">Contact Me</Button>
          <Button href="#" variant="neutral">
            Neutral
          </Button>
          <Button>Button element</Button>
        </Section>

        <Section label="Section Heading (blob behind; band belongs to the section)">
          <div className="-mx-6 overflow-hidden bg-section px-6 py-12 sm:-mx-10 sm:px-10">
            <div className="flex items-baseline gap-5">
              <div className="relative">
                <Blob
                  size={180}
                  interactive="follow"
                  className="follow-blob absolute -left-6 -top-10 z-0"
                />
                <SectionHeading as="h3" className="relative z-10">
                  Recent Work
                </SectionHeading>
              </div>
              <SocialLink href="#" className="ml-auto">
                FEATURED
              </SocialLink>
            </div>
          </div>
        </Section>

        <Section label="Tag" inline>
          <Tag size="micro">{"ML\nPROJECT"}</Tag>
          <Tag size="chip">Data Science</Tag>
          <Tag size="outline">Frontend</Tag>
        </Section>

        <Section label="Nav Link" inline>
          <NavLink href="#">Home</NavLink>
          <NavLink href="#">Projects</NavLink>
          <NavLink href="#" active>
            Qualifications
          </NavLink>
          <NavLink href="#">Blog</NavLink>
        </Section>

        <Section label="Social Link" inline>
          <SocialLink href="#">Github</SocialLink>
          <SocialLink href="#">LinkedIn</SocialLink>
          <SocialLink href="#">Codeforces</SocialLink>
        </Section>

        <Section label="Link Arrow" inline>
          <LinkArrow href="#">Let&apos;s get in touch</LinkArrow>
        </Section>

        <Section label="Blob (ball + cluster, cursor-following)" inline>
          <div className="relative h-[240px] w-full max-w-[520px] overflow-hidden rounded-[8px] bg-section">
            <Blob
              size={300}
              interactive="follow"
              className="absolute -left-6 -top-8"
            />
            <Blob
              size={360}
              variant="cluster"
              interactive="follow"
              className="absolute -right-6 top-2"
            />
          </div>
        </Section>

        <Section label="Skill Tile — whoami (Home “About Me”)">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <SkillTile
              path="~/frontend"
              description="Building accessible, fast interfaces."
              items={["typescript", "react", "nextjs", "tailwind"]}
            >
              Frontend Web Developer
            </SkillTile>
            <SkillTile
              path="~/ml"
              description="Turning data into models that ship."
              items={["python", "pytorch", "pandas", "duckdb"]}
            >
              Data Science Student
            </SkillTile>
            <SkillTile
              path="~/cp"
              description="Codeforces Specialist, ECPC finalist."
              items={["c++", "algorithms", "graphs", "dp"]}
            >
              Competitive Programmer
            </SkillTile>
          </div>
        </Section>

        <Section label="Project Card">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ProjectCard
              title="Predicting Diabetes with Logistic Regression"
              path="~/ml/diabetes.ipynb"
              date="Oct 2022"
              description="A from-scratch classifier on the Pima dataset."
            />
            <ProjectCard
              title="Anne's Portfolio Website"
              path="~/frontend/anne"
              date="Mar 2023"
              description="Design and build in Next.js + Tailwind."
            />
            <ProjectCard
              title="Contest Rating Tracker"
              path="~/cp/tracker"
              date="Jan 2024"
              description="Scrapes and charts Codeforces progress."
            />
          </div>
        </Section>

        <Section label="Blog Row">
          <div className="flex flex-col gap-6">
            <BlogRow
              category="DATA SCIENCE"
              title="Creating a Machine Learning Model in Python"
              body="Walking through a logistic-regression classifier end to end."
              date="July 08, 2021 · 3 months"
            />
            <BlogRow
              category="FRONTEND"
              title="Custom Animations for JavaScript Websites"
              body="Scroll-driven motion that still respects reduced-motion."
              date="Feb 12, 2022"
            />
          </div>
        </Section>

        <Section label="Timeline — git log (Home “Experience”, live)">
          <ExperienceTimeline />
        </Section>

        <Section label="Qualifications — Stat blocks" inline>
          <StatBlock value="3.76" label="GPA, with honors" />
          <StatBlock value="100M+" label="records in prod" />
          <StatBlock value="6×" label="awards & certs" />
        </Section>

        <Section label="Qualifications — Education (live)">
          {degree ? (
            <EducationCard
              degree={degree.title ?? ""}
              institution={degree.organization ?? undefined}
              subtitle={degree.detail ?? undefined}
              tags={degree.tags ?? []}
              metricValue={degree.metric?.value}
              metricLabel={degree.metric?.label}
              dateRange={formatRange(degree)}
            />
          ) : (
            <p className="font-body text-sm text-muted">
              No degree published yet.
            </p>
          )}
        </Section>

        <Section label="Qualifications — Experience (live)">
          <div>
            {roles.map((role) => (
              <ExperienceRow
                key={role._id}
                dateRange={formatRange(role)}
                location={role.location ?? undefined}
                title={role.title ?? ""}
                company={role.organization ?? undefined}
                bullets={role.detail ? [role.detail] : []}
              />
            ))}
          </div>
        </Section>

        <Section label="Qualifications — Certificates (live)">
          <div>
            {certificates.map((cert) => (
              <CertificateRow
                key={cert._id}
                name={cert.title ?? ""}
                issuer={cert.organization ?? undefined}
                date={formatMonth(cert.startDate)}
              />
            ))}
          </div>
        </Section>

        <Section label="Qualifications — Awards & Competitions (live)">
          <div>
            {honors.map((honor) => (
              <AwardRow
                key={honor._id}
                title={
                  honor.type === "award" && honor.organization
                    ? `${honor.organization} ${honor.title ?? ""}`.trim()
                    : (honor.title ?? "")
                }
                date={formatRange(honor)}
              />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
