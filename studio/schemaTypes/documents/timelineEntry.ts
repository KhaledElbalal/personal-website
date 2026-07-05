import { defineField, defineType } from "sanity";

// Qualifications timeline — git-log style career milestones (design Timeline).
export const timelineEntry = defineType({
  name: "timelineEntry",
  title: "Timeline Entry",
  type: "document",
  fields: [
    defineField({
      name: "hash",
      title: "Commit hash",
      type: "string",
      description: "Short fake commit hash, e.g. e7a2f1.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "text",
      title: "Message",
      type: "string",
      description:
        'Conventional-commit style message, e.g. "feat: joined Cegedim as Software Engineer".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "ref",
      title: "Ref label",
      type: "string",
      description: "Optional git ref tag shown on the row.",
      options: {
        list: [
          { title: "None", value: "none" },
          { title: "HEAD (current)", value: "HEAD" },
          { title: "Contest", value: "contest" },
        ],
        layout: "radio",
      },
      initialValue: "none",
    }),
    defineField({
      name: "date",
      type: "string",
      description: 'Display date, e.g. "Oct 2024".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "detail",
      type: "text",
      rows: 2,
      description: "CV detail revealed on hover/focus.",
    }),
    defineField({
      name: "order",
      type: "number",
      description: "Sort order (lower shows first).",
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: "Timeline order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "text", subtitle: "date" },
  },
});
