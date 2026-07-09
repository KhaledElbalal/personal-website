import { ProjectCard } from "@/components/content/ProjectCard";
import { SkillTile } from "@/components/content/SkillTile";
import { ExperienceTimeline } from "@/components/content/ExperienceTimeline";
import { Blob, LinkArrow, PageHeader, SectionHeading } from "@/components/ui";

const SKILLS = [
  {
    role: "Competitive Programmer",
    path: "~/competitive",
    description:
      "Sharpening problem-solving through algorithmic contests and hundreds of solved problems across online judges.",
    items: ["cpp", "stl", "algorithms", "codeforces", "leetcode"],
  },
  {
    role: "Backend Engineering",
    path: "~/backend",
    description:
      "Designing and implementing scalable backend services and APIs with a focus on performance and reliability.",
    items: ["fastapi", "postgresql", "ruby on rails", "couchbase", "redis", "rabbitmq", "aws"],
  },
  {
    role: "AI & Machine Learning",
    path: "~/ml",
    description:
      "Bachelor's in Data Science with hands-on experience in building and deploying classical machine learning models. Experienced in Agentic AI and LLMs. Built SymplifAI, an automated machine learning pipeline for tabular data, and Roomba, an online agentic AI for coding tasks.",
    items: ["python", "pandas", "numpy", "scikit-learn", "tensorflow", "llms", "agentic-ai"],
  },
];

const PROJECTS = [
  {
    title: "Building a coding harness for Roomba",
    path: "~/ml/roomba",
    date: "Jun 2026 - Present",
    description: "Optimized the harness for Roomba, an agentic AI for coding tasks.",
  },
  {
    title: "SymplifAI: Automated ML Pipeline for Tabular Data",
    path: "~/ml/symplifai",
    date: "Oct 2024 - Jul 2025",
    description: "Design and build in Next.js + Tailwind.",
  },
  {
    title: "Deploying and Engineering Roomba: An Agentic AI for Coding Tasks",
    path: "~/backend/roomba",
    date: "Jun 2026 - Present",
    description: "Developed a scalable backend for Roomba, deployed on AWS with Ruby on Rails, and PostgreSQL.",
  },
];

function HeadingWithBlob({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative mb-10 w-fit">
      <Blob
        size={180}
        interactive="follow"
        className="absolute -left-6 -top-10 z-0"
      />
      <SectionHeading as="h2" id={id} className="relative z-10">
        {children}
      </SectionHeading>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <PageHeader
        as="h1"
        title={
          <>
            Hello <span aria-hidden="true">👋</span>,<br />I am Khaled Ibrahim
          </>
        }
        intro="I am a Software Engineer focusing on building high performance intelligent systems. With a BSc in Data Science from Cairo University and 2 years of experience in Cegedim."
        actions={<LinkArrow href="#contact">Let&apos;s get in touch</LinkArrow>}
      />

      <section aria-labelledby="about-heading">
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-16 sm:px-10">
          <HeadingWithBlob id="about-heading">About Me</HeadingWithBlob>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SKILLS.map((s) => (
              <SkillTile
                key={s.role}
                path={s.path}
                description={s.description}
                items={s.items}
              >
                {s.role}
              </SkillTile>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="experience-heading">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-6 sm:px-10">
          <HeadingWithBlob id="experience-heading">Experience</HeadingWithBlob>
          <ExperienceTimeline />
        </div>
      </section>

      <section aria-labelledby="work-heading" className="bg-section">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
          <HeadingWithBlob id="work-heading">Recent Work</HeadingWithBlob>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.map((p) => (
              <ProjectCard
                key={p.title}
                title={p.title}
                path={p.path}
                date={p.date}
                description={p.description}
                href="/projects"
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
