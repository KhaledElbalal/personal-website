import { defineArrayMember, defineField, defineType } from "sanity";

import { calloutBlock } from "./richText";

/**
 * Step-through explanation: one code cell and/or one (multi-page) diagram,
 * and a list of steps. Each step highlights its lines in the code and shows
 * its page of the diagram, so text, code and picture move together.
 */
export const walkthrough = defineType({
  name: "walkthrough",
  title: "Walkthrough (code + diagram steps)",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", description: 'e.g. "What happens on await".' }),
    defineField({
      name: "code",
      type: "code",
      description: "Shown beside every step; each step highlights its own lines.",
    }),
    defineField({
      name: "diagram",
      type: "diagram",
      description: "Optional. Use pages in the editor (one per stage); each step picks a page.",
    }),
    defineField({
      name: "steps",
      type: "array",
      validation: (rule) => rule.required().min(2),
      of: [
        defineArrayMember({
          type: "object",
          name: "walkStep",
          title: "Step",
          fields: [
            defineField({ name: "title", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "text", type: "array", of: [calloutBlock] }),
            defineField({
              name: "lines",
              title: "Highlight lines",
              type: "string",
              description: 'Lines of the code to highlight in this step, e.g. "4" or "4-6, 9".',
            }),
            defineField({
              name: "page",
              title: "Diagram page",
              type: "number",
              description: "1 = first page. Leave empty to keep the previous step's page.",
              validation: (rule) => rule.integer().min(1),
            }),
          ],
          preview: {
            select: { title: "title", lines: "lines", page: "page" },
            prepare({ title, lines, page }: { title?: string; lines?: string; page?: number }) {
              const bits = [lines ? `lines ${lines}` : null, page ? `page ${page}` : null].filter(Boolean);
              return { title, subtitle: bits.join(" · ") };
            },
          },
        }),
      ],
    }),
  ],
  validation: (rule) =>
    rule.custom((v: { code?: { code?: string }; diagram?: { svg?: string } } | undefined) =>
      v && !v.code?.code && !v.diagram?.svg ? "Add code, a diagram, or both — that's what the steps walk through." : true,
    ),
  preview: {
    select: { title: "title", steps: "steps" },
    prepare({ title, steps }: { title?: string; steps?: unknown[] }) {
      return { title: title ?? "Walkthrough", subtitle: `${steps?.length ?? 0} steps` };
    },
  },
});
