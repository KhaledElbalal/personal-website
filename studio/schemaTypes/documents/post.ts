import { defineArrayMember, defineField, defineType } from "sanity";

import { BodyInput } from "../../components/BodyInput";
import { bodyBlock } from "../objects/richText";

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
  groups: [
    { name: "content", title: "Write", default: true },
    { name: "details", title: "Details" },
    { name: "cover", title: "Cover" },
    { name: "series", title: "Series" },
  ],
  fields: [
    defineField({
      name: "kind",
      group: "details",
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
      group: ["content", "details"],
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      group: ["content", "details"],
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      group: "details",
      type: "string",
      description: 'Tag label, e.g. "FRONTEND", "ML PROJECT", "DATA SCIENCE".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "date",
      group: "details",
      title: "Date",
      type: "date",
      description: "Publish date.",
      hidden: shownFor("project"),
    }),
    defineField({
      name: "startDate",
      group: "details",
      title: "Start date",
      type: "date",
      options: { dateFormat: "MMM YYYY" },
      description: "Primary sort key (newest first).",
      hidden: shownFor("project"),
    }),
    defineField({
      name: "endDate",
      group: "details",
      title: "End date",
      type: "date",
      options: { dateFormat: "MMM YYYY" },
      description: "Leave empty for a single-date project; or tick “Ongoing”.",
      hidden: shownFor("project"),
    }),
    defineField({
      name: "current",
      group: "details",
      title: "Ongoing (show “Present”)",
      type: "boolean",
      initialValue: false,
      hidden: shownFor("project"),
    }),
    defineField({
      name: "cover",
      group: "cover",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) =>
        rule.custom((value, ctx) =>
          !value && !(ctx.document as { coverDiagram?: unknown } | undefined)?.coverDiagram
            ? "No cover image or cover diagram — cards and social previews will fall back to the default."
            : true,
        ).warning(),
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
      name: "coverDiagram",
      group: "cover",
      title: "Cover diagram",
      type: "diagram",
      description:
        "Optional — use a system diagram as the cover instead of the image. Takes precedence over the cover image: live on the post, static thumbnail on cards.",
    }),
    defineField({
      name: "summary",
      group: ["content", "details"],
      type: "text",
      rows: 3,
      description: "One-line teaser shown on cards and list rows.",
      validation: (rule) => [
        rule.required().max(200),
        rule.max(160).warning("Over ~160 characters — it will likely be cut off on cards and in search results."),
      ],
    }),
    defineField({
      name: "featured",
      group: "details",
      type: "boolean",
      initialValue: false,
      description: 'Show in the Home "Recent Work" grid.',
      hidden: shownFor("project"),
    }),
    defineField({
      name: "path",
      group: "details",
      type: "string",
      description:
        "Optional terminal-path override for the open CTA, e.g. ~/ml/diabetes.ipynb.",
      hidden: shownFor("project"),
    }),
    defineField({
      name: "tags",
      group: "details",
      title: "Tags",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      description: 'Topic chips shown at the end of the post, e.g. "PYTHON", "SCIKIT-LEARN".',
      hidden: shownFor("post"),
    }),
    defineField({
      name: "series",
      group: "series",
      title: "Series",
      type: "object",
      description: "Optional — set on every post that belongs to the same multi-part series.",
      options: { collapsible: true, collapsed: true },
      hidden: shownFor("post"),
      validation: (rule) =>
        rule.custom((value) => {
          const v = value as { name?: string; part?: number } | undefined;
          if (v?.name && !v.part) return "Add this post’s part number — the series nav orders by it.";
          if (v?.part && !v.name) return "Add the series name, or clear the part number.";
          return true;
        }).warning(),
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
      group: "content",
      title: "Body",
      type: "array",
      components: { input: BodyInput },
      validation: (rule) =>
        rule.custom((value, ctx) => {
          const blocks = (value ?? []) as { _type: string; style?: string; children?: { text?: string }[] }[];
          const words = blocks.reduce(
            (n, b) => n + (b._type === "block" ? (b.children ?? []).map((c) => c.text ?? "").join(" ").split(/\s+/).filter(Boolean).length : 0),
            0,
          );
          const hasHeading = blocks.some((b) => b._type === "block" && (b.style === "h2" || b.style === "h3"));
          return words > 600 && !hasHeading ? "Long post with no H2/H3 — the table of contents will be empty." : true;
        }).warning(),
      of: [
        bodyBlock,
        defineArrayMember({ type: "diagram" }),
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
        defineArrayMember({ type: "code" }),
        defineArrayMember({ type: "codeTabs" }),
        defineArrayMember({ type: "callout" }),
        defineArrayMember({ type: "walkthrough" }),
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
