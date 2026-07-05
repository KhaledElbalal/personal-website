import { defineArrayMember, defineField, defineType } from "sanity";

// Page-level content for the Qualifications page (singleton). The per-credential
// rows live in `qualification` documents; this holds the hero intro, the CV
// file, and the three headline stats.
export const qualificationsPage = defineType({
  name: "qualificationsPage",
  title: "Qualifications Page",
  type: "document",
  fields: [
    defineField({
      name: "intro",
      type: "text",
      rows: 3,
      description: "Hero intro paragraph.",
    }),
    defineField({
      name: "cv",
      title: "CV file (PDF)",
      type: "file",
      options: { accept: ".pdf" },
      description: "Linked from the “Download CV” button.",
    }),
    defineField({
      name: "stats",
      title: "Hero stats",
      type: "array",
      description: "Up to three headline figures shown in the hero.",
      validation: (rule) => rule.max(3),
      of: [
        defineArrayMember({
          type: "object",
          name: "stat",
          fields: [
            defineField({
              name: "value",
              type: "string",
              description: 'e.g. "100M+".',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "label",
              type: "string",
              description: 'e.g. "records in prod".',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "value", subtitle: "label" } },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Qualifications Page" }),
  },
});
