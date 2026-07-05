import { defineArrayMember, defineField, defineType } from "sanity";

// Global site content (singleton — one editable document). Drives the hero,
// footer, and social links shared across pages.
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "heroHeading",
      type: "string",
      description: 'Hero title, e.g. "Hello 👋, I am Khaled Elbalal".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroIntro",
      type: "text",
      rows: 3,
      description: "Intro paragraph under the hero heading.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "socialLinks",
      title: "Social links",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "socialLink",
          fields: [
            defineField({
              name: "platform",
              type: "string",
              options: {
                list: [
                  { title: "GitHub", value: "github" },
                  { title: "LinkedIn", value: "linkedin" },
                  { title: "Codeforces", value: "codeforces" },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              type: "url",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "platform", subtitle: "url" },
          },
        }),
      ],
    }),
    defineField({
      name: "footerText",
      type: "string",
      description: 'Footer copyright line, e.g. "© 2022".',
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
