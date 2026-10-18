// Same word counting / reading time as ../../sanity/post.ts (the site), kept
// here because that file pulls in site-only imports the Studio bundle can't resolve.
type Block = {
  _type: string;
  style?: string;
  children?: { text?: string }[];
  code?: string | { code?: string | null } | null;
  tabs?: { code?: string | null }[] | null;
  body?: Block[] | null;
  steps?: { title?: string | null; text?: Block[] | null }[] | null;
};

const countWords = (text?: string | null) => text?.split(/\s+/).filter(Boolean).length ?? 0;

function words(body: Block[]): number {
  return body.reduce((total, b) => {
    if (b._type === "block") return total + countWords(b.children?.map((c) => c.text ?? "").join(" "));
    if (b._type === "code") return total + countWords(typeof b.code === "string" ? b.code : null);
    if (b._type === "codeTabs") return total + Math.max(0, ...(b.tabs ?? []).map((t) => countWords(t.code)));
    if (b._type === "callout") return total + words(b.body ?? []);
    if (b._type === "walkthrough") {
      const code = typeof b.code === "object" ? b.code?.code : null;
      const steps = (b.steps ?? []).reduce((n, s) => n + countWords(s.title) + words(s.text ?? []), 0);
      return total + countWords(code) + steps;
    }
    return total;
  }, 0);
}

export const readingMinutes = (body?: Block[]) => Math.max(1, Math.round(words(body ?? []) / 200));
export const headingCount = (body?: Block[]) =>
  (body ?? []).filter((b) => b._type === "block" && (b.style === "h2" || b.style === "h3")).length;
