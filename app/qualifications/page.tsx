import type { Metadata } from "next";

import { AwardRow } from "@/components/qualifications/AwardRow";
import { CertificateRow } from "@/components/qualifications/CertificateRow";
import { EducationCard } from "@/components/qualifications/EducationCard";
import { ExperienceRow } from "@/components/qualifications/ExperienceRow";
import { StatBlock } from "@/components/qualifications/StatBlock";
import { Button, PageHeader, SectionHeadingWithBlob } from "@/components/ui";
import { formatMonth, formatRange } from "@/sanity/experience";
import { sanityFetch } from "@/sanity/fetch";
import { urlFor } from "@/sanity/image";
import { EXPERIENCE_QUERY, QUALIFICATIONS_PAGE_QUERY } from "@/sanity/queries";
import type {
  EXPERIENCE_QUERY_RESULT,
  QUALIFICATIONS_PAGE_QUERY_RESULT,
} from "@/sanity.types";

export const metadata: Metadata = {
  title: "Qualifications",
  description:
    "Education, experience, certificates, and awards for Khaled Elbalal.",
};

const DEFAULT_INTRO =
  "The paper trail: a data science degree with honors, production systems at Cegedim, and a contest record that keeps compiling.";

export default async function QualificationsPage() {
  const [page, experience] = await Promise.all([
    sanityFetch<QUALIFICATIONS_PAGE_QUERY_RESULT>(
      QUALIFICATIONS_PAGE_QUERY,
      {},
      ["qualificationsPage"],
    ),
    sanityFetch<EXPERIENCE_QUERY_RESULT>(EXPERIENCE_QUERY, {}, ["experience"]),
  ]);

  const degree = experience.find((e) => e.type === "degree");
  const roles = experience.filter(
    (e) =>
      e.type === "job" || e.type === "internship" || e.type === "extracurricular",
  );
  const certificates = experience.filter((e) => e.type === "certificate");
  const honors = experience.filter(
    (e) => e.type === "award" || e.type === "achievement",
  );

  return (
    <>
      <PageHeader
        as="h1"
        title="Qualifications"
        intro={page?.intro ?? DEFAULT_INTRO}
        actions={
          page?.cvUrl ? (
            <Button href={page.cvUrl} target="_blank" rel="noopener noreferrer">
              Download CV ↓
            </Button>
          ) : undefined
        }
        aside={
          page?.stats?.length ? (
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              {page.stats.map((s) => (
                <StatBlock key={s._key} value={s.value ?? ""} label={s.label ?? ""} />
              ))}
            </div>
          ) : undefined
        }
      />

      <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-10">
        {degree ? (
          <section aria-labelledby="education-heading" className="pb-14">
            <SectionHeadingWithBlob id="education-heading">
              Education
            </SectionHeadingWithBlob>
            <EducationCard
              degree={degree.title ?? ""}
              institution={degree.organization ?? undefined}
              subtitle={degree.detail ?? undefined}
              tags={degree.tags ?? []}
              metricValue={degree.metric?.value}
              metricLabel={degree.metric?.label}
              dateRange={formatRange(degree)}
            />
          </section>
        ) : null}

        {roles.length ? (
          <section aria-labelledby="experience-heading" className="pb-14">
            <SectionHeadingWithBlob id="experience-heading">
              Experience
            </SectionHeadingWithBlob>
            <div>
              {roles.map((role) => (
                <ExperienceRow
                  key={role._id}
                  dateRange={formatRange(role)}
                  location={role.location ?? undefined}
                  title={role.title ?? ""}
                  company={role.organization ?? undefined}
                  bullets={
                    role.detail
                      ? role.detail.split("\n").filter(Boolean)
                      : []
                  }
                />
              ))}
            </div>
          </section>
        ) : null}

        {certificates.length ? (
          <section aria-labelledby="certificates-heading" className="pb-14">
            <SectionHeadingWithBlob id="certificates-heading">
              Certificates
            </SectionHeadingWithBlob>
            <div>
              {certificates.map((cert) => (
                <CertificateRow
                  key={cert._id}
                  logo={
                    cert.logo
                      ? urlFor(cert.logo).width(128).height(128).url()
                      : undefined
                  }
                  logoAlt={cert.logo?.alt ?? ""}
                  name={cert.title ?? ""}
                  issuer={cert.organization ?? undefined}
                  date={formatMonth(cert.startDate)}
                />
              ))}
            </div>
          </section>
        ) : null}

        {honors.length ? (
          <section aria-labelledby="awards-heading">
            <SectionHeadingWithBlob id="awards-heading">
              Awards &amp; Competitions
            </SectionHeadingWithBlob>
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
          </section>
        ) : null}
      </div>
    </>
  );
}
