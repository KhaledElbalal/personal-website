import { cacheLife } from "next/cache";

import { formatMonth } from "@/sanity/experience";
import type { ExperienceDoc } from "@/sanity/experience";

export type Stage = {
  id: string;
  title: string;
  organization: string;
  range: string;
  /** "2 years" / "5 months": how long the stage really took. */
  span: string;
  /** Length in months: drives each segment's share of the bar. */
  months: number;
};

const STAGE_TYPES = new Set(["job", "internship"]);

function monthIndex(date: string) {
  const [y, m] = date.split("-").map(Number);
  return y * 12 + (m - 1);
}

function words(months: number) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y) parts.push(`${y} year${y > 1 ? "s" : ""}`);
  if (m || !y) parts.push(`${m || 1} month${(m || 1) > 1 ? "s" : ""}`);
  return parts.join(" ");
}

/**
 * Work stages (jobs and internships, oldest first) with their real durations.
 * Cached because ongoing stages run to "now", which a prerender can't read
 * directly under Cache Components.
 */
export async function getCareerStages(docs: ExperienceDoc[]): Promise<Stage[]> {
  "use cache";
  cacheLife("days");
  const now = new Date();
  const nowIndex = now.getFullYear() * 12 + now.getMonth();

  return docs
    .filter(
      (d) =>
        d.type &&
        STAGE_TYPES.has(d.type) &&
        d.startDate &&
        // A stage with no end date can't be drawn to scale; it stays in the log.
        (d.current || d.endDate),
    )
    .sort((a, b) => (a.startDate ?? "").localeCompare(b.startDate ?? ""))
    .map((d) => {
      const start = monthIndex(d.startDate!);
      const end = d.current
        ? nowIndex
        : d.endDate
          ? monthIndex(d.endDate)
          : start;
      const months = Math.max(1, end - start);
      return {
        id: d._id,
        title: d.title ?? "",
        organization: d.organization ?? "",
        range: d.current
          ? `${formatMonth(d.startDate)} – now`
          : d.endDate
            ? `${formatMonth(d.startDate)} – ${formatMonth(d.endDate)}`
            : formatMonth(d.startDate),
        span: d.current ? `${words(months)} so far` : words(months),
        months,
      };
    });
}
