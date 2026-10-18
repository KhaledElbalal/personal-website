// Citations of primary sources (PEPs, WG21 papers, man pages, RFCs) and
// margin notes, collected from a post body. Titles/status/dates come from the
// sources themselves, cached for days; any lookup that fails just falls back
// to the identifier and the author's own title.
import { cacheLife } from "next/cache";

export type CitationKind = "pep" | "wg21" | "man" | "rfc" | "link";

type MarkDef = {
  _key: string;
  _type: string;
  kind?: string | null;
  id?: string | null;
  url?: string | null;
  title?: string | null;
  note?: string | null;
};
type Block = {
  _type: string;
  children?: { _type: string; marks?: string[] | null }[] | null;
  markDefs?: MarkDef[] | null;
  body?: Block[] | null;
  steps?: { text?: Block[] | null }[] | null;
};

export type Citation = {
  /** Dedupe key: the same PEP cited twice is one source. */
  key: string;
  kind: CitationKind;
  /** Short handle shown in the hover card and Sources: "PEP 492", "epoll(7)". */
  label: string;
  url: string;
  title?: string;
  /** "Final · Python 3.5 · 2015", "Gor Nishanov · 2018", … */
  detail?: string;
  /** 1-based position in the Sources list. */
  n: number;
};

const KINDS = new Set<CitationKind>(["pep", "wg21", "man", "rfc", "link"]);
const MAN = /^\s*([\w.:+-]+)\s*\((\d\w*)\)\s*$/;

function identify(def: MarkDef): Omit<Citation, "n" | "detail"> | null {
  const kind = (KINDS.has(def.kind as CitationKind) ? def.kind : "link") as CitationKind;
  const id = (def.id ?? "").trim();
  const title = def.title?.trim() || undefined;
  switch (kind) {
    case "pep": {
      const num = Number(id.replace(/^pep\s*/i, ""));
      if (!Number.isInteger(num)) return null;
      return { key: `pep:${num}`, kind, label: `PEP ${num}`, url: def.url || `https://peps.python.org/pep-${String(num).padStart(4, "0")}/`, title };
    }
    case "wg21": {
      const paper = id.toUpperCase().replace(/\s+/g, "");
      if (!/^[PN]\d+(R\d+)?$/.test(paper)) return null;
      return { key: `wg21:${paper}`, kind, label: paper, url: def.url || `https://wg21.link/${paper.toLowerCase()}`, title };
    }
    case "man": {
      const m = id.match(MAN);
      if (!m) return null;
      const [, name, section] = m;
      return {
        key: `man:${name}(${section})`,
        kind,
        label: `${name}(${section})`,
        url: def.url || `https://man7.org/linux/man-pages/man${section[0]}/${name}.${section}.html`,
        title,
      };
    }
    case "rfc": {
      const num = Number(id.replace(/^rfc\s*/i, ""));
      if (!Number.isInteger(num)) return null;
      return { key: `rfc:${num}`, kind, label: `RFC ${num}`, url: def.url || `https://www.rfc-editor.org/rfc/rfc${num}`, title };
    }
    case "link": {
      if (!def.url) return null;
      let host = def.url;
      try {
        host = new URL(def.url).hostname.replace(/^www\./, "");
      } catch {}
      return { key: `link:${def.url}`, kind, label: host, url: def.url, title };
    }
  }
}

/**
 * One source's label, link and fetched metadata — for the Studio's reference
 * field to confirm an identifier resolves. Null if the identifier is invalid
 * or the source doesn't know it.
 */
export async function resolveCitation(kind: string, id: string) {
  const c = identify({ _key: "lookup", _type: "citation", kind, id });
  if (!c) return null;
  const meta = (await fetchMeta([{ key: c.key, kind: c.kind, label: c.label }]))[c.key];
  // Man pages without a fetched summary may simply not exist; PEPs/WG21/RFCs
  // are only "found" if the source index had them.
  if (!meta && c.kind !== "link") return null;
  return { label: c.label, url: c.url, title: meta?.title, detail: meta?.detail };
}

/** Walks blocks (and callout / walkthrough text) in reading order. */
function eachMark(body: Block[] | null | undefined, fn: (def: MarkDef, topLevel: boolean) => void, topLevel = true) {
  for (const block of body ?? []) {
    if (block._type === "callout") {
      eachMark(block.body, fn, false);
      continue;
    }
    if (block._type === "walkthrough") {
      for (const step of block.steps ?? []) eachMark(step.text, fn, false);
      continue;
    }
    if (block._type !== "block") continue;
    const defs = new Map((block.markDefs ?? []).map((d) => [d._key, d]));
    const seen = new Set<string>();
    for (const child of block.children ?? []) {
      for (const mark of child.marks ?? []) {
        const def = defs.get(mark);
        if (!def || seen.has(mark)) continue;
        seen.add(mark);
        fn(def, topLevel);
      }
    }
  }
}

export type PostNotes = {
  /** Sources list, in order of first citation. */
  citations: Citation[];
  /** Citation per annotation `_key`, for the inline chips. */
  citationByMark: Record<string, Citation>;
  /** Margin-note number per annotation `_key` (top-level paragraphs only). */
  sidenoteByMark: Record<string, number>;
  /** Margin notes in order, for the Markdown footnotes. */
  sidenotes: { n: number; note: string }[];
};

/** Citations (with fetched metadata) and margin-note numbering for a body. */
export async function collectNotes(body: unknown[] | null | undefined): Promise<PostNotes> {
  const found = new Map<string, Omit<Citation, "n" | "detail">>();
  const markToKey: Record<string, string> = {};
  const sidenoteByMark: Record<string, number> = {};
  const sidenotes: PostNotes["sidenotes"] = [];

  eachMark(body as Block[], (def, topLevel) => {
    if (def._type === "sidenote" && topLevel && def.note?.trim()) {
      sidenotes.push({ n: sidenotes.length + 1, note: def.note.trim() });
      sidenoteByMark[def._key] = sidenotes.length;
    }
    if (def._type !== "citation") return;
    const c = identify(def);
    if (!c) return;
    markToKey[def._key] = c.key;
    const prev = found.get(c.key);
    // First author-supplied title wins.
    if (!prev) found.set(c.key, c);
    else if (!prev.title && c.title) prev.title = c.title;
  });

  const meta = found.size ? await fetchMeta([...found.values()].map(({ key, kind, label }) => ({ key, kind, label }))) : {};
  const citations: Citation[] = [...found.values()].map((c, i) => ({
    ...c,
    n: i + 1,
    title: c.title ?? meta[c.key]?.title,
    detail: meta[c.key]?.detail,
  }));
  const byKey = new Map(citations.map((c) => [c.key, c]));
  const citationByMark = Object.fromEntries(Object.entries(markToKey).map(([mark, key]) => [mark, byKey.get(key)!]));
  return { citations, citationByMark, sidenoteByMark, sidenotes };
}

// ── Source metadata ──

type Meta = Record<string, { title?: string; detail?: string }>;
const TIMEOUT = 10_000;

const getJson = async <T,>(url: string): Promise<T | null> => {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
};

const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

async function fetchMeta(items: { key: string; kind: CitationKind; label: string }[]): Promise<Meta> {
  // One cached result per post's set of sources; the upstream indexes
  // (peps.json, the 10 MB WG21 index) are only read on a cache miss.
  "use cache";
  cacheLife("days");
  const out: Meta = {};
  const kinds = new Set(items.map((i) => i.kind));

  const [peps, wg21] = await Promise.all([
    kinds.has("pep")
      ? getJson<Record<string, { title: string; status: string; created: string; python_version?: string | null }>>(
          "https://peps.python.org/api/peps.json",
        )
      : null,
    kinds.has("wg21")
      ? getJson<Record<string, { title?: string; author?: string; date?: string }>>("https://wg21.link/index.json")
      : null,
  ]);

  await Promise.all(
    items.map(async ({ key, kind, label }) => {
      if (kind === "pep" && peps) {
        const p = peps[key.slice(4)];
        if (!p) return;
        const year = p.created.match(/\d{4}/)?.[0];
        out[key] = {
          title: p.title,
          detail: [p.status, p.python_version ? `Python ${p.python_version}` : null, year].filter(Boolean).join(" · "),
        };
      } else if (kind === "wg21" && wg21) {
        let id = label;
        // "P2300" → newest revision in the index.
        if (!wg21[id] && /^P\d+$/.test(id)) {
          const revs = Object.keys(wg21).filter((k) => k.startsWith(`${id}R`) && /^P\d+R\d+$/.test(k));
          id = revs.sort((a, b) => Number(b.split("R")[1]) - Number(a.split("R")[1]))[0] ?? id;
        }
        const p = wg21[id];
        if (!p) return;
        out[key] = {
          title: p.title?.replace(/`/g, ""),
          detail: [id !== label ? id : null, p.author, p.date?.slice(0, 4)].filter(Boolean).join(" · "),
        };
      } else if (kind === "rfc") {
        const r = await getJson<{ title?: string; status?: string; pub_date?: string }>(
          `https://www.rfc-editor.org/rfc/rfc${key.slice(4)}.json`,
        );
        if (r?.title) out[key] = { title: r.title, detail: [r.status ? titleCase(r.status) : null, r.pub_date].filter(Boolean).join(" · ") };
      } else if (kind === "man") {
        const m = label.match(MAN);
        if (!m) return;
        try {
          const res = await fetch(`https://man7.org/linux/man-pages/man${m[2][0]}/${m[1]}.${m[2]}.html`, {
            signal: AbortSignal.timeout(TIMEOUT),
          });
          if (!res.ok) return;
          // NAME section: "epoll - I/O event notification facility"
          const name = (await res.text()).match(/id="NAME"[\s\S]*?<pre>\s*([\s\S]*?)<\/pre>/)?.[1];
          const summary = name?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").split(/\s+-\s+/).slice(1).join(" - ").trim();
          if (summary) out[key] = { title: summary, detail: `Linux manual page, section ${m[2]}` };
        } catch {}
      }
    }),
  );
  return out;
}
