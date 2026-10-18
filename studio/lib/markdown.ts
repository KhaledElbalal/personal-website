import { markdownToPortableText } from "@portabletext/markdown";

// Block-level syntax at the start of a line: heading, fence, list, quote.
const BLOCK = /^(?:#{1,6}\s|```|~~~|>\s|\s*[-*+]\s|\s*\d+[.)]\s)/m;
const INLINE = [/\*\*[^*\n]+\*\*/, /\[[^\]\n]+\]\([^)\n]+\)/, /(?<!`)`[^`\n]+`(?!`)/];

/** Heuristic: is this pasted plain text Markdown rather than prose? */
export function looksLikeMarkdown(text: string) {
  if (BLOCK.test(text)) return text.includes("\n") || /^#{1,6}\s|^\s*[-*+]\s/.test(text);
  return INLINE.filter((re) => re.test(text)).length >= 2;
}

/**
 * Markdown → Portable Text for the post body. Only constructs the site
 * renders are produced: h2/h3, blockquote, lists, strong/em/code, links and
 * `code` cells. Images and tables degrade to plain text.
 */
export function markdownToBody(markdown: string) {
  return markdownToPortableText(markdown, {
    block: {
      normal: () => "normal",
      blockquote: () => "blockquote",
      h1: () => "h2",
      h2: () => "h2",
      h3: () => "h3",
      h4: () => "h3",
      h5: () => "h3",
      h6: () => "h3",
    },
    listItem: { bullet: () => "bullet", number: () => "number" },
    marks: {
      strong: () => "strong",
      em: () => "em",
      code: () => "code",
      strikeThrough: () => "strike-through",
      link: ({ context, value }) => ({ _type: "link", _key: context.keyGenerator(), href: value.href }),
    },
    types: {
      code: ({ context, value }) => ({
        _type: "code",
        _key: context.keyGenerator(),
        ...(value.language ? { language: value.language } : {}),
        code: value.code,
      }),
      horizontalRule: () => undefined,
    },
  });
}
