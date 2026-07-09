import type { TimelineEntry } from "@/components/content/Timeline";
import type { EXPERIENCE_QUERY_RESULT } from "@/sanity.types";

export type ExperienceDoc = EXPERIENCE_QUERY_RESULT[number];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** "2024-10-01" -> "Oct 2024". */
export function formatMonth(date?: string | null): string {
  if (!date) return "";
  const [year, month] = date.split("-");
  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${year}` : (year ?? "");
}

/** "Oct 2024 – Present" / "Aug 2024 – Oct 2024" / "Feb 2026". */
export function formatRange(
  doc: Pick<ExperienceDoc, "startDate" | "endDate" | "current">,
): string {
  const start = formatMonth(doc.startDate);
  if (doc.current) return `${start} – Present`;
  const end = formatMonth(doc.endDate);
  return end ? `${start} – ${end}` : start;
}

/** First 6 hex chars of the document id, as a git-style short hash. */
function shortHash(id: string): string {
  const hex = id.replace(/[^a-f0-9]/gi, "").toLowerCase();
  return (hex.slice(0, 6) || "000000").padEnd(6, "0");
}

/** Types that belong on the git-log Timeline (Home + Qualifications "Experience"). */
const TIMELINE_TYPES: ReadonlySet<string> = new Set([
  "job",
  "internship",
  "degree",
  "achievement",
]);

/**
 * Map experience docs (already ordered newest-first by EXPERIENCE_QUERY) to
 * git-log Timeline entries. The commit hash, ref and message are DERIVED here,
 * not stored: hash from _id, ref = HEAD when ongoing / `contest` for
 * achievements, message = conventional-commit prefix + title + org.
 */
export function toTimelineEntries(docs: ExperienceDoc[]): TimelineEntry[] {
  const rows = docs.filter((d) => d.type != null && TIMELINE_TYPES.has(d.type));
  return rows.map((doc, i) => {
    const title = doc.title ?? "";
    const org = doc.organization ? ` @ ${doc.organization}` : "";
    const isEarliest = i === rows.length - 1;

    let text: string;
    let ref: string | undefined;
    if (doc.type === "achievement") {
      text = `tag: ${title}`;
      ref = "contest";
    } else {
      text = `${isEarliest ? "init" : "feat"}: ${title}${org}`;
    }
    if (doc.current) ref = "HEAD";

    return {
      hash: shortHash(doc._id),
      text,
      ref,
      date: formatMonth(doc.startDate),
      detail: doc.detail ?? undefined,
    };
  });
}
