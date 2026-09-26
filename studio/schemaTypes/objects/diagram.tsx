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
    defineField({
      name: "animation",
      title: "Animation",
      type: "string",
      description:
        "Ambient: flow loops while on screen (scenario pills if you recorded flows). Walkthrough: readers step through with Prev/Next. Off: static (hover-trace and enlarge still work).",
      options: {
        list: [
          { title: "Ambient", value: "ambient" },
          { title: "Walkthrough", value: "walkthrough" },
          { title: "Off", value: "off" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "ambient",
    }),
    // Superseded by `animation`; kept so older blocks don't show an unknown field.
    defineField({ name: "animateFlow", type: "boolean", hidden: true }),
    // Recorded flows (JSON), written by the diagram editor on save.
    defineField({ name: "flows", type: "text", hidden: true }),
    // Adjacency-list graph (JSON) of the first page, for Markdown / llms.txt.
    defineField({ name: "graph", type: "text", hidden: true }),
    // Every page as [{name, svg, width, height, graph}] JSON when the canvas has > 1 page.
    defineField({ name: "pages", type: "text", hidden: true }),
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
