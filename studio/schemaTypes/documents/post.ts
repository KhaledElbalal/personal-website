import { defineArrayMember, defineField, defineType } from "sanity";

// Unified content type for both Projects and the Blog. `kind` selects which
// list/detail template renders it and which date/meta fields apply — one
// record shape covers both, matching how `experience` unifies career
// entries. Project-only fields: startDate/endDate/current, featured, path.
// Post-only fields: date, tags, series.
const shownFor =
  (kind: "project" | "post") =>
  ({ document }: { document?: Record<string, unknown> }) =>
    document?.kind !== kind;

export const post = defineType({
  name: "post",
  title: "Project / Post",
  type: "document",
  fields: [
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      options: {
        list: [
          { title: "Project", value: "project" },
          { title: "Blog Post", value: "post" },
        ],
        layout: "radio",
      },
      initialValue: "post",
      validation: (rule) => rule.required(),
    }),
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
      description: 'Tag label, e.g. "FRONTEND", "ML PROJECT", "DATA SCIENCE".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "date",
      title: "Date",
      type: "date",
      description: "Publish date.",
      hidden: shownFor("project"),
    }),
    defineField({
      name: "startDate",
      title: "Start date",
      type: "date",
      options: { dateFormat: "MMM YYYY" },
      description: "Primary sort key (newest first).",
      hidden: shownFor("project"),
    }),
    defineField({
      name: "endDate",
      title: "End date",
      type: "date",
      options: { dateFormat: "MMM YYYY" },
      description: "Leave empty for a single-date project; or tick “Ongoing”.",
      hidden: shownFor("project"),
    }),
    defineField({
      name: "current",
      title: "Ongoing (show “Present”)",
      type: "boolean",
      initialValue: false,
      hidden: shownFor("project"),
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
      description: "One-line teaser shown on cards and list rows.",
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: "featured",
      type: "boolean",
      initialValue: false,
      description: 'Show in the Home "Recent Work" grid.',
      hidden: shownFor("project"),
    }),
    defineField({
      name: "path",
      type: "string",
      description:
        "Optional terminal-path override for the open CTA, e.g. ~/ml/diabetes.ipynb.",
      hidden: shownFor("project"),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      description: 'Topic chips shown at the end of the post, e.g. "PYTHON", "SCIKIT-LEARN".',
      hidden: shownFor("post"),
    }),
    defineField({
      name: "series",
      title: "Series",
      type: "object",
      description: "Optional — set on every post that belongs to the same multi-part series.",
      options: { collapsible: true, collapsed: true },
      hidden: shownFor("post"),
      fields: [
        defineField({
          name: "name",
          type: "string",
          description: 'Series name, e.g. "ML in Production". Must match exactly across posts in the series.',
        }),
        defineField({
          name: "part",
          type: "number",
          description: "1-indexed position of this post within the series.",
          validation: (rule) => rule.min(1).integer(),
        }),
      ],
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
        defineArrayMember({
          type: "object",
          name: "code",
          title: "Code cell",
          fields: [
            defineField({
              name: "label",
              type: "string",
              description: 'Optional cell label, e.g. "In [1]:".',
            }),
            defineField({
              name: "language",
              type: "string",
              description: 'e.g. "python", "bash", "ts".',
            }),
            defineField({
              name: "code",
              type: "text",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "output",
              title: "Output",
              type: "text",
              description: 'Optional — rendered as an "Out [n]:" result below the cell.',
            }),
          ],
          preview: {
            select: { code: "code", language: "language" },
            prepare({ code, language }) {
              return {
                title: language ? `Code (${language})` : "Code",
                subtitle: code?.slice(0, 60),
              };
            },
          },
        }),
      ],
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "byDate",
      by: [
        { field: "startDate", direction: "desc" },
        { field: "date", direction: "desc" },
      ],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "cover", kind: "kind" },
    prepare({ title, subtitle, media, kind }) {
      return {
        title,
        subtitle: [kind === "project" ? "Project" : "Post", subtitle]
          .filter(Boolean)
          .join(" · "),
        media,
      };
    },
  },
});
