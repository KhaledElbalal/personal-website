import type { Metadata } from "next";

import {
  Blob,
  Button,
  LinkArrow,
  NavLink,
  SectionHeading,
  SocialLink,
  Tag,
  Wordmark,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Design System",
  description: "Component showcase for the Khaled Elbalal portfolio primitives.",
};

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-black/10 py-8">
      <h2 className="mb-5 font-mono text-sm font-bold uppercase tracking-[0.2em] text-ink">
        {label}
      </h2>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-5">{children}</div>
    </section>
  );
}

export default function ShowcasePage() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 py-14 sm:px-10">
      <h1 className="font-mono text-[clamp(1.75rem,7vw,2.5rem)] font-bold leading-none text-heading">
        Design System
      </h1>
      <p className="mt-3 max-w-prose font-body text-base text-ink">
        The shared primitives, responsive from large desktop down to iPhone SE.
      </p>

      <Row label="Wordmark">
        <span className="text-[40px]">
          <Wordmark />
        </span>
        <span className="rounded-[4px] bg-[color:var(--color-xiketic)] px-4 py-3 text-[40px]">
          <Wordmark tone="dark" />
        </span>
        <span className="text-[28px]">
          <Wordmark variant="lockup" />
        </span>
      </Row>

      <Row label="Button">
        <Button href="#">Contact Me</Button>
        <Button href="#" variant="neutral">
          Neutral
        </Button>
        <Button>Button element</Button>
      </Row>

      <Row label="Section Heading">
        <SectionHeading as="h3">Recent Work</SectionHeading>
      </Row>

      <Row label="Tag">
        <Tag size="micro">{"ML\nPROJECT"}</Tag>
        <Tag size="chip">Data Science</Tag>
        <Tag size="outline">Frontend</Tag>
      </Row>

      <Row label="Nav Link">
        <NavLink href="#">Home</NavLink>
        <NavLink href="#">Projects</NavLink>
        <NavLink href="#" active>
          Qualifications
        </NavLink>
        <NavLink href="#">Blog</NavLink>
      </Row>

      <Row label="Social Link">
        <SocialLink href="#">Github</SocialLink>
        <SocialLink href="#">LinkedIn</SocialLink>
        <SocialLink href="#">Codeforces</SocialLink>
      </Row>

      <Row label="Link Arrow">
        <LinkArrow href="#">Let&apos;s get in touch</LinkArrow>
      </Row>

      <Row label="Blob">
        <div className="relative h-[240px] w-full max-w-[520px] overflow-hidden rounded-[8px] bg-section">
          <Blob size={300} className="absolute -left-6 -top-8" />
          <Blob size={360} variant="cluster" className="absolute -right-6 top-2" />
        </div>
      </Row>
    </div>
  );
}
