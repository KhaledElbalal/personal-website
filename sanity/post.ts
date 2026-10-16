import { formatRange } from "./experience";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "2021-07-08" -> "July 08, 2021". */
function formatSingleDate(date?: string | null): string {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${day}, ${year}` : (year ?? "");
}

type PostDateDoc = {
  kind?: "project" | "post" | null;
  date?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean | null;
};

/**
 * Projects show a date range (startDate–endDate/Present, matching the
 * Qualifications timeline); posts show a single publish date. One helper
 * covers both since /projects and /blog share the same list/detail templates.
 */
export function formatPostDate(doc: PostDateDoc): string {
  if (doc.kind === "project") {
    return formatRange({
      startDate: doc.startDate ?? null,
      endDate: doc.endDate ?? null,
      current: doc.current ?? null,
    });
  }
  return formatSingleDate(doc.date);
}

type BodyBlock = {
  _type: string;
  _key: string;
  style?: string;
  children?: Array<{ text?: string }>;
  /** A code cell's source; a walkthrough's code cell. */
  code?: string | { code?: string | null } | null;
  tabs?: { code?: string | null }[] | null;
  body?: BodyBlock[] | null;
  steps?: { title?: string | null; text?: BodyBlock[] | null }[] | null;
};

export type Heading = { id: string; text: string; level: "h2" | "h3" };

/** Pulls h2/h3 blocks out of a Portable Text body for the TOC sidebar. */
export function extractHeadings(body?: BodyBlock[] | null): Heading[] {
  if (!body) return [];
  return body
    .filter(
      (b): b is BodyBlock & { style: "h2" | "h3" } =>
        b._type === "block" && (b.style === "h2" || b.style === "h3"),
    )
    .map((b) => ({
      id: `h-${b._key}`,
      text: b.children?.map((c) => c.text ?? "").join("") ?? "",
      level: b.style,
    }));
}

const countWords = (text?: string | null) => text?.split(/\s+/).filter(Boolean).length ?? 0;

function bodyWords(body: BodyBlock[]): number {
  return body.reduce((total, b) => {
    if (b._type === "block") return total + countWords(b.children?.map((c) => c.text ?? "").join(" "));
    if (b._type === "code") return total + countWords(typeof b.code === "string" ? b.code : null);
    // Tabs show one variant at a time: count the longest, not all of them.
    if (b._type === "codeTabs") return total + Math.max(0, ...(b.tabs ?? []).map((t) => countWords(t.code)));
    if (b._type === "callout") return total + bodyWords(b.body ?? []);
    if (b._type === "walkthrough") {
      const code = typeof b.code === "object" ? b.code?.code : null;
      const steps = (b.steps ?? []).reduce((n, s) => n + countWords(s.title) + bodyWords(s.text ?? []), 0);
      return total + countWords(code) + steps;
    }
    return total;
  }, 0);
}

/** ~200 wpm reading time, rounded up, minimum 1 minute. */
export function estimateReadingTime(body?: BodyBlock[] | null): number {
  if (!body) return 1;
  return Math.max(1, Math.round(bodyWords(body) / 200));
}
