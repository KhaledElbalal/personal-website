import { defineArrayMember, defineField, defineType } from "sanity";

// One unified "career history" type. `type` selects how an entry renders:
// the git-log Timeline (Home + Qualifications "Experience") draws the
// chronological types; the Qualifications page also renders the degree as an
// Education card, and awards/achievements as Honors & Awards rows. A single
// record per real credential covers every view — no duplicated data.
//
// The git-log `hash`, `ref` and commit `text` are DERIVED at render time
// (see components/content/Timeline.tsx), not stored here.

// Which `type` values each conditional field applies to.
const DATED_RANGE = ["job", "internship", "degree", "extracurricular"]; // endDate + current
const WORK = ["job", "internship"]; // location
const DETAILED = ["job", "internship", "degree", "achievement", "extracurricular"];

const shownFor =
  (types: readonly string[]) =>
  ({ document }: { document?: Record<string, unknown> }) =>
    !types.includes(document?.type as string);

export const experience = defineType({
  name: "experience",
  title: "Experience / Credential",
  type: "document",
  fields: [
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      description: "Selects which sections this entry renders in.",
      options: {
        list: [
          { title: "Job", value: "job" },
          { title: "Internship", value: "internship" },
          { title: "Degree", value: "degree" },
          { title: "Certificate", value: "certificate" },
          { title: "Award", value: "award" },
          { title: "Achievement", value: "achievement" },
          { title: "Extracurricular", value: "extracurricular" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      type: "string",
      description:
        'Role / degree / certificate / award name (e.g. "Software Engineer", "BSc Data Science", "ECPC Finalist").',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "organization",
      type: "string",
      description:
        'Company / institution / issuer (e.g. "Cegedim", "Cairo University", "Amazon Web Services").',
    }),
    defineField({
      name: "startDate",
      type: "date",
      options: { dateFormat: "MMM YYYY" },
      description: "Primary sort key (newest first).",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "endDate",
      type: "date",
      options: { dateFormat: "MMM YYYY" },
      description: "Leave empty for a single-date entry; or tick “Ongoing”.",
      hidden: shownFor(DATED_RANGE),
    }),
    defineField({
      name: "current",
      title: "Ongoing (show “Present” / mark as HEAD)",
      type: "boolean",
      initialValue: false,
      hidden: shownFor(DATED_RANGE),
    }),
    defineField({
      name: "location",
      type: "string",
      description: 'Workplace location, e.g. "Cairo, EG".',
      hidden: shownFor(WORK),
    }),
    defineField({
      name: "detail",
      title: "Detail",
      type: "text",
      rows: 3,
      description:
        "The CV paragraph shown when a Timeline commit is expanded (“git show”).",
      hidden: shownFor(DETAILED),
    }),
    defineField({
      name: "tags",
      title: "Coursework / tags",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      description: "Coursework or skill chips (degree).",
      hidden: ({ document }) => document?.type !== "degree",
    }),
    defineField({
      name: "metric",
      title: "Highlight metric",
      type: "object",
      description: "Optional headline figure, e.g. GPA (degree).",
      options: { collapsible: true, collapsed: true },
      hidden: ({ document }) => document?.type !== "degree",
      fields: [
        defineField({ name: "value", type: "string", description: 'e.g. "3.76".' }),
        defineField({ name: "label", type: "string", description: 'e.g. "/ 4.0".' }),
      ],
    }),
    defineField({
      name: "logo",
      title: "Issuer logo",
      type: "image",
      description: "Certificate issuer logo.",
      hidden: ({ document }) => document?.type !== "certificate",
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description: "Describe the logo for screen readers (e.g. “AWS logo”).",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "featured",
      type: "boolean",
      description: "Highlight this entry (e.g. the primary degree).",
      initialValue: false,
    }),
    defineField({
      name: "order",
      type: "number",
      description: "Tie-breaker for entries sharing a date (lower shows first).",
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "byDate",
      by: [
        { field: "startDate", direction: "desc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "title", type: "type", org: "organization", media: "logo" },
    prepare({ title, type, org, media }) {
      const label = typeof type === "string" ? type : "";
      return {
        title,
        subtitle: [label ? label[0].toUpperCase() + label.slice(1) : "", org]
          .filter(Boolean)
          .join(" · "),
        media,
      };
    },
  },
});
