import { defineArrayMember, defineField, defineType } from "sanity";

export const CALLOUT_TONES = [
  { title: "Note", value: "note" },
  { title: "Tip", value: "tip" },
  { title: "Warning / gotcha", value: "warning" },
  { title: "Under the hood (deep dive)", value: "deep" },
];

/**
 * Aside box. "Under the hood" + collapsed is the deep-dive pattern: readers
 * who only want the high-level path skip it, the rest open it.
 */
export const callout = defineType({
  name: "callout",
  title: "Callout / deep dive",
  type: "object",
  fields: [
    defineField({
      name: "tone",
      type: "string",
      options: { list: CALLOUT_TONES, layout: "radio", direction: "horizontal" },
      initialValue: "note",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      type: "string",
      description: 'Optional, e.g. "How CPython resumes a coroutine frame".',
    }),
    defineField({
      name: "collapsed",
      title: "Collapsible (starts closed)",
      type: "boolean",
      initialValue: false,
      description: "Shows only the title until the reader opens it. Best for long deep dives; needs a title.",
    }),
    defineField({
      name: "body",
      type: "array",
      of: [
        defineArrayMember({
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
        }),
        defineArrayMember({ type: "code" }),
        defineArrayMember({ type: "codeTabs" }),
        defineArrayMember({ type: "diagram" }),
      ],
      validation: (rule) => rule.required(),
    }),
  ],
  validation: (rule) =>
    rule.custom((v: { collapsed?: boolean; title?: string } | undefined) =>
      v?.collapsed && !v.title ? "A collapsible callout needs a title (it's all readers see when closed)." : true,
    ),
  preview: {
    select: { tone: "tone", title: "title", collapsed: "collapsed" },
    prepare({ tone, title, collapsed }: Record<string, string | boolean | undefined>) {
      const name = CALLOUT_TONES.find((t) => t.value === tone)?.title ?? "Callout";
      return { title: title ? String(title) : name, subtitle: `${name}${collapsed ? " · collapsible" : ""}` };
    },
  },
});
