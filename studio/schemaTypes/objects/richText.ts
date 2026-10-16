import { defineArrayMember, defineField } from "sanity";

export const REFERENCE_KINDS = [
  { title: "PEP", value: "pep" },
  { title: "C++ paper (WG21)", value: "wg21" },
  { title: "Man page", value: "man" },
  { title: "RFC", value: "rfc" },
  { title: "Other link", value: "link" },
];

const link = defineArrayMember({
  name: "link",
  type: "object",
  title: "Link",
  fields: [
    defineField({
      name: "href",
      type: "url",
      validation: (rule) => rule.uri({ scheme: ["http", "https", "mailto"] }),
    }),
  ],
});

/**
 * Citation of a primary source. The site resolves the title/status/date from
 * the source itself (peps.python.org, wg21.link, man7.org, rfc-editor.org),
 * shows them on hover, and lists every reference under "Sources".
 */
const citation = defineArrayMember({
  name: "citation",
  type: "object",
  title: "Reference (PEP / paper / man page / RFC)",
  fields: [
    defineField({
      name: "kind",
      type: "string",
      options: { list: REFERENCE_KINDS, layout: "radio", direction: "horizontal" },
      initialValue: "pep",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "id",
      title: "Identifier",
      type: "string",
      description: 'PEP: "492" · WG21: "P0057R8", "N4680", or "P2300" for the latest revision · man: "epoll(7)" · RFC: "9293"',
      hidden: ({ parent }) => parent?.kind === "link",
      validation: (rule) =>
        rule.custom((v, ctx) =>
          (ctx.parent as { kind?: string })?.kind !== "link" && !v ? "Required for this kind of reference." : true,
        ),
    }),
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      description: "Only for “Other link”, or to point at a specific section.",
      validation: (rule) =>
        rule.custom((v, ctx) => ((ctx.parent as { kind?: string })?.kind === "link" && !v ? "Required for a link." : true)),
    }),
    defineField({
      name: "title",
      type: "string",
      description: "Optional — overrides the title fetched from the source (required for “Other link”).",
    }),
  ],
});

/** Margin note: the annotated text gets a number; the note sits beside it. */
const sidenote = defineArrayMember({
  name: "sidenote",
  type: "object",
  title: "Margin note",
  fields: [
    defineField({
      name: "note",
      type: "text",
      rows: 3,
      description: "Shown in the right margin on wide screens, or expanded inline when tapped.",
      validation: (rule) => rule.required(),
    }),
  ],
});

/** Post body paragraphs/headings: links, references and margin notes. */
export const bodyBlock = defineArrayMember({
  type: "block",
  marks: { annotations: [link, citation, sidenote] },
  // The note's number and text render after the annotated words; inside a
  // link or citation they'd end up inside the <a>.
  validation: (rule) =>
    rule.custom((value) => {
      const block = value as { children?: { marks?: string[] }[]; markDefs?: { _key: string; _type: string }[] } | undefined;
      const type = new Map((block?.markDefs ?? []).map((d) => [d._key, d._type]));
      const clash = block?.children?.some((c) => {
        const kinds = (c.marks ?? []).map((m) => type.get(m));
        return kinds.includes("sidenote") && kinds.some((k) => k === "link" || k === "citation");
      });
      return clash ? "Put the margin note on different words than a link or citation (e.g. the words right after it)." : true;
    }).warning(),
});

/** Callout paragraphs: no headings, and no margin notes (there's no margin inside a box). */
export const calloutBlock = defineArrayMember({
  type: "block",
  styles: [{ title: "Normal", value: "normal" }],
  marks: { annotations: [link, citation] },
});
