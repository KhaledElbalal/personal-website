import { defineArrayMember, defineField, defineType } from "sanity";

// Fields shared by a standalone code cell and each tab of a code-tabs block.
const codeFields = [
  defineField({
    name: "label",
    type: "string",
    description: 'Optional cell label, e.g. "In [1]:". In tabs this is the tab name, e.g. "C++20".',
  }),
  defineField({
    name: "language",
    type: "string",
    description: 'e.g. "python", "cpp", "c", "asm", "rust", "bash", "strace" (log output).',
  }),
  defineField({
    name: "filename",
    type: "string",
    description: 'Optional — shown in a bar above the code, e.g. "Modules/_asynciomodule.c".',
  }),
  defineField({
    name: "highlightLines",
    title: "Highlight lines",
    type: "string",
    description:
      'Optional, e.g. "3, 7-9". Or annotate inline with a trailing comment: # [!code highlight], // [!code ++] / [!code --], [!code focus], [!code error], [!code word:await].',
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
];

const codePreview = {
  select: { code: "code", language: "language", label: "label", filename: "filename" },
  prepare({ code, language, label, filename }: Record<string, string | undefined>) {
    return {
      title: filename ?? label ?? (language ? `Code (${language})` : "Code"),
      subtitle: code?.slice(0, 60),
    };
  },
};

export const code = defineType({
  name: "code",
  title: "Code cell",
  type: "object",
  fields: codeFields,
  preview: codePreview,
});

/** The same idea in several languages/layers, one tab each. */
export const codeTabs = defineType({
  name: "codeTabs",
  title: "Code tabs",
  type: "object",
  fields: [
    defineField({
      name: "tabs",
      type: "array",
      of: [defineArrayMember({ type: "object", name: "codeTab", title: "Tab", fields: codeFields, preview: codePreview })],
      description:
        "Tabs with the same name stay in sync across the post: picking “C++20” in one block switches every block that has a “C++20” tab.",
      validation: (rule) => rule.required().min(2),
    }),
    defineField({ name: "caption", type: "string" }),
  ],
  preview: {
    select: { tabs: "tabs", caption: "caption" },
    prepare({ tabs, caption }: { tabs?: { label?: string; language?: string }[]; caption?: string }) {
      return {
        title: caption ?? "Code tabs",
        subtitle: tabs?.map((t) => t.label ?? t.language ?? "?").join(" · "),
      };
    },
  },
});
