import { Timeline } from "@/components/content/Timeline";
import { toTimelineEntries } from "@/sanity/experience";
import { sanityFetch } from "@/sanity/fetch";
import { EXPERIENCE_QUERY } from "@/sanity/queries";
import type { EXPERIENCE_QUERY_RESULT } from "@/sanity.types";

type ExperienceTimelineProps = {
  command?: string;
  className?: string;
};

/**
 * Server wrapper around <Timeline>: reads published `experience` docs and maps
 * them to git-log entries. Falls back to Timeline's built-in defaults if
 * nothing is published yet.
 */
export async function ExperienceTimeline({
  command,
  className,
}: ExperienceTimelineProps) {
  const docs = await sanityFetch<EXPERIENCE_QUERY_RESULT>(
    EXPERIENCE_QUERY,
    {},
    ["experience"],
  );
  const entries = toTimelineEntries(docs);

  return (
    <Timeline
      entries={entries.length ? entries : undefined}
      command={command}
      className={className}
    />
  );
}
