import { defineArrayMember, defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      type: "string",
      description: 'Tag label, e.g. "FRONTEND" or "ML PROJECT".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "date",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cover",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description: "Describe the image for screen readers and SEO.",
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: "summary",
      type: "text",
      rows: 3,
      description: "One-line teaser shown on cards and rows.",
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "featured",
      type: "boolean",
      initialValue: false,
      description: 'Show in the Home "Recent Work" grid.',
    }),
    defineField({
      name: "path",
      type: "string",
      description:
        "Optional terminal-path override for the open CTA, e.g. ~/ml/diabetes.ipynb.",
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        defineArrayMember({ type: "block" }),
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alternative text",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "cover" },
  },
});
