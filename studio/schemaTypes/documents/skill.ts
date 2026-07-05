import { defineField, defineType } from "sanity";

// "About Me" terminal SkillTile — a role and its skill tokens (design SkillTile).
export const skill = defineType({
  name: "skill",
  title: "Skill / Role",
  type: "document",
  fields: [
    defineField({
      name: "role",
      type: "string",
      description: 'Role label, e.g. "Frontend Web Developer".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 2,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "items",
      title: "Skill tokens",
      type: "array",
      of: [{ type: "string" }],
      description: 'Skill keywords, e.g. ["typescript", "react", "nextjs"].',
      options: { layout: "tags" },
    }),
    defineField({
      name: "path",
      type: "string",
      description: "Terminal path shown in the tile, e.g. ~/frontend.",
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
      title: "Display order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "role", subtitle: "path" },
  },
});
