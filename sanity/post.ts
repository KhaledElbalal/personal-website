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
  code?: string;
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

/** ~200 wpm reading time, rounded up, minimum 1 minute. */
export function estimateReadingTime(body?: BodyBlock[] | null): number {
  if (!body) return 1;
  const words = body.reduce((total, b) => {
    if (b._type === "block") {
      const text = b.children?.map((c) => c.text ?? "").join(" ") ?? "";
      return total + text.split(/\s+/).filter(Boolean).length;
    }
    if (b._type === "code") {
      return total + (b.code?.split(/\s+/).filter(Boolean).length ?? 0);
    }
    return total;
  }, 0);
  return Math.max(1, Math.round(words / 200));
}
