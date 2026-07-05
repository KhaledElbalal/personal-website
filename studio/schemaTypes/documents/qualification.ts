import { defineArrayMember, defineField, defineType } from "sanity";

// One unified credential type for the Qualifications page. The `kind` field
// selects which section it renders in (Education / Experience / Certificate /
// Award), so a single schema + one record per real credential covers all four
// sections with no duplicated data. Replaces the old `timelineEntry` type.
export const qualification = defineType({
  name: "qualification",
  title: "Qualification",
  type: "document",
  fields: [
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      description: "Which section this credential appears in.",
      options: {
        list: [
          { title: "Education", value: "education" },
          { title: "Experience", value: "experience" },
          { title: "Certificate", value: "certificate" },
          { title: "Award / Competition", value: "award" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      type: "string",
      description:
        'e.g. "Software Engineer — Cegedim" or "AWS Certified Cloud Practitioner".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subtitle",
      type: "string",
      description:
        'Secondary line, e.g. "Amazon Web Services · CLF-C02" or "Faculty of Computers & AI · Distinction with Honors".',
    }),
    defineField({
      name: "location",
      type: "string",
      description: 'Experience only, e.g. "Cairo, EG".',
    }),
    defineField({
      name: "startDate",
      type: "date",
      options: { dateFormat: "MMM YYYY" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "endDate",
      type: "date",
      options: { dateFormat: "MMM YYYY" },
      description: "Leave empty for a single-date item; or tick “Ongoing”.",
    }),
    defineField({
      name: "current",
      title: "Ongoing (show “Present”)",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "bullets",
      title: "Detail bullets",
      type: "array",
      of: [defineArrayMember({ type: "text", rows: 2 })],
      description: "Experience bullet points, or a one-line summary.",
    }),
    defineField({
      name: "tags",
      title: "Tags / coursework",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      description: "Coursework or skill chips (education).",
    }),
    defineField({
      name: "logo",
      title: "Issuer logo",
      type: "image",
      description: "Certificate issuer logo.",
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
      name: "metric",
      title: "Highlight metric",
      type: "object",
      description: "Optional headline figure, e.g. GPA.",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "value",
          type: "string",
          description: 'e.g. "3.76".',
        }),
        defineField({
          name: "label",
          type: "string",
          description: 'e.g. "/ 4.0".',
        }),
      ],
    }),
    defineField({
      name: "featured",
      type: "boolean",
      description:
        "Render as the bordered feature card (used for the primary degree).",
      initialValue: false,
    }),
    defineField({
      name: "order",
      type: "number",
      description: "Sort order within the section (lower shows first).",
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: "Section, then order",
      name: "kindOrder",
      by: [
        { field: "kind", direction: "asc" },
        { field: "order", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "title", kind: "kind", media: "logo" },
    prepare({ title, kind, media }) {
      const label = typeof kind === "string" ? kind : "";
      return {
        title,
        subtitle: label ? label[0].toUpperCase() + label.slice(1) : "",
        media,
      };
    },
  },
});
