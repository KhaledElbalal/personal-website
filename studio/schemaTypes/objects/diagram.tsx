import { defineField, defineType } from "sanity";

import { DiagramInput, svgDataUrl } from "../../diagram/DiagramInput";

// System-design diagram drawn in the tldraw-based editor. `snapshot` keeps
// the editable canvas; `svg` is the export the blog renders inline.
export const diagram = defineType({
  name: "diagram",
  title: "Diagram",
  type: "object",
  components: { input: DiagramInput },
  fields: [
    defineField({
      name: "alt",
      title: "Alternative text",
      type: "string",
      description: "Describe what the diagram shows, for screen readers.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
    defineField({ name: "snapshot", type: "text", hidden: true }),
    defineField({
      name: "svg",
      type: "text",
      hidden: true,
      validation: (rule) => rule.required().error("Draw and save the diagram first."),
    }),
    defineField({ name: "width", type: "number", hidden: true }),
    defineField({ name: "height", type: "number", hidden: true }),
  ],
  preview: {
    select: { caption: "caption", alt: "alt", svg: "svg" },
    prepare({ caption, alt, svg }) {
      return {
        title: caption || alt || "Diagram",
        subtitle: "Diagram",
        media: svg ? (
          <img src={svgDataUrl(svg)} alt="" style={{ objectFit: "contain", background: "#fff" }} />
        ) : undefined,
      };
    },
  },
});
